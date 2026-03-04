import requests
from requests.auth import HTTPBasicAuth

def test_post_auth_login_with_valid_credentials():
    base_url = "http://localhost:3000"
    login_url = f"{base_url}/api/v1/auth/login"
    username = "admin@rawy.com"
    password = "AdminPassword123!"
    headers = {
        "Content-Type": "application/json"
    }
    # Prepare login payload according to standard email/password login (likely email + password in JSON)
    payload = {
        "email": username,
        "password": password
    }

    try:
        response = requests.post(login_url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to login endpoint failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate TokenResponse: must have 'access' and 'refresh' tokens
    assert isinstance(data, dict), "Response JSON is not an object"
    assert "access" in data and isinstance(data["access"], str) and data["access"], "Access token missing or invalid"
    assert "refresh" in data and isinstance(data["refresh"], str) and data["refresh"], "Refresh token missing or invalid"

test_post_auth_login_with_valid_credentials()