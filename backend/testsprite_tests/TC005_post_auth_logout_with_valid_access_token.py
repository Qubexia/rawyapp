import requests

BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
LOGOUT_URL = f"{BASE_URL}/api/v1/auth/logout"
TIMEOUT = 30

EMAIL = "admin@rawy.com"
PASSWORD = "AdminPassword123!"

def test_post_auth_logout_with_valid_access_token():
    # Step 1: Login to get access token
    try:
        login_response = requests.post(
            LOGIN_URL,
            json={"email": EMAIL, "password": PASSWORD},
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"
        login_json = login_response.json()
        access_token = login_json.get("access_token")
        assert access_token is not None and isinstance(access_token, str), "Access token missing in login response"
    except Exception as e:
        raise AssertionError(f"Exception during login: {e}")

    # Step 2: Logout with valid access token
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        logout_response = requests.post(
            LOGOUT_URL,
            headers=headers,
            timeout=TIMEOUT
        )
        assert logout_response.status_code == 200, f"Logout failed with status code {logout_response.status_code}"
        # Response body should be empty or no content for logout
        content_length = logout_response.headers.get("Content-Length")
        if content_length is not None:
            assert int(content_length) == 0 or logout_response.text.strip() == "", "Logout response body should be empty"
        else:
            # Some servers may not include Content-Length; check text anyway
            assert logout_response.text.strip() == "", "Logout response body should be empty"
    except Exception as e:
        raise AssertionError(f"Exception during logout: {e}")

test_post_auth_logout_with_valid_access_token()