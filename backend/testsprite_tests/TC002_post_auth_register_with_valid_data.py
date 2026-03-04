import requests

def test_post_auth_register_with_valid_data():
    base_url = "http://localhost:3000"
    endpoint = "/api/v1/auth/register"
    url = base_url + endpoint

    headers = {
        "Content-Type": "application/json"
    }

    # Use a unique email for registration to avoid conflict if test is run multiple times
    import uuid
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    payload = {
        "email": unique_email,
        "password": "ValidPass123!"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "access" in data, "Response JSON does not contain 'access' token"
    assert isinstance(data["access"], str) and data["access"], "'access' token is empty or not a string"
    assert "refresh" in data, "Response JSON does not contain 'refresh' token"
    assert isinstance(data["refresh"], str) and data["refresh"], "'refresh' token is empty or not a string"

test_post_auth_register_with_valid_data()
