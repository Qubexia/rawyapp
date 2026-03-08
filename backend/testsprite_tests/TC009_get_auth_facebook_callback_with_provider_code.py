import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
ADMIN_CREDENTIALS = {"username": "admin@rawy.com", "password": "AdminPassword123!"}

def test_get_auth_facebook_callback_with_provider_code():
    session = requests.Session()
    try:
        # 1) Register a new user
        unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
        password = "TestPass123!"
        register_payload = {
            "email": unique_email,
            "password": password
        }
        r = session.post(
            f"{BASE_URL}/api/v1/auth/register",
            json=register_payload,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Register failed: {r.text}"
        token_response = r.json()
        access_token = token_response.get("access")
        refresh_token = token_response.get("refresh")
        assert access_token and refresh_token, "Tokens missing in register response"
        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # 2) User becomes a creator
        become_creator_payload = {
            "name": f"Creator {unique_email}",
            "bio": "Test creator bio"
        }
        r = session.post(
            f"{BASE_URL}/api/v1/creators/become",
            json=become_creator_payload,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Become creator failed: {r.text}"
        creator = r.json()
        creator_id = creator.get("id")
        assert creator_id, "No creator ID"

        # 3) Create a podcast (required to create episode)
        podcast_payload = {
            "title": f"Podcast {unique_email}",
            "description": "Test podcast description",
            "coverImage": "http://example.com/image.jpg"
        }
        r = session.post(
            f"{BASE_URL}/api/v1/podcasts",
            json=podcast_payload,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Podcast creation failed: {r.text}"
        podcast = r.json()
        podcast_id = podcast.get("id")
        assert podcast_id, "No podcast ID"

        # 4) Create an episode
        # As audio upload likely required, we'll simulate minimal episode info without real file upload
        # The PRD says audio file required; thus test requires a minimal audio file upload
        # We'll do a multipart/form-data request with a dummy audio file content
        multipart_data = {
            "title": (None, f"Episode {unique_email}"),
            "description": (None, "Test episode description"),
            # For audio file, send dummy content as a BytesIO with proper mime type
        }
        from io import BytesIO
        audio_content = BytesIO(b"Dummy audio content")
        multipart_data["audio"] = ("audio.mp3", audio_content, "audio/mpeg")

        r = session.post(
            f"{BASE_URL}/api/v1/episodes",
            files=multipart_data,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Episode creation failed: {r.text}"
        episode = r.json()
        episode_id = episode.get("id")
        assert episode_id, "No episode ID"

        # 5) Register a second user who will follow the creator, comment and like comment
        unique_email_2 = f"testuser2_{uuid.uuid4().hex[:8]}@example.com"
        register_payload_2 = {
            "email": unique_email_2,
            "password": password
        }
        r = session.post(
            f"{BASE_URL}/api/v1/auth/register",
            json=register_payload_2,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Second register failed: {r.text}"
        token_response_2 = r.json()
        access_token_2 = token_response_2.get("access")
        refresh_token_2 = token_response_2.get("refresh")
        assert access_token_2 and refresh_token_2, "Tokens missing for second user"
        auth_headers_2 = {"Authorization": f"Bearer {access_token_2}"}

        # 6) Second user becomes a creator (to enable following)
        become_creator_payload_2 = {
            "name": f"Creator {unique_email_2}",
            "bio": "Second user test creator bio"
        }
        r = session.post(
            f"{BASE_URL}/api/v1/creators/become",
            json=become_creator_payload_2,
            headers=auth_headers_2,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Second user become creator failed: {r.text}"
        creator_2 = r.json()
        creator_id_2 = creator_2.get("id")
        assert creator_id_2, "No creator ID for second user"

        # 7) Second user follows first creator
        r = session.post(
            f"{BASE_URL}/api/v1/follows/creators/{creator_id}",
            headers=auth_headers_2,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Follow creator failed: {r.text}"

        # 8) Second user posts a comment on the episode
        comment_payload = {"text": "Great episode!"}
        r = session.post(
            f"{BASE_URL}/api/v1/comments/episodes/{episode_id}",
            json=comment_payload,
            headers=auth_headers_2,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Post comment failed: {r.text}"
        comment = r.json()
        comment_id = comment.get("id")
        assert comment_id, "No comment ID"

        # 9) Second user likes that comment (Likes API is only for episodes, so liking comment likely unsupported)
        # The PRD only indicates Likes API for episodes, not comments.
        # So liking comment is ambiguous; hence we skip liking comment - instead like the episode.
        r = session.post(
            f"{BASE_URL}/api/v1/likes/episodes/{episode_id}",
            headers=auth_headers_2,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Like episode failed: {r.text}"

        # 10) Check notifications for first creator (the recipient who got new episode/engagement)
        r = session.get(
            f"{BASE_URL}/api/v1/notifications",  # Endpoint not listed in PRD - assume it exists as notifications are new engagement modules
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Get notifications failed: {r.text}"
        notifications = r.json()
        # Verify notifications contain an entry related to episodes/comments/follows
        assert isinstance(notifications, list), "Notifications not a list"
        assert any(
            n for n in notifications
            if any(
                key in n.get("type", "").lower()
                for key in ("follow", "comment", "like", "episode")
            )
        ), "No relevant notification found"

        # 11) Verify feed response for first creator (assuming /api/v1/feed)
        r = session.get(
            f"{BASE_URL}/api/v1/feed",
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Get feed failed: {r.text}"
        feed = r.json()
        assert isinstance(feed, list), "Feed not returned as list"
        # Feed should contain at least the episode created or engagement
        assert any(
            e for e in feed
            if e.get("id") == episode_id
        ), "Episode not found in feed"

        # 12) Finally, perform the target test: GET /api/v1/auth/facebook/callback with a valid provider code
        # Since no real Facebook provider code is available, simulate with a valid provider code param
        # PRD expects to get 200 with TokenResponse containing access and refresh tokens
        # We will use a dummy 'validcode123' as provider code
        params = {"code": "validcode123"}
        r = session.get(
            f"{BASE_URL}/api/v1/auth/facebook/callback",
            params=params,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Facebook callback failed: {r.text}"
        token_resp = r.json()
        assert "access" in token_resp and "refresh" in token_resp, "TokenResponse missing tokens"

    finally:
        # Cleanup: delete created resources

        # Delete comment
        if 'comment_id' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/comments/{comment_id}",
                headers=auth_headers_2,
                timeout=TIMEOUT
            )
        # Second user unfollows first creator
        if 'creator_id' in locals() and 'auth_headers_2' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/follows/creators/{creator_id}",
                headers=auth_headers_2,
                timeout=TIMEOUT
            )
        # Unlike episode by second user
        if 'episode_id' in locals() and 'auth_headers_2' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/likes/episodes/{episode_id}",
                headers=auth_headers_2,
                timeout=TIMEOUT
            )
        # Delete episode
        if 'episode_id' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/episodes/{episode_id}",
                headers=auth_headers,
                timeout=TIMEOUT
            )
        # Delete podcast
        if 'podcast_id' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/podcasts/{podcast_id}",
                headers=auth_headers,
                timeout=TIMEOUT
            )
        # No delete for creators endpoint given in PRD, skip

        # No explicit user deletion endpoints noted, so we skip user deletion

test_get_auth_facebook_callback_with_provider_code()
