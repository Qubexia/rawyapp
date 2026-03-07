# Feature Specification: Podcast App Enhancements

**Feature Branch**: `002-podcast-app-enhancements`  
**Created**: 2026-03-07  
**Status**: Draft  
**Input**: User description: "Podcast app enhancements: auto-extract episode metadata on upload, background audio playback with notification controls, and Google Sign-In authentication"

## Clarifications

### Session 2026-03-07

- Q: What defines the playback queue for next/previous navigation? → A: Episodes within the same podcast as the currently playing episode, ordered by publish date.
- Q: When Google sign-in email matches an existing email/password account, should linking be automatic or require verification? → A: Require the existing account's password before linking (verify ownership).
- Q: What is the maximum audio file size for episode upload? → A: 500 MB.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-Extract Episode Metadata on Upload (Priority: P1)

As a podcast creator, when I upload an audio file (MP3, M4A, WAV, etc.) to create a new episode, the app should automatically extract the episode name from the file name and the audio duration from the file itself. These values should be pre-filled in the episode creation form so I don't have to enter them manually.

**Why this priority**: This directly reduces friction in the most common creator workflow — uploading episodes. Every creator uploads episodes regularly, and manually typing the title and duration is tedious and error-prone. Automating this step saves time and improves data accuracy, making it the highest-impact improvement for creator productivity.

**Independent Test**: Can be fully tested by selecting an audio file in the Upload Episode screen and verifying that the title field is populated with a cleaned-up version of the file name and the duration field shows the correct length of the audio file. Delivers immediate value by eliminating manual data entry.

**Acceptance Scenarios**:

1. **Given** I am on the Upload Episode screen, **When** I select an MP3 file named "Episode 12 - Interview with Ahmed.mp3", **Then** the title field is automatically populated with "Episode 12 - Interview with Ahmed" (file extension removed).
2. **Given** I am on the Upload Episode screen, **When** I select an audio file that is 45 minutes and 30 seconds long, **Then** the duration field is automatically populated with the value 2730 (seconds) or displayed as "45:30".
3. **Given** the title field was auto-populated from the file name, **When** I want to change the title, **Then** I can freely edit the auto-filled title before submitting.
4. **Given** the duration field was auto-populated, **When** I view the duration, **Then** it accurately reflects the actual length of the audio file within a 1-second tolerance.
5. **Given** I select a file that is not a valid audio file (e.g., a PDF), **When** the system tries to extract metadata, **Then** it shows a clear error message and does not populate the fields with incorrect data.

---

### User Story 2 - Background Audio Playback with Notification Controls (Priority: P2)

As a podcast listener, I want the audio to continue playing when I leave the app or lock my phone. I also want to see a persistent notification in the notification bar with playback controls (play/pause, next, previous) and the episode name, similar to popular podcast apps like Spotify or Apple Podcasts.

**Why this priority**: Background playback is a core expectation for any podcast app. Without it, users cannot multitask while listening, making the app unusable for its primary purpose. This is the single most critical feature for listener retention, but ranked P2 because the current player already works within the app — this enhances (rather than enables) a working flow.

**Independent Test**: Can be tested by starting an episode, pressing the home button to leave the app, and verifying audio continues playing. Then checking the notification bar for playback controls and interacting with them. Delivers value by enabling the core "listen while multitasking" behavior.

**Acceptance Scenarios**:

1. **Given** I am playing an episode in the app, **When** I press the home button or switch to another app, **Then** the audio continues playing without interruption.
2. **Given** audio is playing in the background, **When** I pull down the notification bar, **Then** I see a media notification showing the current episode name.
3. **Given** a media notification is visible, **When** I tap the play/pause button on the notification, **Then** the audio pauses or resumes accordingly.
4. **Given** a media notification is visible and there are other episodes in the playlist/queue, **When** I tap the "Next" button, **Then** the next episode starts playing and the notification updates with the new episode name.
5. **Given** a media notification is visible, **When** I tap the "Previous" button, **Then** the previous episode starts playing (or the current episode restarts from the beginning if less than 3 seconds have elapsed).
6. **Given** the audio is playing in the background, **When** I lock my phone, **Then** the audio continues playing and the lock screen displays media controls.
7. **Given** background playback is active, **When** I open the app again, **Then** the player UI reflects the current playback state (position, play/pause status) accurately.
8. **Given** the user explicitly stops playback and dismisses the notification, **When** no audio is playing, **Then** the background audio service is properly released and does not consume device resources.

