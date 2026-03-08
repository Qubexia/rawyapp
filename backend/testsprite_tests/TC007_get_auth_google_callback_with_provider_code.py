import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

admin_credential = {"email": "admin@rawy.com", "password": "AdminPassword123!"}

def test_get_auth_google_callback_with_provider_code():
    # Step 1: Admin login to get access token for other actions if needed
    login_resp = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": admin_credential["email"], "password": admin_credential["password"]},
        timeout=TIMEOUT,
    )
    assert login_resp.status_code == 200, "Admin login failed"
    admin_tokens = login_resp.json()
    assert "access_token" in admin_tokens and "refresh_token" in admin_tokens

    headers_admin = {"Authorization": f"Bearer {admin_tokens['access_token']}"}

    # Helper functions to create user, become creator, post episode, follow, comment, like, get notifications, verify feed

    # Step 2: Register a new user
    unique_email = f"testuser_{uuid.uuid4().hex}@example.com"
    register_payload = {
        "email": unique_email,
        "password": "TestPassword123!"
    }
    register_resp = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json=register_payload,
        timeout=TIMEOUT,
    )
    assert register_resp.status_code == 201, "User registration failed"
    tokens = register_resp.json()
    assert "access_token" in tokens and "refresh_token" in tokens
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    user_access_token = tokens['access_token']

    # Step 3: Become creator
    become_creator_payload = {
        "name": "Test Creator",
        "bio": "Test bio for creator"
    }
    become_creator_resp = requests.post(
        f"{BASE_URL}/api/v1/creators/become",
        headers=headers,
        json=become_creator_payload,
        timeout=TIMEOUT,
    )
    assert become_creator_resp.status_code == 201, "Become creator failed"
    creator = become_creator_resp.json()
    creator_id = creator.get("id") or creator.get("_id")
    assert creator_id is not None

    # Step 4: Create podcast
    podcast_payload = {
        "title": "Test Podcast",
        "description": "Test podcast description",
        "cover_image": "http://example.com/image.jpg"
    }
    create_podcast_resp = requests.post(
        f"{BASE_URL}/api/v1/podcasts",
        headers=headers,
        json=podcast_payload,
        timeout=TIMEOUT,
    )
    assert create_podcast_resp.status_code == 201, "Create podcast failed"
    podcast = create_podcast_resp.json()
    podcast_id = podcast.get("id") or podcast.get("_id")
    assert podcast_id is not None

    # Step 5: Create episode with required audio file upload
    # Using multipart/form-data with a dummy audio file for upload
    episode_title = "Test Episode"
    episode_description = "Test episode description"
    files = {
        'audio': ('test_audio.mp3', b'This is test audio content', 'audio/mpeg')
    }
    data = {
        'title': episode_title,
        'description': episode_description
    }
    create_episode_resp = requests.post(
        f"{BASE_URL}/api/v1/episodes",
        headers={**headers},
        files=files,
        data=data,
        timeout=TIMEOUT,
    )
    assert create_episode_resp.status_code == 201, "Create episode failed"
    episode = create_episode_resp.json()
    episode_id = episode.get("id") or episode.get("_id")
    assert episode_id is not None

    # Step 6: Register a second user to perform follow, comment, like and receive notifications
    follower_email = f"follower_{uuid.uuid4().hex}@example.com"
    follower_register_resp = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json={"email": follower_email, "password": "FollowerPass123!"},
        timeout=TIMEOUT,
    )
    assert follower_register_resp.status_code == 201, "Follower user registration failed"
    follower_tokens = follower_register_resp.json()
    follower_headers = {"Authorization": f"Bearer {follower_tokens['access_token']}"}

    # Step 7: Follower becomes creator to enable follow step if needed
    follower_become_creator_payload = {
        "name": "Follower Creator",
        "bio": "Follower creator bio"
    }
    follower_become_creator_resp = requests.post(
        f"{BASE_URL}/api/v1/creators/become",
        headers=follower_headers,
        json=follower_become_creator_payload,
        timeout=TIMEOUT,
    )
    # Follower becoming creator might be optional to follow creators, but if follows require creatorId from creators, do final check
    if follower_become_creator_resp.status_code not in (201, 400):
        assert False, "Follower becoming creator failed with unexpected code"
    # We don't necessarily need follower's creator id for follow, as the user follows the first creator (creator_id)
    
    # Step 8: Follower follows the creator
    follow_resp = requests.post(
        f"{BASE_URL}/api/v1/follows/creators/{creator_id}",
        headers=follower_headers,
        timeout=TIMEOUT,
    )
    assert follow_resp.status_code == 201, "Follow creator failed"

    # Step 9: Follower posts a comment on the episode
    comment_payload = {"text": "This is a test comment"}
    comment_resp = requests.post(
        f"{BASE_URL}/api/v1/comments/episodes/{episode_id}",
        headers=follower_headers,
        json=comment_payload,
        timeout=TIMEOUT,
    )
    assert comment_resp.status_code == 201, "Post comment failed"
    comment = comment_resp.json()
    comment_id = comment.get("id") or comment.get("_id")
    assert comment_id is not None

    # Step 10: Like the episode which contains the comment

    like_resp = requests.post(
        f"{BASE_URL}/api/v1/likes/episodes/{episode_id}",
        headers=follower_headers,
        timeout=TIMEOUT,
    )
    assert like_resp.status_code == 201, "Like episode failed"

    # Step 11: Check notifications for the original creator
    notifications_resp = requests.get(
        f"{BASE_URL}/api/v1/notifications/me",
        headers=headers,
        timeout=TIMEOUT,
    )
    if notifications_resp.status_code == 200:
        notifications = notifications_resp.json()
        assert isinstance(notifications, list), "Notifications response should be a list"
    else:
        assert notifications_resp.status_code == 404 or notifications_resp.status_code == 200

    # Step 12: Verify feed response for the follower
    feed_resp = requests.get(
        f"{BASE_URL}/api/v1/feed",
        headers=follower_headers,
        timeout=TIMEOUT,
    )
    if feed_resp.status_code == 200:
        feed = feed_resp.json()
        assert isinstance(feed, list), "Feed response should be a list"
        assert any(
            (item.get("id") == episode_id or item.get("_id") == episode_id) for item in feed
        ), "Feed should contain the created episode"
    else:
        assert feed_resp.status_code == 404 or feed_resp.status_code == 200

    # Step 13: Verify GET /api/v1/auth/google/callback with a valid provider code returns 200 with tokens
    google_callback_resp = requests.get(
        f"{BASE_URL}/api/v1/auth/google/callback",
        params={"code": "valid-code"},
        timeout=TIMEOUT,
    )
    assert google_callback_resp.status_code == 200, "Google callback failed"
    token_response = google_callback_resp.json()
    assert "access_token" in token_response and "refresh_token" in token_response

test_get_auth_google_callback_with_provider_code()
