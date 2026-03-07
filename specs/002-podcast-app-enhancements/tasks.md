# Tasks: Podcast App Enhancements

**Input**: Design documents from `/specs/002-podcast-app-enhancements/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api-endpoints.md ✓, quickstart.md ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing dependencies and add any missing platform configuration

- [X] T001 Verify `expo-audio` is installed and compatible in `rawy/package.json` — confirm `expo-audio@~1.1.1` or later supports `Audio.Sound.createAsync` with local file URIs for duration extraction
- [X] T002 Verify `expo-auth-session` and `expo-web-browser` are installed in `rawy/package.json` — confirm Google OAuth provider availability
- [X] T003 Add OGG and FLAC MIME types to the audio file picker configuration if not present — update accepted types list in preparation for FR-003 support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Platform configuration and shared utilities that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add iOS background audio mode to `rawy/app.json` — add `"audio"` to `expo.ios.infoPlist.UIBackgroundModes` array to enable background playback on iOS
- [X] T005 [P] Add Android foreground service permissions to `rawy/app.json` — add `"android.permission.FOREGROUND_SERVICE"` and `"android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"` to `expo.android.permissions` array
- [X] T006 [P] Verify Google OAuth client IDs are configured in `rawy/hooks/auth/use-google-auth.ts` — confirm `expoClientId`, `iosClientId`, and `androidClientId` values are set and match the Google Cloud Console configuration
- [X] T007 [P] Verify Google OAuth client ID is configured in `backend/.env` — confirm `GOOGLE_CLIENT_ID` environment variable is set for backend token verification

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Auto-Extract Episode Metadata on Upload (Priority: P1) 🎯 MVP

**Goal**: When a creator selects an audio file during episode upload, the app automatically extracts the episode title from the file name and the audio duration from the file, pre-filling the form fields. Files exceeding 500 MB are rejected before upload.

**Independent Test**: Select an audio file on the Upload Episode screen → verify title field is populated with cleaned file name (extension removed) → verify duration field shows correct audio length → verify files >500 MB are rejected with an error message.

### Implementation for User Story 1

- [X] T008 [P] [US1] Create audio metadata utility in `rawy/utils/audio-metadata.ts` — implement `extractAudioMetadata(fileUri: string, fileName: string, fileSize: number)` function that: (1) validates file size ≤ 524,288,000 bytes (500 MB), (2) cleans the file name by removing the extension (.mp3, .m4a, .wav, .aac, .ogg, .flac), trimming whitespace, and truncating to 200 characters, (3) loads the file via `Audio.Sound.createAsync` to read `durationMillis`, converts to seconds, then unloads the sound, (4) returns `{ extractedTitle: string, durationSeconds: number | null, fileSizeBytes: number, isValid: boolean, error?: string }`
- [X] T009 [US1] Integrate metadata extraction into `pickAudio` function in `rawy/app/(creator)/upload-episode.tsx` — after `DocumentPicker.getDocumentAsync` returns a file, call `extractAudioMetadata()` with the file URI, name, and size. If `isValid` is false (file too large), show an Alert with the error message and do NOT set the audio file. If valid, set the audio file AND call `setValue('title', extractedTitle)` to pre-fill the title field
- [X] T010 [US1] Add duration display to the Upload Episode form in `rawy/app/(creator)/upload-episode.tsx` — after successful metadata extraction, display the extracted duration in a readable format (e.g., "45:30") near the audio file picker area. Store `durationSeconds` in component state so it can be passed to `createEpisode.mutateAsync` in the `onSubmit` handler. Update the existing `durationSec` logic (line 148-150) to prefer the extracted value
- [X] T011 [US1] Update audio file picker accepted types in `rawy/app/(creator)/upload-episode.tsx` — add `"audio/ogg"`, `"audio/flac"`, and `"audio/x-flac"` to the `type` array in `DocumentPicker.getDocumentAsync` options (currently only supports MP3, WAV, M4A, AAC per FR-003)
- [X] T012 [US1] Add error handling UI for metadata extraction failure in `rawy/app/(creator)/upload-episode.tsx` — if `extractAudioMetadata` returns `durationSeconds: null`, display an informational message (e.g., "Could not extract duration. Please enter it manually.") using a `Text` component below the audio picker. The title field should still be auto-populated from the file name even if duration extraction fails

**Checkpoint**: User Story 1 should be fully functional. Test by: (1) picking an MP3 → verify title auto-fills and duration shows, (2) picking a file >500 MB → verify rejection, (3) editing the auto-filled title → verify editable, (4) picking a corrupted file → verify graceful fallback.

---

## Phase 4: User Story 2 — Background Audio Playback with Notification Controls (Priority: P2)

**Goal**: Audio continues playing when the app is backgrounded or device is locked. A persistent media notification with play/pause, next, and previous controls is displayed. The queue consists of episodes from the same podcast, ordered by publish date.

**Independent Test**: Start playing an episode → press home button → verify audio continues → check notification bar for media controls → tap play/pause, next, previous → verify correct behavior → lock phone → verify lock screen controls → return to app → verify player state is synced.

### Implementation for User Story 2

- [ ] T013 [US2] Add playback queue state to `rawy/context/player-context.tsx` — add new state: `queue: Episode[]` (episodes from same podcast, sorted by `createdAt` descending), `currentIndex: number`, and `queuePodcastId: string | null`. Add these to the `PlayerContextType` interface
- [ ] T014 [US2] Implement queue loading logic in `rawy/context/player-context.tsx` — when `playEpisode(episode)` is called, check if `episode.podcastId` (or `episode.podcast?._id`) differs from `queuePodcastId`. If so, fetch all episodes for that podcast using the episodes service (`GET /episodes?podcastId={id}&limit=100`), sort by `createdAt` descending, set `queue` state, find the `currentIndex` matching the played episode, and set `queuePodcastId`. Import and use the `getEpisodes` function from `rawy/services/episodes.service.ts`
- [ ] T015 [US2] Implement `playNext()` method in `rawy/context/player-context.tsx` — if `currentIndex < queue.length - 1`, increment `currentIndex` and call `setCurrentEpisode(queue[currentIndex + 1])`. If at the last episode, do nothing (no-op). Add `playNext` to the `PlayerContextType` interface and provider value
- [ ] T016 [US2] Implement `playPrevious()` method in `rawy/context/player-context.tsx` — if current playback position is ≥ 3 seconds (check `player.currentTime >= 3`), restart the current episode by calling `player.seekTo(0)`. Otherwise, if `currentIndex > 0`, decrement `currentIndex` and call `setCurrentEpisode(queue[currentIndex - 1])`. If at the first episode and <3 seconds elapsed, restart anyway. Add `playPrevious` to the `PlayerContextType` interface and provider value
- [ ] T017 [US2] Configure NowPlayingInfo metadata updates in `rawy/context/player-context.tsx` — whenever `currentEpisode` changes, update the system media session with episode title using `expo-audio`'s `NowPlayingInfo` API (or equivalent MediaSession API). Set `title` to `currentEpisode.title`. This enables lock screen and notification controls to show the correct episode info
- [ ] T018 [US2] Add audio focus handling in `rawy/context/player-context.tsx` — verify that the existing `interruptionMode: 'doNotMix'` in `setAudioModeAsync` correctly pauses on phone calls and other audio interruptions. Add an event listener for audio interruption events (if supported by `expo-audio`) to update the `isPlaying` state when audio is paused/resumed by the system
- [ ] T019 [US2] Update the full-screen player to use queue-based next/previous in `rawy/app/player.tsx` — replace the existing `skipForward` and `skipBackward` 15-second skip buttons with (or add alongside them) next/previous episode buttons. Wire them to `playNext()` and `playPrevious()` from the player context. Show visual feedback when at the first/last episode (disable the button or show a toast)
- [ ] T020 [US2] Update MiniPlayer to show next/previous controls in `rawy/components/layout/MiniPlayer.tsx` — add small next/previous buttons to the MiniPlayer component. Wire them to `playNext()` and `playPrevious()` from the player context. These buttons complement the existing play/pause toggle
- [ ] T021 [US2] Ensure resource cleanup on playback stop in `rawy/context/player-context.tsx` — update the `dismiss()` function to clear the queue state (`queue: []`, `currentIndex: 0`, `queuePodcastId: null`) and ensure no background audio service remains running. Verify that the media notification is dismissed when playback stops

**Checkpoint**: User Story 2 should be fully functional. Test by: (1) playing an episode and backgrounding the app → audio continues, (2) checking notification → shows episode title + controls, (3) tapping next → plays next episode in podcast, (4) tapping previous within 3s → restarts episode, (5) tapping previous after 3s → goes to previous episode, (6) locking phone → lock screen controls work, (7) returning to app → player UI is synced, (8) stopping playback → notification dismissed, no resource leak.

---

## Phase 5: User Story 3 — Google Sign-In Authentication (Priority: P3)

**Goal**: Fully functional Google Sign-In with secure account linking. First-time Google users get accounts auto-created. When Google email matches an existing email/password account, the user must verify ownership by entering their existing password before accounts are linked.

**Independent Test**: Tap "Sign in with Google" → complete Google auth → verify login/account creation → sign out → sign in again. For account linking: use a Google email matching an existing account → verify password prompt appears → enter correct password → verify accounts linked.

### Implementation for User Story 3

#### Backend Changes

- [ ] T022 [P] [US3] Create LinkGoogleDto in `backend/src/auth/dto/link-google.dto.ts` — define a DTO class with `idToken: string` (required, validated) and `password: string` (required, validated) fields. Use `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`) consistent with existing DTOs in the auth module
- [ ] T023 [US3] Modify `validateOAuthUser()` in `backend/src/auth/auth.service.ts` — change the account linking behavior (lines 252-267): when an existing user is found by email AND the user has a non-empty `passwordHash` (indicating email/password auth), throw a `ConflictException` with the body `{ statusCode: 409, message: 'An account with this email already exists. Please verify your password to link your Google account.', error: 'Conflict', code: 'ACCOUNT_EXISTS_NEEDS_LINK', email: existingUser.email }`. Keep the current auto-link behavior for users with empty `passwordHash` (pure OAuth users)
- [ ] T024 [US3] Implement `linkGoogleAccount()` method in `backend/src/auth/auth.service.ts` — create a new method `async linkGoogleAccount(idToken: string, password: string): Promise<TokenResponseDto>` that: (1) verifies the Google ID token (reuse `OAuth2Client.verifyIdToken` logic from `validateGoogleIdToken`), (2) extracts email from the Google token payload, (3) finds the existing user by email, (4) verifies the password with `bcrypt.compare(password, user.passwordHash)`, (5) if valid: updates the user with `googleId = providerId` and optionally `avatarUrl` from Google profile, then generates and returns tokens, (6) if invalid: throws `UnauthorizedException('Invalid password. Please try again.')`
- [ ] T025 [US3] Add `POST /auth/google/link` endpoint in `backend/src/auth/auth.controller.ts` — add a new `@Public()` `@Post('google/link')` method that accepts `@Body() linkGoogleDto: LinkGoogleDto`, calls `this.authService.linkGoogleAccount(linkGoogleDto.idToken, linkGoogleDto.password)`, and returns the `TokenResponseDto`. Add appropriate Swagger decorators (ApiOperation, ApiResponse for 200, 401, 404, 409)

#### Frontend Changes

- [ ] T026 [P] [US3] Add `linkGoogleAccount` API function in `rawy/services/auth.service.ts` — add a new exported function `linkGoogleAccount(idToken: string, password: string): Promise<TokenResponse>` that calls `POST /auth/google/link` with `{ idToken, password }` using the existing axios client. Follow the same pattern as `loginWithGoogleMobile`
- [ ] T027 [US3] Update `useGoogleAuth` hook to handle 409 response in `rawy/hooks/auth/use-google-auth.ts` — modify the `signInWithGoogle` function: when `loginWithGoogleMobile` throws an error with `response.status === 409` and `response.data.code === 'ACCOUNT_EXISTS_NEEDS_LINK'`, store the Google `idToken` and the email in state (add new state: `pendingLinkIdToken: string | null`, `pendingLinkEmail: string | null`, `showLinkDialog: boolean`). Export these states and a `confirmLink(password: string)` function. Also export a `cancelLink()` function to reset the state
- [ ] T028 [US3] Implement `confirmLink` function in `rawy/hooks/auth/use-google-auth.ts` — the `confirmLink(password: string)` function should: (1) call `linkGoogleAccount(pendingLinkIdToken, password)`, (2) on success: store tokens via `AuthContext.login()`, clear pending state, navigate to home, (3) on failure: set `googleError` to the error message (e.g., "Invalid password. Please try again."), keep the dialog open for retry
- [ ] T029 [US3] Add account linking password dialog UI in `rawy/app/(auth)/login.tsx` — import `pendingLinkEmail`, `showLinkDialog`, `confirmLink`, `cancelLink` from `useGoogleAuth`. When `showLinkDialog` is true, render a modal/dialog (using React Native Paper's `Dialog` component) that: (1) shows message: "An account with {email} already exists. Enter your password to link your Google account.", (2) contains a password `TextInput` (secure), (3) has "Cancel" and "Link Account" buttons, (4) on "Link Account": calls `confirmLink(password)`, (5) on "Cancel": calls `cancelLink()`, (6) shows loading state during the link request, (7) displays errors inline if password is wrong
- [ ] T030 [US3] Verify Google Sign-In button and error display on registration screen in `rawy/app/(auth)/register.tsx` — ensure the registration screen ALSO has a "Sign in with Google" button (FR-014 says both login AND registration screens). If not present, add one using the same `useGoogleAuth` hook pattern as `login.tsx`. Include the account linking dialog as well

**Checkpoint**: User Story 3 should be fully functional. Test by: (1) tapping "Sign in with Google" → Google dialog appears, (2) new Google account → account created, navigated home, (3) existing Google account → logged in, (4) Google email matches email/password user → password dialog appears, (5) correct password → accounts linked, logged in, (6) wrong password → error shown, can retry, (7) cancel → dialog dismissed, (8) network error → error message shown, can retry.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T031 [P] Verify audio format support completeness — test metadata extraction with each supported format: MP3, M4A, AAC, WAV, OGG, FLAC. Document any formats where duration extraction fails and add appropriate fallback messaging
- [ ] T032 [P] Test background playback battery impact — run a 1-hour background playback session and compare battery consumption against baseline. Verify it stays within the 15% increase target (SC-007)
- [ ] T033 Verify cross-feature interaction — test that: (1) background audio continues while uploading an episode, (2) Google Sign-In works for creators who then upload episodes with auto-metadata, (3) playback queue correctly reflects newly uploaded episodes after refresh
- [ ] T034 [P] Run quickstart.md validation — follow the setup and testing steps in `specs/002-podcast-app-enhancements/quickstart.md` end-to-end on a clean environment. Document any missing steps or inaccuracies
- [ ] T035 Code cleanup and consistency review — ensure all new code follows existing project conventions (naming, imports, error handling patterns). Remove any debug `console.log` statements. Verify TypeScript types are strict (no `any` where avoidable)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1, US2, US3 are **independent** and can proceed in parallel
  - Recommended sequential order: P1 → P2 → P3 (for incremental delivery)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — No dependencies on other stories
  - **Internal**: T008 (utility) must complete before T009–T012
- **User Story 2 (P2)**: Can start after Phase 2 — No dependencies on other stories
  - **Internal**: T013 (queue state) must complete before T014–T021. T014 (queue loading) before T015–T016 and T017
- **User Story 3 (P3)**: Can start after Phase 2 — No dependencies on other stories
  - **Internal**: Backend (T022–T025) can run in parallel with frontend prep (T026). T023 before T024–T025. Frontend T027–T028 depend on T026. T029 depends on T027–T028

### Parallel Opportunities

**Within User Story 1:**
- T008 (audio-metadata.ts utility) has no dependencies — start immediately

**Within User Story 2:**
- T017 (NowPlayingInfo) and T018 (audio focus) can run in parallel after T013

**Within User Story 3:**
- T022 (DTO) and T026 (frontend API function) can run in parallel
- Backend T023+T024+T025 and frontend T026 can be developed in parallel

**Across User Stories:**
- All three user stories can be developed in parallel after Phase 2

---

## Parallel Example: User Story 1

```bash
# Start with the utility (no dependencies):
Task T008: "Create audio metadata utility in rawy/utils/audio-metadata.ts"