---

### User Story 3 - Google Sign-In Authentication (Priority: P3)

As a new or returning user, I want to sign in using my Google account so that I can quickly access the app without creating a separate account. On first Google sign-in, the app should automatically create an account using my Google profile information (name, email, profile picture). On subsequent sign-ins, it should log me into my existing account.

**Why this priority**: Google Sign-In reduces the barrier to entry for new users and simplifies login for returning users. However, the app already supports email/password authentication (and has a partial Google auth implementation), so this is an enhancement to an existing working flow rather than enabling new functionality. It is P3 because the other two features (P1 and P2) address more critical usability gaps.

**Independent Test**: Can be tested by tapping the "Sign in with Google" button, completing the Google authentication flow, and verifying the user is logged in with correct profile data (name, email, avatar). Delivers value by providing a frictionless onboarding experience.

**Acceptance Scenarios**:

1. **Given** I am on the login screen, **When** I tap the "Sign in with Google" button, **Then** the Google authentication dialog appears.
2. **Given** I have never signed in before with this Google account, **When** I complete the Google authentication, **Then** a new user account is created with my Google name, email, and profile picture.
3. **Given** I previously signed in with this Google account, **When** I complete the Google authentication, **Then** I am logged into my existing account without creating a duplicate.
4. **Given** I successfully sign in with Google, **When** the authentication is complete, **Then** I am navigated to the home screen and my profile shows my Google name, email, and avatar.
5. **Given** the Google authentication fails (e.g., network error, user cancels), **When** the error occurs, **Then** I see a clear error message and can retry the sign-in.
6. **Given** I am signed in with Google, **When** I log out and return to the login screen, **Then** I can sign in again using Google without re-entering my credentials (if Google session is still active on the device).
7. **Given** I sign in with Google and my Google email matches an existing email/password account, **When** the system detects the match, **Then** I am prompted to enter the existing account's password to confirm ownership before the accounts are linked.

---

### Edge Cases

- What happens when the audio file is corrupted and duration cannot be extracted? → The duration field remains empty, and the user is prompted to enter it manually. An informational message is displayed.
- What happens when the file name contains only special characters or is very long? → Special characters are stripped/cleaned, and the name is truncated to a reasonable length (e.g., 200 characters). If the cleaned name is empty, the title field is left blank for manual entry.
- What happens when the user's internet connection drops during Google Sign-In? → An error message is displayed, and the user can retry when connectivity is restored.
- What happens when background audio playback is interrupted by a phone call? → Audio pauses during the call and resumes automatically when the call ends (standard Android/iOS audio focus behavior).
- What happens when the device is low on memory during background playback? → The audio service is designed to be a foreground service (Android) or use background audio mode (iOS) to minimize the chance of being killed by the OS. If killed, playback stops gracefully.
- What happens when the user tries to play a new episode while another is playing in the background? → The currently playing episode stops, and the new episode begins playing. The notification updates to show the new episode.
- What happens when the user selects an audio file larger than 500 MB? → The file is rejected before upload begins, and the user sees a clear message stating the maximum allowed file size is 500 MB.
- What happens when the Google account email matches an existing email/password account? → The user is prompted to enter the existing account's password to verify ownership. Once verified, the accounts are linked, allowing sign-in with either method. If verification fails, the Google sign-in is rejected with a clear message explaining that an account with that email already exists.

## Requirements *(mandatory)*

### Functional Requirements

**Auto-Extract Episode Metadata:**

