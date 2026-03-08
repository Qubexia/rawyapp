import requests
import uuid
import time

BASE_URL = "http://localhost:3000"

ADMIN_USERNAME = "admin@rawy.com"
ADMIN_PASSWORD = "AdminPassword123!"

def test_get_health_check_with_full_engagement_flow():
    timeout = 30
    session = requests.Session()

    # Helper function: admin login to get tokens (used for initial admin tasks if needed)
    def admin_login():
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {"email": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        resp = session.post(url, json=payload, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        assert "access" in data and "refresh" in data, "Missing access or refresh token in admin login response"
        return data["access"], data["refresh"]

    # Helper function: register user (returns tokens and user info)
    def register_user(email, password):
        url = f"{BASE_URL}/api/v1/auth/register"
        payload = {"email": email, "password": password}
        resp = session.post(url, json=payload, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        assert "access" in data and "refresh" in data, "Missing access or refresh token in register response"
        return data["access"], data["refresh"]

    # Helper function: become creator (returns creator info)
    def become_creator(access_token, creator_data):
        url = f"{BASE_URL}/api/v1/creators/become"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = session.post(url, json=creator_data, headers=headers, timeout=timeout)
        resp.raise_for_status()
        return resp.json()

    # Helper function: create podcast (returns podcast info)
    def create_podcast(access_token, podcast_data):
        url = f"{BASE_URL}/api/v1/podcasts"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = session.post(url, json=podcast_data, headers=headers, timeout=timeout)
        resp.raise_for_status()
        return resp.json()

    # Helper function: create episode (returns episode info)
    def create_episode(access_token, episode_data, audio_content):
        url = f"{BASE_URL}/api/v1/episodes"
        headers = {"Authorization": f"Bearer {access_token}"}
        files = {
            "audio": ("episode.mp3", audio_content, "audio/mpeg")
        }
        data = {
            "title": episode_data["title"],
            "description": episode_data["description"],
        }
        resp = session.post(url, headers=headers, data=data, files=files, timeout=timeout)
        resp.raise_for_status()
        return resp.json()

    # Helper function: follow creator
    def follow_creator(access_token, creator_id):
        url = f"{BASE_URL}/api/v1/follows/creators/{creator_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = session.post(url, headers=headers, timeout=timeout)
        resp.raise_for_status()
        return resp.json()

    # Helper function: post comment to episode
    def post_comment(access_token, episode_id, text):
        url = f"{BASE_URL}/api/v1/comments/episodes/{episode_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        payload = {"text": text}
        resp = session.post(url, headers=headers, json=payload, timeout=timeout)
        resp.raise_for_status()
        return resp.json()

    # Step 0: Check health endpoint first for baseline
    health_url = f"{BASE_URL}/api/v1/"
    resp = session.get(health_url, timeout=timeout)
    assert resp.status_code == 200
    assert isinstance(resp.text, str)

    unique_suffix = str(uuid.uuid4())[:8]
    user_email = f"user_{unique_suffix}@example.com"
    user_password = "TestPass123!"
    creator_email = f"creator_{unique_suffix}@example.com"
    creator_password = "CreatorPass123!"

    delete_resources = {
        "creators": [],
        "podcasts": [],
        "episodes": [],
        "comments": [],
    }

    try:
        user_access_token, user_refresh_token = register_user(user_email, user_password)

        creator_access_token, creator_refresh_token = register_user(creator_email, creator_password)
        creator_data = {
            "displayName": f"Creator {unique_suffix}",
            "bio": "Test creator bio"
        }
        creator_profile = become_creator(creator_access_token, creator_data)
        creator_id = creator_profile.get("id")
        assert creator_id is not None
        delete_resources["creators"].append(creator_id)

        podcast_data = {
            "title": f"Test Podcast {unique_suffix}",
            "description": "Test Podcast Description",
            "coverImage": "http://example.com/cover.jpg"
        }
        podcast = create_podcast(creator_access_token, podcast_data)
        podcast_id = podcast.get("id")
        assert podcast_id is not None
        delete_resources["podcasts"].append(podcast_id)

        episode_data = {
            "title": f"Test Episode {unique_suffix}",
            "description": "Test Episode Description"
        }
        audio_content = b"Fake mp3 content bytes for test"
        episode = create_episode(creator_access_token, episode_data, audio_content)
        episode_id = episode.get("id")
        assert episode_id is not None
        delete_resources["episodes"].append(episode_id)

        follow = follow_creator(user_access_token, creator_id)
        assert follow is not None

        comment_text = f"This is a test comment {unique_suffix}"
        comment = post_comment(user_access_token, episode_id, comment_text)
        comment_id = comment.get("id")
        assert comment_id is not None
        delete_resources["comments"].append(comment_id)

        url_like_episode = f"{BASE_URL}/api/v1/likes/episodes/{episode_id}"
        headers = {"Authorization": f"Bearer {user_access_token}"}
        resp_like = session.post(url_like_episode, headers=headers, timeout=timeout)
        resp_like.raise_for_status()
        like_response = resp_like.json()
        assert like_response is not None

    finally:
        for comment_id in delete_resources["comments"]:
            url_del_comment = f"{BASE_URL}/api/v1/comments/{comment_id}"
            try:
                session.delete(url_del_comment, headers={"Authorization": f"Bearer {user_access_token}"}, timeout=timeout)
            except Exception:
                pass

        for episode_id in delete_resources["episodes"]:
            url_del_episode = f"{BASE_URL}/api/v1/episodes/{episode_id}"
            try:
                session.delete(url_del_episode, headers={"Authorization": f"Bearer {creator_access_token}"}, timeout=timeout)
            except Exception:
                pass

        for podcast_id in delete_resources["podcasts"]:
            url_del_podcast = f"{BASE_URL}/api/v1/podcasts/{podcast_id}"
            try:
                session.delete(url_del_podcast, headers={"Authorization": f"Bearer {creator_access_token}"}, timeout=timeout)
            except Exception:
                pass


test_get_health_check_with_full_engagement_flow()
