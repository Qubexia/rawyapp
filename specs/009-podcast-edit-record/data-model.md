# Data Model: Podcast Edit, Episode Management & In-App Recording

**Date**: 2026-04-03
**Feature**: 009-podcast-edit-record

## Entity Changes

### Podcast (Existing — No Schema Changes)

**Status**: Unchanged. The existing Podcast schema already supports all fields needed for admin editing (title, description, category, coverImageUrl, status). The only behavioral change is that admins can now edit podcasts with `status: 'published'` without requiring a status transition.

**Existing fields**:
- `title`: string, required, 3-100 chars
- `description`: string, required, 10-2000 chars
- `coverImageUrl`: string, optional
- `creatorId`: ObjectId ref to User, required
- `episodeCount`: number, default 0
- `category`: enum (8 values)
- `status`: enum (`draft`, `published`)

### Episode (Existing — No Schema Changes)

**Status**: Unchanged. The existing Episode schema already supports all fields. New episodes created from in-app recordings use the same schema as uploaded episodes. The `creatorId` is set to the podcast's original creator when an admin creates an episode (per clarification).

**Existing fields**:
- `title`: string, required, 3-200 chars
- `description`: string, required, 10-5000 chars
- `audioFileUrl`: string, required
- `duration`: number, optional, seconds
- `podcastId`: ObjectId ref to Podcast, required
- `creatorId`: ObjectId ref to User, required
- `viewsCount`, `likesCount`, `commentsCount`: number, default 0
- `imageUrl`: string, optional

### Recording Session (New — Transient, Client-Side Only)

**Status**: New transient entity managed entirely on the mobile client. Not persisted to the database. Exists only during the recording flow.

**Fields**:
- `state`: enum (`idle`, `recording`, `paused`, `stopped`)
- `durationSeconds`: number, current recording duration
- `maxDurationSeconds`: number, 10800 (3 hours)
- `tempFileUri`: string, local file path of the recording (from `expo-audio`)
- `podcastId`: string, optional, selected before or after recording
- `title`: string, optional, auto-filled or user-edited
- `description`: string, optional, user-edited
- `imageUrl`: string, optional, user-selected cover image
- `createdAt`: timestamp, when recording session started
- `pauseEvents`: array of `{ pausedAt, resumedAt }`, for tracking pause/resume history

**Lifecycle**:
```
idle → recording → paused → recording → ... → stopped → (publish or discard)
                                                    → (save as draft)
```

**Transitions**:
- `idle` → `recording`: User presses record, permissions granted
- `recording` → `paused`: User presses pause or app interrupted
- `paused` → `recording`: User presses resume or app returns to foreground
- `recording` → `stopped`: User presses stop, max duration reached, or storage full
- `paused` → `stopped`: User presses stop
- `stopped` → `publish`: Episode created via API
- `stopped` → `save as draft`: Episode saved locally or as draft on server
- `stopped` → `discard`: Recording deleted, no episode created

## Validation Rules (from Spec)

| Rule | Source | Enforcement |
|------|--------|-------------|
| Max recording duration: 3 hours (10800 seconds) | FR-007, Clarification | Client-side (`recordForDuration`) + server-side validation |
| Recording output format: M4A (AAC) | FR-006, Clarification | Client-side (`RecordingPresets.HIGH_QUALITY`) |
| Audio file size limit: 100MB | FR-005, Assumptions | Server-side (multer config) |
| Supported audio formats: MP3, M4A, WAV, OGG, FLAC | FR-004 | Server-side (file filter) |
| Episode title auto-fill from filename | FR-003 | Client-side (filename parsing) |
| Admin-created episodes attributed to podcast creator | Clarification Q1 | Server-side (admin service resolves podcast creatorId) |
| Admin episode edits: metadata only, no audio replacement | Clarification Q4 | Server-side (UpdateEpisodeDto excludes audioFileUrl) |

## Relationships

```
Podcast (1) ──< Episode (N)
  └── creatorId → User (creator)
  └── episodeCount auto-incremented on episode creation

Episode (N) ──> Podcast (1)
  └── podcastId → Podcast
  └── creatorId → User (podcast's original creator, even when admin creates)

Recording Session (transient) ──> Podcast (1)
  └── podcastId → Podcast (optional, selected before or after recording)
  └── Creates Episode on publish
```
