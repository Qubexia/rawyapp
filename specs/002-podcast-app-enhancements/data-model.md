# Data Model: Podcast App Enhancements

**Branch**: `002-podcast-app-enhancements` | **Date**: 2026-03-07

## Existing Entities (Modifications)

### User (backend: `users/schemas/user.schema.ts`)

No schema changes required. The `User` schema already has:
- `googleId?: string` — used for Google OAuth linking
- `avatarUrl?: string` — used for Google profile picture
- `passwordHash: string` — used for account linking verification

**Note**: The `passwordHash` field is empty (`''`) for pure OAuth users. The linking flow must check `passwordHash !== ''` to determine if the user is an email/password user vs. a pure OAuth user.

### Episode (backend: `episodes/schemas/episode.schema.ts`)

No schema changes required. The `Episode` schema already has:
- `duration?: number` — optional, will be auto-populated from client-side extraction
- `title: string` — will be auto-populated from file name
- `podcastId: ObjectId` — used to derive the playback queue (all episodes of this podcast)

---

## New Entities (Client-Side Only)

### PlaybackQueue (frontend: `context/player-context.tsx`)

**Purpose**: Manages the ordered list of episodes for next/previous navigation during playback.

| Field | Type | Description |
|-------|------|-------------|
| `episodes` | `Episode[]` | Ordered list of episodes from the same podcast, sorted by `createdAt` descending (newest first) |
| `currentIndex` | `number` | Index of the currently playing episode within the queue |
| `podcastId` | `string` | ID of the podcast the queue is derived from |

**State Transitions**:
```
[No Queue] --playEpisode(ep)--> [Queue Loaded] --playNext()--> [Next Episode]
                                                --playPrevious()--> [Previous Episode or Restart]
[Queue Loaded] --dismiss()--> [No Queue]
[Queue Loaded] --playEpisode(different podcast ep)--> [New Queue Loaded]
```

**Validation Rules**:
- `currentIndex` must be `>= 0` and `< episodes.length`
- `playNext()` is a no-op if `currentIndex` is the last episode
- `playPrevious()` restarts the current episode if <3 seconds elapsed; otherwise goes to previous episode
- `playPrevious()` is a no-op if `currentIndex` is 0 and <3 seconds have not elapsed (it already restarts)

### AudioMetadata (frontend: transient, used during upload)

**Purpose**: Holds extracted metadata from a picked audio file, used to pre-fill the episode creation form.

| Field | Type | Description |
|-------|------|-------------|
| `extractedTitle` | `string` | Episode title derived from the file name (extension removed, cleaned) |
| `durationSeconds` | `number \| null` | Duration in seconds extracted from the audio file, or null if extraction failed |
| `fileSizeBytes` | `number` | File size in bytes for validation against 500 MB limit |
| `isValid` | `boolean` | Whether the file passed validation (valid audio format, under size limit) |

**Validation Rules**:
- `fileSizeBytes` must be ≤ 524,288,000 (500 MB)
- `extractedTitle` strips the file extension (`.mp3`, `.m4a`, `.wav`, etc.) and trims whitespace
- `extractedTitle` is truncated to 200 characters
- If `extractedTitle` is empty after cleaning, leave the title field blank for manual entry

---

## Entity Relationships

```
User
  └── 1:N ──► Podcast
                └── 1:N ──► Episode
                              └── forms ──► PlaybackQueue (client-side, derived at runtime)
                              └── produces ──► AudioMetadata (client-side, transient during upload)
```

## Data Flow Diagrams

### Auto-Metadata Extraction Flow
```
[User picks audio file]
    │
    ▼
[expo-document-picker returns asset]
    │
    ├── Extract file name → clean → set title field
    ├── Check file size → validate ≤ 500 MB
    │
    ▼
[Load audio into tmp Audio.Sound]
    │
    ├── Read durationMillis → convert to seconds → set duration field
    └── Unload Audio.Sound (release resources)
```

### Playback Queue Derivation Flow
```
[User taps play on Episode X in Podcast P]
    │
    ▼
[Fetch all episodes of Podcast P (GET /episodes?podcastId=P)]
    │
    ▼
[Sort by createdAt descending]
    │
    ▼
[Build PlaybackQueue { episodes, currentIndex = indexOf(X), podcastId = P }]
    │
    ▼
[Start playback of Episode X]
    │
    ├── Next → episodes[currentIndex + 1] (if exists)
    └── Previous → restart if <3s, else episodes[currentIndex - 1]
```

### Google Account Linking Flow
```
[User taps "Sign in with Google"]
    │
    ▼
[Google OAuth returns ID token]
    │
    ▼
[Backend: POST /auth/google/mobile { idToken }]
    │
    ├── Google ID found → login (return tokens)
    ├── Email NOT found → create new user (return tokens)
    └── Email found, has passwordHash → return 409 CONFLICT { code: 'ACCOUNT_EXISTS_NEEDS_LINK' }
              │
              ▼
        [Frontend shows password prompt]
              │
              ▼
        [POST /auth/google/link { idToken, password }]
              │
              ├── Password valid → link googleId, return tokens
              └── Password invalid → 401 UNAUTHORIZED
```
