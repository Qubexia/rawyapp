import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
BECOME_CREATOR_URL = f"{BASE_URL}/api/v1/creators/become"
FOLLOW_CREATOR_URL_TEMPLATE = f"{BASE_URL}/api/v1/follows/creators/{{creator_id}}"
DELETE_FOLLOW_CREATOR_URL_TEMPLATE = f"{BASE_URL}/api/v1/follows/creators/{{creator_id}}"

ADMIN_USERNAME = "admin@rawy.com"
ADMIN_PASSWORD = "AdminPassword123!"

def test_post_follows_creators_creatorid_with_valid_access_token():
    timeout = 30
    # Step 1: Login to get access token
    auth_payload = {
        "email": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    try:
        # The API login is POST /api/v1/auth/login with valid credentials
        login_resp = requests.post(LOGIN_URL, json=auth_payload, timeout=timeout)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        access_token = login_json.get("access")
        assert access_token, "Access token missing in login response"
    except Exception as e:
        raise AssertionError(f"Failed at login step: {e}")

    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 2: Because resource id (creatorId) is not provided, create a creator to follow
    # First check if admin user can become a creator (if already creator, GET /api/v1/creators/me confirms)
    creator_id = None
    try:
        # Become a creator POST /api/v1/creators/become requires valid creator data
        # Minimal valid data assumed: { "name": "Test Creator" }
        creator_data = {
            "name": "Test Creator"
        }
        become_resp = requests.post(BECOME_CREATOR_URL, headers=headers, json=creator_data, timeout=timeout)
        assert become_resp.status_code == 201, f"Failed to become creator: {become_resp.status_code} {become_resp.text}"
        creator = become_resp.json()
        creator_id = creator.get("id")
        assert creator_id, "Creator ID missing in become creator response"

        # Step 3: POST /api/v1/follows/creators/:creatorId with valid Authorization Bearer access token
        follow_url = FOLLOW_CREATOR_URL_TEMPLATE.format(creator_id=creator_id)
        follow_resp = requests.post(follow_url, headers=headers, timeout=timeout)
        assert follow_resp.status_code == 201, f"Failed to follow creator: {follow_resp.status_code} {follow_resp.text}"
        follow_obj = follow_resp.json()
        # Validate that returned Follow object indicates user is now following the creator
        # We expect fields like userId, creatorId or similar
        assert "creatorId" in follow_obj and str(follow_obj["creatorId"]) == str(creator_id), "Follow response creatorId mismatch"
        assert "userId" in follow_obj, "Follow response missing userId"
    finally:
        # Cleanup: unfollow and optionally delete the creator if needed
        if creator_id:
            try:
                # DELETE /api/v1/follows/creators/:creatorId to unfollow
                unfollow_url = DELETE_FOLLOW_CREATOR_URL_TEMPLATE.format(creator_id=creator_id)
                requests.delete(unfollow_url, headers=headers, timeout=timeout)
            except Exception:
                pass

test_post_follows_creators_creatorid_with_valid_access_token()