# After T008 completes, T009-T012 can proceed sequentially:
Task T009: "Integrate metadata extraction into pickAudio in upload-episode.tsx"
Task T010: "Add duration display to Upload Episode form"
Task T011: "Update audio file picker accepted types"
Task T012: "Add error handling UI for extraction failure"
```

## Parallel Example: User Story 3

```bash
# Backend and frontend prep can run in parallel:
# Developer A (Backend):
Task T022: "Create LinkGoogleDto in backend/src/auth/dto/link-google.dto.ts"
Task T023: "Modify validateOAuthUser() in backend auth.service.ts"
Task T024: "Implement linkGoogleAccount() in backend auth.service.ts"
Task T025: "Add POST /auth/google/link endpoint in backend auth.controller.ts"

# Developer B (Frontend - in parallel with above):
Task T026: "Add linkGoogleAccount API function in rawy/services/auth.service.ts"
# Then after both backend + T026 complete:
Task T027: "Update useGoogleAuth hook for 409 handling"
Task T028: "Implement confirmLink function"
Task T029: "Add account linking password dialog UI"
Task T030: "Verify Google Sign-In on registration screen"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T007)
3. Complete Phase 3: User Story 1 (T008–T012)
4. **STOP and VALIDATE**: Pick audio files, verify auto-fill, verify 500 MB rejection
5. Deploy/demo if ready — creators immediately benefit from faster episode uploads

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (P1) → Test independently → Deploy (MVP! 🎯)
3. Add User Story 2 (P2) → Test independently → Deploy (background playback!)
4. Add User Story 3 (P3) → Test independently → Deploy (Google Sign-In!)
5. Polish Phase → Final validation → Release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (frontend only — fastest to complete)
   - Developer B: User Story 2 (frontend only — most complex)
   - Developer C: User Story 3 backend, then User Story 3 frontend
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No database schema changes needed — existing models support all features
- Background audio requires a **development build** (not Expo Go)
- Google Sign-In requires valid OAuth client IDs from Google Cloud Console
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
