import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

ADMIN_USERNAME = "admin@rawy.com"
ADMIN_PASSWORD = "AdminPassword123!"

def test_get_auth_google_redirect_and_smoke_flow():
    session = requests.Session()

    # Step 1: Login as admin to get access token
    login_resp = session.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
        timeout=TIMEOUT,
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    tokens_data = login_resp.json().get("data", {})
    access_token = tokens_data.get("accessToken")
    refresh_token = tokens_data.get("refreshToken")
    assert access_token and refresh_token, "Tokens missing in login response"
    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 2: GET /api/v1/auth/google returns 302 redirect to Google OAuth consent page.
    google_resp = session.get(f"{BASE_URL}/api/v1/auth/google", allow_redirects=False, timeout=TIMEOUT)
    assert google_resp.status_code == 302, f"Expected 302 redirect, got {google_resp.status_code}"
    location = google_resp.headers.get("Location", "")
    assert "accounts.google.com" in location or "https://accounts.google.com" in location, f"Redirect location not Google OAuth page: {location}"

    # --------------- Begin Smoke Test Flow ---------------

    # Helper variables for cleanup
    created_podcast_id = None
    created_episode_id = None
    created_comment_id = None
    followed_creator_id = None

    try:
        # Step 3: Register a new user to act as normal user for engagement modules
        unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
        register_resp = session.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={"email": unique_email, "password": "TestPassword123!"},
            timeout=TIMEOUT,
        )
        assert register_resp.status_code == 201, f"User registration failed: {register_resp.text}"
        user_tokens_data = register_resp.json().get("data", {})
        user_access_token = user_tokens_data.get("accessToken")
        user_refresh_token = user_tokens_data.get("refreshToken")
        assert user_access_token and user_refresh_token, "User tokens missing after registration"
        user_headers = {"Authorization": f"Bearer {user_access_token}"}

        # Step 4: Become Creator using the new user
        become_creator_resp = session.post(
            f"{BASE_URL}/api/v1/creators/become",
            headers=user_headers,
            json={
                "name": "Test Creator",
                "bio": "Automated test creator",
                "website": "https://example.com"
            },
            timeout=TIMEOUT,
        )
        assert become_creator_resp.status_code == 201, f"Become creator failed: {become_creator_resp.text}"
        creator_info = become_creator_resp.json()
        followed_creator_id = creator_info.get("id") or creator_info.get("_id")
        assert followed_creator_id, "Creator ID missing after becoming creator"

        # Step 5: Another user must follow the creator
        # Use admin user here for following creator
        follow_resp = session.post(
            f"{BASE_URL}/api/v1/follows/creators/{followed_creator_id}",
            headers=headers,
            timeout=TIMEOUT,
        )
        assert follow_resp.status_code == 201, f"Follow creator failed: {follow_resp.text}"

        # Step 6: Admin creates a podcast to post episode
        create_podcast_resp = session.post(
            f"{BASE_URL}/api/v1/podcasts",
            headers=headers,
            json={
                "title": "Test Podcast",
                "description": "Created for smoke test",
                "coverImage": "https://example.com/cover.jpg"
            },
            timeout=TIMEOUT,
        )
        assert create_podcast_resp.status_code == 201, f"Podcast creation failed: {create_podcast_resp.text}"
        podcast_info = create_podcast_resp.json()
        created_podcast_id = podcast_info.get("id") or podcast_info.get("_id")
        assert created_podcast_id, "Podcast ID missing after creation"

        # Step 7: Create an episode under the podcast - audio upload is required,
        # but file upload not detailed in PRD, so simulate with a field "audioUrl" or similar if supported
        # We'll attempt with minimal required fields: title, description and a placeholder for audio

        create_episode_resp = session.post(
            f"{BASE_URL}/api/v1/episodes",
            headers=headers,
            json={
                "podcastId": created_podcast_id,
                "title": "Test Episode",
                "description": "Episode for engagement smoke test",
                "audioUrl": "https://example.com/audio.mp3"  # assuming this is accepted for test purposes
            },
            timeout=TIMEOUT,
        )
        assert create_episode_resp.status_code == 201, f"Episode creation failed: {create_episode_resp.text}"
        episode_info = create_episode_resp.json()
        created_episode_id = episode_info.get("id") or episode_info.get("_id")
        assert created_episode_id, "Episode ID missing after creation"

        # Step 8: Post a comment on the episode using user (not admin)
        comment_resp = session.post(
            f"{BASE_URL}/api/v1/comments/episodes/{created_episode_id}",
            headers=user_headers,
            json={"text": "This is a test comment."},
            timeout=TIMEOUT,
        )
        assert comment_resp.status_code == 201, f"Posting comment failed: {comment_resp.text}"
        comment_info = comment_resp.json()
        created_comment_id = comment_info.get("id") or comment_info.get("_id")
        assert created_comment_id, "Comment ID missing after creation"

        # Step 9: Like that comment (Likes API is for episodes only per PRD, but instructions note comment-likes module)
        # Comments likes not explicitly in PRD, so likely commenting means liking episodes or comments via episode likes.
        # We'll like the episode (since comment-like endpoint not defined)
        like_resp = session.post(
            f"{BASE_URL}/api/v1/likes/episodes/{created_episode_id}",
            headers=user_headers,
            timeout=TIMEOUT,
        )
        assert like_resp.status_code == 201, f"Liking episode failed: {like_resp.text}"

        # Step 10: Check notifications for the recipient (creator) who should get notified on engagement
        notifications_resp = session.get(
            f"{BASE_URL}/api/v1/notifications",
            headers=headers,  # admin user acts as creator follower and podcast owner
            timeout=TIMEOUT,
        )
        assert notifications_resp.status_code == 200, f"Fetching notifications failed: {notifications_resp.text}"
        notifications = notifications_resp.json()
        assert isinstance(notifications, list), "Notifications response is not a list"

        # Step 11: Verify feed response for the user (probably /api/v1/feed or similar; not explicitly in PRD)
        feed_resp = session.get(
            f"{BASE_URL}/api/v1/feed",
            headers=user_headers,
            timeout=TIMEOUT,
        )
        assert feed_resp.status_code == 200, f"Fetching feed failed: {feed_resp.text}"
        feed_data = feed_resp.json()
        assert isinstance(feed_data, list), "Feed response is not a list"

    finally:
        # Cleanup resources created
        # Delete comment
        if created_comment_id:
            session.delete(
                f"{BASE_URL}/api/v1/comments/{created_comment_id}",
                headers=user_headers,
                timeout=TIMEOUT,
            )
        # Unlike episode
        if created_episode_id:
            session.delete(
                f"{BASE_URL}/api/v1/likes/episodes/{created_episode_id}",
                headers=user_headers,
                timeout=TIMEOUT,
            )
        # Delete episode
        if created_episode_id:
            session.delete(
                f"{BASE_URL}/api/v1/episodes/{created_episode_id}",
                headers=headers,
                timeout=TIMEOUT,
            )
        # Delete podcast
        if created_podcast_id:
            session.delete(
                f"{BASE_URL}/api/v1/podcasts/{created_podcast_id}",
                headers=headers,
                timeout=TIMEOUT,
            )
        # Unfollow creator
        if followed_creator_id:
            session.delete(
                f"{BASE_URL}/api/v1/follows/creators/{followed_creator_id}",
                headers=headers,
                timeout=TIMEOUT,
            )

test_get_auth_google_redirect_and_smoke_flow()
