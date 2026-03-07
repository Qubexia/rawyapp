# Research: Podcast App Enhancements

**Branch**: `002-podcast-app-enhancements` | **Date**: 2026-03-07

## R-001: Audio Metadata Extraction on React Native / Expo

### Decision
Use `expo-av` (or the newer `expo-audio`) to load the audio file locally and read its duration. For title extraction, parse the file name string directly (client-side string manipulation — no library needed).

### Rationale
- `expo-audio`'s `useAudioPlayer` (already used in `player-context.tsx`) can load a local file URI and report `duration` once loaded.
- Alternatively, `Audio.Sound.createAsync` from `expo-av` returns a `status` object containing `durationMillis` immediately after loading.
- The app already uses `expo-document-picker` which returns the file `name` property — simple string trimming of the extension suffices for title extraction.
- No additional native dependency is required; the existing `expo-audio@~1.1.1` can handle this.

### Alternatives Considered
1. **`react-native-audio-metadata` / `music-metadata` (npm)** — Provides ID3 tag parsing (artist, album, title embedded in MP3). However, this requires native modules and adds complexity. The file name approach is simpler and aligns with the spec requirement.
2. **Server-side extraction** — Upload first, then extract on backend with `ffprobe`. Rejected because the spec requires fields to be populated *before* upload, pre-filling the form.
3. **`expo-media-library`** — Can read metadata for files already in the device library, but not for arbitrary picked files. Not applicable.

### Key Finding
The existing `upload-episode.tsx` already attempts to read `audioFile.duration` from `expo-document-picker` (line 148), but this property is not reliably populated by `expo-document-picker`. The fix is to load the file into an `Audio.Sound` instance temporarily, read `durationMillis`, then unload it immediately. This is a lightweight operation.

---

## R-002: Background Audio Playback on React Native / Expo

### Decision
Use `expo-audio` with `staysActiveInBackground: true` (already configured in `player-context.tsx`) combined with platform-specific configuration:
- **iOS**: Add `audio` to `UIBackgroundModes` in `app.json` / `Info.plist`.
- **Android**: Configure a foreground service notification (Expo's audio module handles this natively when `staysActiveInBackground` is true in development builds).

For notification controls (play/pause, next, previous), use `expo-audio`'s built-in `NowPlayingInfo` / `MediaSession` integration, supplemented by `react-native-track-player` if `expo-audio` proves insufficient for media notification controls.

### Rationale
- The `PlayerProvider` already sets `staysActiveInBackground: true` (line 46 of `player-context.tsx`), but the app likely doesn't have the native iOS/Android configuration to actually enable it.
- `expo-audio` (Expo SDK 54) supports `NowPlayingInfo` on iOS and `MediaSession` on Android, which enables lock screen and notification controls natively.
- The existing architecture (context-based player) is well-suited — we just need to add queue management (next/previous) and ensure native config is correct.

### Alternatives Considered
1. **`react-native-track-player`** — Full-featured background audio library with built-in notification controls, queue management, and media session handling. However, it requires ejecting from Expo's managed workflow or using a custom dev client. It's the gold standard but adds significant native complexity. **Fallback option if `expo-audio` doesn't support notification controls.**
2. **`expo-notifications` for custom notifications** — Could create manual notification with buttons, but this doesn't integrate with the OS media session (lock screen, Bluetooth controls, etc.). Not recommended.

### Key Finding
The `player-context.tsx` needs to be extended with:
- A queue (list of episodes from same podcast, ordered by `createdAt`).
- `playNext()` and `playPrevious()` methods.
- `NowPlayingInfo` metadata updates (episode title, podcast artwork).
- Platform config changes in `app.json` for iOS `UIBackgroundModes`.

---

## R-003: Google Sign-In with Account Linking (Password Verification)

### Decision
Enhance the existing Google Sign-In flow (frontend: `use-google-auth.ts`, backend: `auth.service.ts`) to support password-verified account linking.

### Rationale
- The backend already has `validateOAuthUser()` (line 235 of `auth.service.ts`) which auto-links accounts silently. Per the spec clarification, this needs to change to require password verification first.
- The frontend already has a working `useGoogleAuth` hook with `expo-auth-session/providers/google`.
- The `UserProfile` interface already includes `googleId` field.
- The backend needs a new flow: when Google email matches an existing email/password user, return a `409 Conflict` with a special code indicating "account exists — password required". The frontend then shows a password prompt and sends a second request to link.

### Alternatives Considered
1. **Email confirmation link** — Send email with magic link to confirm. More secure but slower UX and requires email service setup. Rejected per clarification (password verification chosen).
2. **Auto-link with no verification** — Current behavior. Rejected because it's a security risk (anyone with a Google account matching the email could take over an existing account).

### Key Finding
The backend change requires:
1. Modify `validateOAuthUser()` to detect email/password users and NOT auto-link.
2. Add a new endpoint `POST /auth/google/link` that accepts `{ idToken, password }`, verifies the password, then links the Google account.
3. Frontend: handle the 409 response, show password dialog, call link endpoint.

---

## R-004: Audio File Size Validation (500 MB Limit)

### Decision
Validate file size on the client side immediately after file selection (using the `size` property from `expo-document-picker`) and reject files exceeding 500 MB before any upload begins.

### Rationale
- `expo-document-picker` returns a `size` property in bytes for each selected asset.
- Client-side validation provides instant feedback without network overhead.
- The backend should also enforce the limit via multer configuration as a safety net.

### Alternatives Considered
1. **Server-only validation** — Would require uploading potentially large files before rejection. Wasteful.
2. **Streaming upload with early abort** — Complex and unnecessary when client-side size is available.

### Key Finding
Current `upload-episode.tsx` already reads and displays `audioFile.size` (line 419-422). Adding a size check after `pickAudio()` is straightforward.
