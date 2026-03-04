import requests

BASE_URL = "http://localhost:3000"
EMAIL = "admin@rawy.com"
PASSWORD = "AdminPassword123!"
TIMEOUT = 30

def test_get_users_me_with_valid_access_token():
    try:
        # Step 1: Authenticate with correct credentials to get access token
        login_url = f"{BASE_URL}/api/v1/auth/login"
        login_payload = {
            "email": EMAIL,
            "password": PASSWORD
        }
        response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert response.status_code == 200, f"Login failed with status {response.status_code}"
        token_response = response.json()
        access_token = token_response.get("access")
        assert access_token and isinstance(access_token, str), "Access token missing or invalid"

        # Step 2: Call GET /api/v1/users/me with Bearer token
        users_me_url = f"{BASE_URL}/api/v1/users/me"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        response = requests.get(users_me_url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"GET /users/me failed with status {response.status_code}"

        user_profile = response.json()
        # Basic validation of User object
        assert isinstance(user_profile, dict), "User profile response is not a JSON object"
        # Check expected keys in user profile (common user fields)
        expected_keys = ["id", "email", "role", "createdAt", "updatedAt"]
        for key in expected_keys:
            assert key in user_profile, f"User profile missing key '{key}'"
        assert user_profile.get("email").lower() == EMAIL.lower(), "User email does not match logged in user"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_users_me_with_valid_access_token()