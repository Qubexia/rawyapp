import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_get_health_check_status():
    url = f"{BASE_URL}/api/v1/"
    try:
        # Remove auth since endpoint does not require it
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.text, str), "Response is not a string"
        assert len(response.text) > 0, "Response string is empty"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_get_health_check_status()