import requests
import io

BASE_URL = "http://localhost:3000"
AUTH_CREDENTIALS = ("admin@rawy.com", "AdminPassword123!")
TIMEOUT = 30


def test_post_episodes_create_with_valid_data_and_audio():
    # Step 1: Login to get access token using email/password via POST /api/v1/auth/login
    login_url = f"{BASE_URL}/api/v1/auth/login"
    login_payload = {
        "email": AUTH_CREDENTIALS[0],
        "password": AUTH_CREDENTIALS[1]
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "access" in login_data, "Access token missing in login response"
        access_token = login_data["access"]
    except Exception as e:
        raise AssertionError(f"Authentication failed: {str(e)}")

    # Step 2: Prepare episode data and audio file for upload
    episodes_url = f"{BASE_URL}/api/v1/episodes"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    # Example valid episode metadata
    episode_title = "Test Episode Title"
    episode_description = "This is a description for the test episode."

    # Prepare a dummy audio file content (simple short wave file header or dummy bytes)
    # Using an in-memory bytes buffer as file object
    audio_content = b"RIFF$\x00\x00\x00WAVEfmt "  # minimal WAV header bytes (not necessarily a valid audio)
    audio_file = io.BytesIO(audio_content)
    audio_file.name = "test_audio.wav"

    files = {
        "audio": (audio_file.name, audio_file, "audio/wav")
    }
    data = {
        "title": episode_title,
        "description": episode_description
    }

    # Step 3: Send POST /api/v1/episodes request with multipart/form-data including audio file
    episode = None
    try:
        resp = requests.post(episodes_url, headers=headers, files=files, data=data, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
        episode = resp.json()

        # Basic validation of returned episode fields
        assert "id" in episode or "_id" in episode, "Episode ID missing in response"
        assert episode.get("title") == episode_title, "Episode title mismatch"
        assert episode.get("description") == episode_description, "Episode description mismatch"

        # We cannot directly assert push notifications triggered but assume backend triggers it
    finally:
        # Cleanup - delete created episode to avoid pollution
        episode_id = None
        try:
            if episode is not None:
                episode_id = episode.get("id") or episode.get("_id")
        except Exception:
            episode_id = None

        if episode_id:
            delete_url = f"{BASE_URL}/api/v1/episodes/{episode_id}"
            try:
                del_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # It's okay if deletion fails, just try best effort cleanup
            except Exception:
                pass


test_post_episodes_create_with_valid_data_and_audio()
