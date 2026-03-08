import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_auth_login_with_valid_credentials():
    # Helper functions
    def register_user(email, password):
        url = f"{BASE_URL}/api/v1/auth/register"
        payload = {"email": email, "password": password}
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        data = resp.json()
        assert "access" in data and "refresh" in data
        return data["access"], data["refresh"]
    
    def login_user(email, password):
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {"email": email, "password": password}
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200
        data = resp.json()
        assert "access" in data and "refresh" in data
        return data["access"], data["refresh"]
    
    def get_current_user(access_token):
        url = f"{BASE_URL}/api/v1/users/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200
        return resp.json()
    
    def become_creator(access_token):
        url = f"{BASE_URL}/api/v1/creators/become"
        headers = {"Authorization": f"Bearer {access_token}"}
        # Minimal valid creator data; adjust if needed
        payload = {
            "bio": "Test creator bio",
            "displayName": f"Creator_{uuid.uuid4().hex[:8]}"
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()
    
    def follow_creator(access_token, creator_id):
        url = f"{BASE_URL}/api/v1/follows/creators/{creator_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.post(url, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()
    
    def create_podcast(access_token):
        url = f"{BASE_URL}/api/v1/podcasts"
        headers = {"Authorization": f"Bearer {access_token}"}
        payload = {
            "title": f"Test Podcast {uuid.uuid4().hex[:6]}",
            "description": "Test podcast description",
            "cover_image": "https://example.com/test.jpg"
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()
    
    def create_episode(access_token, podcast_id):
        url = f"{BASE_URL}/api/v1/episodes"
        headers = {"Authorization": f"Bearer {access_token}"}
        files = {
            "audio": ("test.mp3", b"FAKEAUDIOCONTENT", "audio/mpeg"),
        }
        data = {
            "title": f"Test Episode {uuid.uuid4().hex[:6]}",
            "description": "Test episode description",
            "podcastId": podcast_id
        }
        resp = requests.post(url, data=data, files=files, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()
    
    def post_comment(access_token, episode_id, text):
        url = f"{BASE_URL}/api/v1/comments/episodes/{episode_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        payload = {"text": text}
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()
    
    def like_comment(access_token, comment_id):
        raise NotImplementedError("No API endpoint specified for comment likes.")
    
    def like_episode(access_token, episode_id):
        url = f"{BASE_URL}/api/v1/likes/episodes/{episode_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.post(url, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()

    # Begin test workflow

    new_email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    new_password = "TestPassword123!"
    access_token, refresh_token = register_user(new_email, new_password)

    login_access_token, login_refresh_token = login_user(new_email, new_password)

    assert isinstance(login_access_token, str) and len(login_access_token) > 0
    assert isinstance(login_refresh_token, str) and len(login_refresh_token) > 0

    user = get_current_user(login_access_token)
    user_id = user.get("id") or user.get("_id")
    assert user_id is not None

    creator = become_creator(login_access_token)
    creator_id = creator.get("id") or creator.get("_id")
    assert creator_id is not None

    admin_email = "admin@rawy.com"
    admin_password = "AdminPassword123!"
    admin_access_token, _ = login_user(admin_email, admin_password)
    assert isinstance(admin_access_token, str) and len(admin_access_token) > 0
    admin_user = get_current_user(admin_access_token)
    admin_user_id = admin_user.get("id") or admin_user.get("_id")

    try:
        admin_creator = requests.get(f"{BASE_URL}/api/v1/creators/me", headers={"Authorization":f"Bearer {admin_access_token}"}, timeout=TIMEOUT)
        if admin_creator.status_code == 404:
            admin_creator_obj = become_creator(admin_access_token)
        else:
            admin_creator_obj = admin_creator.json()
        admin_creator_id = admin_creator_obj.get("id") or admin_creator_obj.get("_id")
    except Exception:
        admin_creator_id = None

    assert admin_creator_id is not None

    follow_resp = follow_creator(admin_access_token, creator_id)

    podcast = create_podcast(login_access_token)
    podcast_id = podcast.get("id") or podcast.get("_id")
    assert podcast_id is not None

    url = f"{BASE_URL}/api/v1/episodes"
    headers = {"Authorization": f"Bearer {login_access_token}"}
    files = {
        "audio": ("test.mp3", b"FAKEAUDIOCONTENT", "audio/mpeg"),
    }
    data = {
        "title": f"Test Episode {uuid.uuid4().hex[:6]}",
        "description": "Test episode description",
        "podcastId": podcast_id
    }
    resp = requests.post(url, data=data, files=files, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    assert resp.status_code == 201
    episode = resp.json()
    episode_id = episode.get("id") or episode.get("_id")
    assert episode_id is not None

    try:
        comment_text = "This is a test comment."
        url_comment = f"{BASE_URL}/api/v1/comments/episodes/{episode_id}"
        headers_admin = {"Authorization": f"Bearer {admin_access_token}"}
        payload_comment = {"text": comment_text}
        resp_comment = requests.post(url_comment, json=payload_comment, headers=headers_admin, timeout=TIMEOUT)
        resp_comment.raise_for_status()
        assert resp_comment.status_code == 201
        comment = resp_comment.json()
        comment_id = comment.get("id") or comment.get("_id")
        assert comment_id is not None

        like_resp = like_episode(admin_access_token, episode_id)
        assert "id" in like_resp or "likeId" in like_resp or like_resp is not None

    finally:
        if 'comment_id' in locals():
            url_del_comment = f"{BASE_URL}/api/v1/comments/{comment_id}"
            requests.delete(url_del_comment, headers={"Authorization": f"Bearer {admin_access_token}"}, timeout=TIMEOUT)
        if 'episode_id' in locals():
            url_unlike = f"{BASE_URL}/api/v1/likes/episodes/{episode_id}"
            requests.delete(url_unlike, headers={"Authorization": f"Bearer {admin_access_token}"}, timeout=TIMEOUT)
        if 'episode_id' in locals():
            url_del_episode = f"{BASE_URL}/api/v1/episodes/{episode_id}"
            requests.delete(url_del_episode, headers={"Authorization": f"Bearer {login_access_token}"}, timeout=TIMEOUT)
        if 'podcast_id' in locals():
            url_del_podcast = f"{BASE_URL}/api/v1/podcasts/{podcast_id}"
            requests.delete(url_del_podcast, headers={"Authorization": f"Bearer {login_access_token}"}, timeout=TIMEOUT)
        if 'creator_id' in locals():
            url_unfollow = f"{BASE_URL}/api/v1/follows/creators/{creator_id}"
            requests.delete(url_unfollow, headers={"Authorization": f"Bearer {admin_access_token}"}, timeout=TIMEOUT)


test_post_auth_login_with_valid_credentials()
