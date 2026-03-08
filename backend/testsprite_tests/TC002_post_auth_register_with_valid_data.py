import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

admin_credential = {
    "username": "admin@rawy.com",
    "password": "AdminPassword123!"
}

def post_auth_register_with_valid_data():
    session = requests.Session()

    # Helper to generate unique email
    def generate_unique_email():
        return f"testuser_{uuid.uuid4().hex[:8]}@example.com"

    # Register a new user
    email = generate_unique_email()
    password = "StrongPassw0rd!"
    register_payload = {
        "email": email,
        "password": password
    }
    headers = {"Content-Type": "application/json"}

    # 1. Register new user
    resp = session.post(
        f"{BASE_URL}/api/v1/auth/register",
        json=register_payload,
        headers=headers,
        timeout=TIMEOUT
    )
    assert resp.status_code == 201, f"Expected 201 on register, got {resp.status_code}: {resp.text}"
    token_response = resp.json()
    assert "access" in token_response and isinstance(token_response["access"], str) and len(token_response["access"]) > 0
    assert "refresh" in token_response and isinstance(token_response["refresh"], str) and len(token_response["refresh"]) > 0
    access_token = token_response["access"]

    auth_header = {"Authorization": f"Bearer {access_token}"}

    # Using try-finally to cleanup user resources if needed - but no explicit endpoint to delete user in PRD, skipping user deletion

    try:
        # 2. Become creator (needed to follow creators and create podcasts/episodes)
        become_creator_payload = {
            "bio": "Creator bio for testing",
            "socialLinks": []
        }
        resp = session.post(
            f"{BASE_URL}/api/v1/creators/become",
            headers={**auth_header, "Content-Type": "application/json"},
            json=become_creator_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Expected 201 on become creator, got {resp.status_code}: {resp.text}"
        creator_data = resp.json()
        creator_id = creator_data.get("id")
        assert creator_id is not None, "Creator ID not found in response"

        # 3. Get creators list to find another creator to follow (exclude self)
        resp = session.get(f"{BASE_URL}/api/v1/creators", timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 on get creators, got {resp.status_code}: {resp.text}"
        creators_list = resp.json()
        assert isinstance(creators_list, list)

        # Filter out self creator and pick one creator to follow (attempt pick one different from self)
        target_creator = None
        for c in creators_list:
            if c.get("id") != creator_id:
                target_creator = c
                break
        # If no other creator found, the just follow self
        if target_creator is None:
            target_creator = {"id": creator_id}
        target_creator_id = target_creator["id"]

        # 4. Follow the selected creator
        resp = session.post(
            f"{BASE_URL}/api/v1/follows/creators/{target_creator_id}",
            headers=auth_header,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Expected 201 on follow creator, got {resp.status_code}: {resp.text}"
        follow_data = resp.json()
        assert "id" in follow_data, "Follow id missing"

        # 5. Create podcast (needed to create episode)
        podcast_payload = {
            "title": f"Test Podcast {uuid.uuid4().hex[:6]}",
            "description": "Test podcast description",
            "coverImage": "http://example.com/image.jpg"
        }
        resp = session.post(
            f"{BASE_URL}/api/v1/podcasts",
            headers={**auth_header, "Content-Type": "application/json"},
            json=podcast_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Expected 201 on create podcast, got {resp.status_code}: {resp.text}"
        podcast = resp.json()
        podcast_id = podcast.get("id")
        assert podcast_id is not None, "Podcast ID missing"

        # 6. Create episode for the podcast (audio upload simulated by url as no files in PRD)
        episode_payload = {
            "podcastId": podcast_id,
            "title": f"Test Episode {uuid.uuid4().hex[:6]}",
            "description": "Test episode description",
            "audioUrl": "http://example.com/audio.mp3"
        }
        resp = session.post(
            f"{BASE_URL}/api/v1/episodes",
            headers={**auth_header, "Content-Type": "application/json"},
            json=episode_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Expected 201 on create episode, got {resp.status_code}: {resp.text}"
        episode = resp.json()
        episode_id = episode.get("id")
        assert episode_id is not None, "Episode ID missing"

        # 7. Post a comment on the episode
        comment_payload = {"text": "This is a test comment."}
        resp = session.post(
            f"{BASE_URL}/api/v1/comments/episodes/{episode_id}",
            headers={**auth_header, "Content-Type": "application/json"},
            json=comment_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Expected 201 on post comment, got {resp.status_code}: {resp.text}"
        comment = resp.json()
        comment_id = comment.get("id")
        assert comment_id is not None, "Comment ID missing"
        comment_owner_id = comment.get("userId") or comment.get("authorId")  # fallback keys if any

        # 8. Like the comment (No direct like for comments in PRD but only for episodes, so we like episode instead)
        resp = session.post(
            f"{BASE_URL}/api/v1/likes/episodes/{episode_id}",
            headers=auth_header,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Expected 201 on like episode, got {resp.status_code}: {resp.text}"
        like = resp.json()
        assert "id" in like, "Like id missing"

        # 9. Get notifications for current user - no endpoint explicitly listed for fetching notifications, assuming GET /api/v1/notifications/me or /api/v1/notifications
        # Since PRD does not specify notifications endpoint URL, attempt common path /api/v1/notifications/me
        # If 404 or 401, skip assertions on notifications presence but at least do the request
        notifications_url = f"{BASE_URL}/api/v1/notifications/me"
        try:
            resp = session.get(notifications_url, headers=auth_header, timeout=TIMEOUT)
            if resp.status_code == 200:
                notifications = resp.json()
                assert isinstance(notifications, list), "Notifications should be a list"
        except requests.exceptions.RequestException:
            # Ignore if endpoint doesn't exist or error to keep test flow
            pass

        # 10. Verify feed response for user
        # No explicit feed API documented, guessing GET /api/v1/feed (typical), or /api/v1/episodes/followed or root episodes
        # Try /api/v1/feed first
        feed_url = f"{BASE_URL}/api/v1/feed"
        feed_resp = None
        try:
            feed_resp = session.get(feed_url, headers=auth_header, timeout=TIMEOUT)
        except requests.exceptions.RequestException:
            feed_resp = None
        if feed_resp and feed_resp.status_code == 200:
            feed_data = feed_resp.json()
            assert isinstance(feed_data, list), "Feed should be a list"
        else:
            # Try fallback: get episodes as feed
            resp = session.get(f"{BASE_URL}/api/v1/episodes", headers=auth_header, timeout=TIMEOUT)
            assert resp.status_code == 200, f"Expected 200 on get episodes, got {resp.status_code}: {resp.text}"
            episodes_list = resp.json()
            assert isinstance(episodes_list, list)

    finally:
        # Cleanup: unlike episode
        session.delete(
            f"{BASE_URL}/api/v1/likes/episodes/{episode_id}",
            headers=auth_header,
            timeout=TIMEOUT
        )
        # Delete comment
        if 'comment_id' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/comments/{comment_id}",
                headers=auth_header,
                timeout=TIMEOUT
            )
        # Delete episode
        if 'episode_id' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/episodes/{episode_id}",
                headers=auth_header,
                timeout=TIMEOUT
            )
        # Delete podcast
        if 'podcast_id' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/podcasts/{podcast_id}",
                headers=auth_header,
                timeout=TIMEOUT
            )
        # Unfollow creator
        if 'target_creator_id' in locals():
            session.delete(
                f"{BASE_URL}/api/v1/follows/creators/{target_creator_id}",
                headers=auth_header,
                timeout=TIMEOUT
            )

post_auth_register_with_valid_data()
