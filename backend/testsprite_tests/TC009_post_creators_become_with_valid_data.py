import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
BECOME_CREATOR_URL = f"{BASE_URL}/api/v1/creators/become"

USERNAME = "admin@rawy.com"
PASSWORD = "AdminPassword123!"

def test_post_creators_become_with_valid_data():
    try:
        # Step 1: Log in to get access token
        login_payload = {
            "email": USERNAME,
            "password": PASSWORD
        }
        login_response = requests.post(LOGIN_URL, json=login_payload, timeout=30)
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_json = login_response.json()
        access_token = login_json.get("access")
        assert access_token, "Access token not found in login response"

        # Step 2: Prepare creator data payload for becoming a creator
        # Since no specific schema given for creator data, define sample valid data:
        creator_data = {
            "displayName": "Test Creator",
            "bio": "This is a test creator profile.",
            "website": "https://testcreator.example.com",
            "socialLinks": {
                "twitter": "https://twitter.com/testcreator",
                "instagram": "https://instagram.com/testcreator"
            }
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Step 3: POST /api/v1/creators/become with valid creator data and authorization
        response = requests.post(BECOME_CREATOR_URL, json=creator_data, headers=headers, timeout=30)
        assert response.status_code == 201, f"Expected 201 Created but got {response.status_code}: {response.text}"
        creator_profile = response.json()
        # Validate response contains at least expected keys
        assert isinstance(creator_profile, dict), f"Response is not a dict: {creator_profile}"
        assert "id" in creator_profile or "_id" in creator_profile, "Creator ID missing in response"
        assert creator_profile.get("displayName") == creator_data["displayName"], "Creator displayName mismatch"
        assert creator_profile.get("bio") == creator_data["bio"], "Creator bio mismatch"

    except Exception as e:
        raise e

test_post_creators_become_with_valid_data()