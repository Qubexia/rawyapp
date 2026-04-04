# Research: Podcast Edit, Episode Management & In-App Recording

**Date**: 2026-04-03
**Feature**: 009-podcast-edit-record

## Decision 1: Audio Recording Library for Mobile App

**Context**: The spec requires in-app audio recording for creators on the Expo mobile app, outputting M4A (AAC) format with pause/resume support and a 3-hour max duration.

**Finding**: `expo-audio` (already installed at ~1.1.1) provides full recording capabilities:
- `useAudioRecorder` hook for recording lifecycle management
- `RecordingPresets.HIGH_QUALITY` outputs `.m4a` with AAC encoder by default (44.1kHz, 128kbps, stereo)
- `pause()` and `record()` methods for pause/resume
- `recordForDuration(seconds)` for max duration enforcement (10800 seconds = 3 hours)
- `useAudioRecorderState` hook for real-time status polling (duration, isRecording)
- `requestRecordingPermissionsAsync()` for microphone permission handling
- Background recording support via config plugin (`enableBackgroundRecording: true`)
- App interruption handling via `setAudioModeAsync({ allowsRecording: true })`

**Decision**: Use the existing `expo-audio` library for recording. No new dependency needed.

**Rationale**: The library is already installed, outputs M4A natively, supports all required features (pause/resume, duration limits, permissions, interruptions), and is maintained by Expo.

**Alternatives considered**:
- `expo-av` (deprecated, superseded by `expo-audio`)
- `react-native-audio-recorder-player` (third-party, requires native linking)
- `expo-audio-recorder` (not an official Expo package)

## Decision 2: Admin Episode Creation Attribution

**Context**: When an admin creates an episode for a podcast, the episode's `creatorId` must be set to the podcast's original creator (per clarification session).

**Finding**: The existing `EpisodesService.create()` method accepts a `creatorId` from the authenticated user. The admin controller currently passes the admin's user ID. We need to modify the admin flow to:
1. Look up the podcast's `creatorId` before creating the episode
2. Pass the podcast creator's ID to `EpisodesService.create()` instead of the admin's ID

**Decision**: Add a new admin-specific episode creation method that resolves the podcast's creator ID and passes it to the episode service.

**Rationale**: Preserves content ownership model, keeps follower notifications semantically correct, and avoids confusing creator attribution in analytics.

**Alternatives considered**:
- Adding a `createdByAdminId` audit field alongside the original creator (rejected as unnecessary complexity)
- Attributing to the admin (rejected per user clarification)

## Decision 3: Admin Episode Edit Scope

**Context**: Admins can edit episode metadata (title, description, cover image) but NOT replace the audio file (per clarification session).

**Finding**: The existing `PATCH /admin/episodes/:id` endpoint already supports updating title and description. The `UpdateEpisodeDto` only allows `title` and `description`. We need to add `imageUrl` to the admin update DTO and ensure the admin controller/service supports cover image replacement.

**Decision**: Extend `UpdateEpisodeDto` to include optional `imageUrl` for admin use, and add file upload support for cover image replacement in the admin episode edit flow.

**Rationale**: The existing endpoint handles title/description. Adding cover image support completes the metadata editing capability without touching audio files.

## Decision 4: Recording File Upload Flow

**Context**: After recording, the M4A file needs to be uploaded to the backend to create the episode.

**Finding**: The existing `createEpisode()` service method in the mobile app already handles multipart form-data uploads with `FormData`, `audioFile` blob, and upload progress tracking. The recorded file from `expo-audio` is available as a local URI (`recorder.uri`). We need to:
1. Convert the local recording URI to a blob/file
2. Build FormData with the recording file
3. Use the existing `createEpisode()` mutation

**Decision**: Create a new utility function `audio-recording.ts` that manages the recording session (start, pause, stop, get file) and integrates with the existing episode creation service.

**Rationale**: Reuses the existing upload infrastructure, maintains consistency with the file upload flow, and keeps recording logic isolated.

## Decision 5: Backend Admin Episode Creation Endpoint

**Context**: The admin dashboard needs to create episodes for any podcast with file upload, auto-title extraction, and creator attribution.

**Finding**: The existing `POST /episodes` endpoint requires CREATOR role and attributes episodes to the authenticated user. The admin API (`/admin/episodes`) currently only supports list, get, update, and delete — not creation. We need to add `POST /admin/episodes` with:
- ADMIN role guard
- File upload support (audio + optional image)
- Automatic creator attribution from podcast's creatorId
- Episode count increment and follower notification (handled by EpisodesService)

**Decision**: Add `POST /admin/episodes` endpoint to the admin controller, delegating to `EpisodesService.create()` with the resolved podcast creator ID.

**Rationale**: Keeps the admin API surface consistent, reuses existing episode creation logic, and properly separates admin from creator operations.
