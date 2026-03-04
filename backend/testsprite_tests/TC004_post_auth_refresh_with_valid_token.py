import requests

BASE_URL = "http://localhost:3000"
USERNAME = "admin@rawy.com"
PASSWORD = "AdminPassword123!"

def test_post_auth_refresh_with_valid_token():
    login_url = f"{BASE_URL}/api/v1/auth/login"
    refresh_url = f"{BASE_URL}/api/v1/auth/refresh"
    timeout = 30

    # Step 1: Login to get initial access and refresh tokens
    try:
        login_resp = requests.post(
            login_url,
            json={"email": USERNAME, "password": PASSWORD},
            timeout=timeout
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "access" in login_data, "Login response missing access token"
        assert "refresh" in login_data, "Login response missing refresh token"

        # Extract refresh token
        refresh_token = login_data["refresh"]
        assert refresh_token, "Refresh token not found in login response"

        # Step 2: Use refresh token to get new TokenResponse
        headers = {"Content-Type": "application/json"}
        payload = {"refresh": refresh_token}

        refresh_resp = requests.post(refresh_url, json=payload, headers=headers, timeout=timeout)
        assert refresh_resp.status_code == 200, f"Refresh token request failed with status {refresh_resp.status_code}"
        refresh_data = refresh_resp.json()
        assert isinstance(refresh_data, dict), "Refresh response is not a valid JSON object"
        assert "access" in refresh_data, "New access token missing in refresh response"
        assert "refresh" in refresh_data, "New refresh token missing in refresh response"
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_post_auth_refresh_with_valid_token()
