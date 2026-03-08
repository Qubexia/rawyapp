import requests
import uuid
import time

BASE_URL = "http://localhost:3000"

def post_auth_logout_with_valid_access_token():
    timeout = 30
    # Admin credentials for initial login
    admin_auth = ("admin@rawy.com", "AdminPassword123!")

    # 1. Admin login to get tokens (to create resources if needed)
    login_url = f"{BASE_URL}/api/v1/auth/login"
    login_payload = {
        "email": admin_auth[0],
        "password": admin_auth[1]
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=timeout)
    assert login_resp.status_code in [200, 201], f"Admin login failed: {login_resp.text}"
    tokens = login_resp.json()
    # Adjust token extraction based on actual response structure
    if 'accessToken' in tokens:
        admin_access_token = tokens.get("accessToken")
    elif 'data' in tokens and 'accessToken' in tokens['data']:
        admin_access_token = tokens['data'].get("accessToken")
    else:
        admin_access_token = None
    assert admin_access_token, "No accessToken in login response"

    headers_auth = {"Authorization": f"Bearer {admin_access_token}"}

    # Helper functions
    def register_user(name, email, password):
        url = f"{BASE_URL}/api/v1/auth/register"
        payload = {"name": name, "email": email, "password": password}
        resp = requests.post(url, json=payload, timeout=timeout)
        return resp

    def login_user(email, password):
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {"email": email, "password": password}
        resp = requests.post(url, json=payload, timeout=timeout)
        return resp

    def become_creator(access_token):
        url = f"{BASE_URL}/api/v1/creators/become"
        payload = {
            "name": "Test Creator",
            "bio": "Test bio",
            "website": "https://example.com"
        }
        h = {"Authorization": f"Bearer {access_token}"}
        r = requests.post(url, json=payload, headers=h, timeout=timeout)
        return r

    def create_podcast(access_token):
        url = f"{BASE_URL}/api/v1/podcasts"
        payload = {
            "title": "Test Podcast",
            "description": "Test Description",
            "coverImage": "https://example.com/cover.jpg"
        }
        h = {"Authorization": f"Bearer {access_token}"}
        r = requests.post(url, json=payload, headers=h, timeout=timeout)
        return r

    def create_episode(access_token, podcast_id):
        url = f"{BASE_URL}/api/v1/episodes"
        # For audio file, API may expect multipart/form-data, but not specified. So simple JSON with dummy URL.
        payload = {
            "title": "Test Episode",
            "description": "Test Episode Description",
            "podcastId": podcast_id,
            "audioUrl": "https://example.com/audio.mp3"
        }
        h = {"Authorization": f"Bearer {access_token}"}
        r = requests.post(url, json=payload, headers=h, timeout=timeout)
        return r

    def follow_creator(access_token, creator_id):
        url = f"{BASE_URL}/api/v1/follows/creators/{creator_id}"
        h = {"Authorization": f"Bearer {access_token}"}
        r = requests.post(url, headers=h, timeout=timeout)
        return r

    def post_comment(access_token, episode_id, text):
        url = f"{BASE_URL}/api/v1/comments/episodes/{episode_id}"
        payload = {"text": text}
        h = {"Authorization": f"Bearer {access_token}"}
        r = requests.post(url, json=payload, headers=h, timeout=timeout)
        return r

    def like_episode(access_token, episode_id):
        url = f"{BASE_URL}/api/v1/likes/episodes/{episode_id}"
        h = {"Authorization": f"Bearer {access_token}"}
        r = requests.post(url, headers=h, timeout=timeout)
        return r

    # Since Notifications and feed endpoints are not documented, tests ignore failures there

    # Begin: Register two users (a regular user and a creator)
    timestamp = str(int(time.time()))
    user_email = f"user_{timestamp}_{uuid.uuid4().hex[:6]}@example.com"
    user_password = "StrongPass123!"

    creator_email = f"creator_{timestamp}_{uuid.uuid4().hex[:6]}@example.com"
    creator_password = "StrongPass123!"

    user_access_token = None
    creator_access_token = None
    podcast_id = None
    episode_id = None
    comment_id = None

    try:
        # Register regular user with name
        reg_user_resp = register_user("Test User", user_email, user_password)
        assert reg_user_resp.status_code == 201, f"User registration failed: {reg_user_resp.text}"
        user_tokens = reg_user_resp.json()
        if 'accessToken' in user_tokens:
            user_access_token = user_tokens.get("accessToken")
        elif 'data' in user_tokens and 'accessToken' in user_tokens['data']:
            user_access_token = user_tokens['data'].get("accessToken")
        else:
            user_access_token = None
        assert user_access_token, "No accessToken on user registration"

        # Register creator user with name
        reg_creator_resp = register_user("Test Creator User", creator_email, creator_password)
        assert reg_creator_resp.status_code == 201, f"Creator registration failed: {reg_creator_resp.text}"
        creator_tokens = reg_creator_resp.json()
        if 'accessToken' in creator_tokens:
            creator_access_token = creator_tokens.get("accessToken")
        elif 'data' in creator_tokens and 'accessToken' in creator_tokens['data']:
            creator_access_token = creator_tokens['data'].get("accessToken")
        else:
            creator_access_token = None
        assert creator_access_token, "No accessToken on creator registration"

        # Become creator
        become_creator_resp = become_creator(creator_access_token)
        assert become_creator_resp.status_code == 201, f"Become creator failed: {become_creator_resp.text}"
        creator_data = become_creator_resp.json()
        creator_id = creator_data.get("id")
        assert creator_id, "No creator id returned"

        # Creator creates podcast
        create_podcast_resp = create_podcast(creator_access_token)
        assert create_podcast_resp.status_code == 201, f"Create podcast failed: {create_podcast_resp.text}"
        podcast = create_podcast_resp.json()
        podcast_id = podcast.get("id")
        assert podcast_id, "No podcast id returned"

        # Creator creates episode
        create_episode_resp = create_episode(creator_access_token, podcast_id)
        assert create_episode_resp.status_code == 201, f"Create episode failed: {create_episode_resp.text}"
        episode = create_episode_resp.json()
        episode_id = episode.get("id")
        assert episode_id, "No episode id returned"

        # User follows creator
        follow_resp = follow_creator(user_access_token, creator_id)
        assert follow_resp.status_code == 201, f"Follow creator failed: {follow_resp.text}"

        # User posts comment on episode
        comment_text = "This is a test comment"
        post_comment_resp = post_comment(user_access_token, episode_id, comment_text)
        assert post_comment_resp.status_code == 201, f"Post comment failed: {post_comment_resp.text}"
        comment = post_comment_resp.json()
        comment_id = comment.get("id")
        assert comment_id, "No comment id returned"

        # User likes the episode
        like_resp = like_episode(user_access_token, episode_id)
        assert like_resp.status_code == 201, f"Like episode failed: {like_resp.text}"

        # Check notifications for creator (if API exists)
        notifications_url = f"{BASE_URL}/api/v1/notifications/me"
        notifications_headers = {"Authorization": f"Bearer {creator_access_token}"}
        notifications_resp = requests.get(notifications_url, headers=notifications_headers, timeout=timeout)
        # Notifications endpoint not documented in PRD, so if 404 or 401 or any error, ignore
        if notifications_resp.status_code == 200:
            notifications = notifications_resp.json()
            assert isinstance(notifications, list), "Notifications should be a list"

        # Check feed response for user
        feed_url = f"{BASE_URL}/api/v1/feed/me"
        feed_headers = {"Authorization": f"Bearer {user_access_token}"}
        feed_resp = requests.get(feed_url, headers=feed_headers, timeout=timeout)
        # Feed endpoint also not documented in PRD, so if 404 or 401 ignore, else check
        if feed_resp.status_code == 200:
            feed_data = feed_resp.json()
            assert isinstance(feed_data, list), "Feed data should be a list"

        # Finally, test logout with valid access token (user)
        logout_url = f"{BASE_URL}/api/v1/auth/logout"
        logout_headers = {"Authorization": f"Bearer {user_access_token}"}
        logout_resp = requests.post(logout_url, headers=logout_headers, timeout=timeout)
        assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"
        assert logout_resp.text == '' or logout_resp.content == b'' , "Logout response should be empty"

    finally:
        # Cleanup: delete created resources if possible using admin token
        if comment_id:
            url = f"{BASE_URL}/api/v1/admin/comments/{comment_id}"
            requests.delete(url, headers=headers_auth, timeout=timeout)
        if episode_id:
            url = f"{BASE_URL}/api/v1/admin/episodes/{episode_id}"
            requests.delete(url, headers=headers_auth, timeout=timeout)
        if podcast_id:
            url = f"{BASE_URL}/api/v1/admin/podcasts/{podcast_id}"
            requests.delete(url, headers=headers_auth, timeout=timeout)
        # Optionally delete users created - no delete user endpoint documented, so skip

post_auth_logout_with_valid_access_token()