- **FR-001**: System MUST extract the episode title from the audio file name by removing the file extension and cleaning up special characters.
- **FR-002**: System MUST extract the audio duration from the selected file and populate the duration field automatically.
- **FR-003**: System MUST support duration extraction for common audio formats: MP3, M4A, AAC, WAV, OGG, and FLAC.
- **FR-004**: System MUST allow the user to override any auto-populated field (title, duration) before submitting.
- **FR-005**: System MUST display an appropriate message if metadata extraction fails, without blocking the upload workflow.
- **FR-005a**: System MUST enforce a maximum audio file size of 500 MB per episode upload. Files exceeding this limit MUST be rejected with a clear error message before upload begins.

**Background Audio Playback:**

- **FR-006**: System MUST continue audio playback when the app is moved to the background or the device is locked.
- **FR-007**: System MUST display a persistent media notification while audio is playing in the background.
- **FR-008**: The media notification MUST include: episode title, play/pause button, next button, and previous button. The next/previous buttons navigate through episodes within the same podcast, ordered by publish date.
- **FR-009**: System MUST respond to media notification control interactions (play, pause, next, previous) with appropriate playback actions.
- **FR-010**: System MUST handle audio focus correctly — pausing on interruptions (phone calls, other media apps) and resuming when focus is regained.
- **FR-011**: System MUST synchronize the in-app player UI with the background playback state when the user returns to the app.
- **FR-012**: System MUST release background audio resources when playback stops and the notification is dismissed.
- **FR-013**: System MUST display media controls on the device lock screen during background playback.

**Google Sign-In:**

- **FR-014**: System MUST provide a "Sign in with Google" button on the login/registration screens.
- **FR-015**: System MUST authenticate users using Google OAuth 2.0 and verify the Google ID token on the backend.
- **FR-016**: System MUST automatically create a new user account on first Google sign-in, storing the user's name, email, and profile picture from the Google profile.
- **FR-017**: System MUST require the user to verify ownership of an existing email/password account (by entering the existing password) before linking it with a Google sign-in that uses the same email. If verification fails, the Google sign-in attempt is rejected with a descriptive error.
- **FR-018**: System MUST persist the authentication session so users don't need to re-authenticate on every app launch.
- **FR-019**: System MUST handle Google sign-in errors gracefully and display user-friendly error messages.

### Key Entities

- **Episode**: Represents a podcast episode with title, description, audio file URL, duration, and associated podcast. The title and duration can now be auto-extracted during upload.
- **User**: Represents an app user with name, email, avatar, authentication method (email/password or Google), Google ID, and role (user/creator/admin).
- **Playback Session**: Represents the current audio playback state including the playing episode, position, play/pause status, and a queue derived from the episodes of the same podcast (ordered by publish date) for next/previous navigation.
- **Media Notification**: A system-level notification displayed during background playback containing episode information and playback controls.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of uploaded episodes have their title and duration automatically populated without manual correction.
- **SC-002**: Episode upload completion time is reduced by at least 30% compared to fully manual entry.
- **SC-003**: Audio playback continues uninterrupted for at least 95% of background sessions (user leaves app and returns).
- **SC-004**: Users can control playback from the notification bar within 1 second of interaction (no perceptible delay).
- **SC-005**: 80% of new users who attempt Google sign-in complete the process successfully on their first try.
- **SC-006**: Google sign-in flow completes (from button tap to home screen) in under 10 seconds on a standard network.
- **SC-007**: Background audio playback does not increase device battery consumption by more than 15% compared to other leading podcast apps.
- **SC-008**: Lock screen media controls are visible and functional during 100% of background playback sessions.

## Assumptions

- The app targets Android and iOS platforms using React Native with Expo.
- The existing backend already supports Google OAuth authentication via the `/auth/google/mobile` endpoint.
- The existing `expo-audio` library is used for audio playback; background playback may require additional native configuration or a different audio library that supports background modes.
- Audio metadata extraction (duration) will be performed on the client side before upload.
- The "next/previous" episode navigation in the notification uses episodes within the same podcast as the currently playing episode, ordered by publish date.
- Standard audio focus behavior (pause on call, duck for notifications) follows platform conventions.
- The Google Sign-In implementation will enhance the existing partial implementation found in the codebase (`use-google-auth.ts`, `loginWithGoogleMobile`).
