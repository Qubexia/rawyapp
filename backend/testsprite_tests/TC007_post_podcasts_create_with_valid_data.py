import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
PODCASTS_URL = f"{BASE_URL}/api/v1/podcasts"
TIMEOUT = 30

def test_post_podcasts_create_with_valid_data():
    # Login to get access token
    auth_resp = requests.post(
        LOGIN_URL,
        json={"email": "admin@rawy.com", "password": "AdminPassword123!"},
        timeout=TIMEOUT
    )
    assert auth_resp.status_code == 200, f"Login failed: {auth_resp.text}"
    auth_json = auth_resp.json()
    access_token = auth_json.get("access")
    assert access_token, "No access token received in login response"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Payload with valid podcast data, must include title, description, cover image (assuming URL or base64 placeholder)
    podcast_payload = {
        "title": "Test Podcast Title",
        "description": "This is a test podcast description.",
        "cover_image": "https://example.com/test-cover.jpg"
    }

    try:
        create_resp = requests.post(
            PODCASTS_URL,
            headers=headers,
            json=podcast_payload,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Podcast creation failed: {create_resp.text}"

        created_podcast = create_resp.json()
        # Validate response contains at least the sent fields and an id
        assert "id" in created_podcast, "Created podcast response missing 'id'"
        assert created_podcast["title"] == podcast_payload["title"], "Title mismatch"
        assert created_podcast["description"] == podcast_payload["description"], "Description mismatch"
        assert created_podcast["cover_image"] == podcast_payload["cover_image"], "Cover image mismatch"
    finally:
        # Cleanup: delete the created podcast
        podcast_id = None
        try:
            if 'created_podcast' in locals() and "id" in created_podcast:
                podcast_id = created_podcast["id"]
            if podcast_id:
                delete_url = f"{PODCASTS_URL}/{podcast_id}"
                del_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # Accept 200 (void) or 404 if not found during cleanup
                assert del_resp.status_code in (200, 404), f"Failed to delete podcast during cleanup: {del_resp.text}"
        except Exception as e:
            print(f"Warning: Cleanup failed - {e}")

test_post_podcasts_create_with_valid_data()