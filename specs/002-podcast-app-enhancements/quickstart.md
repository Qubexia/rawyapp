# Quickstart: Podcast App Enhancements

**Branch**: `002-podcast-app-enhancements` | **Date**: 2026-03-07

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (`npx expo`)
- Android Studio (for Android development build) or Xcode (for iOS)
- MongoDB instance running (for backend)

## Project Structure

```
rawyapp/
├── backend/              # NestJS API (TypeScript, MongoDB, Passport)
│   ├── src/
│   │   ├── auth/         # ← Modified: Google account linking
│   │   ├── episodes/     # Unchanged
│   │   ├── users/        # Unchanged
│   │   └── ...
│   └── package.json
│
├── rawy/                 # Expo React Native app (TypeScript)
│   ├── app/
│   │   ├── (auth)/       # ← login.tsx: Google Sign-In UX updates
│   │   ├── (creator)/    # ← upload-episode.tsx: Auto-metadata extraction
│   │   ├── (tabs)/
│   │   ├── player.tsx    # Full-screen player
│   │   └── _layout.tsx   # Root layout with PlayerProvider
│   ├── context/
│   │   ├── auth-context.tsx
│   │   └── player-context.tsx  # ← Modified: queue, next/prev, background
│   ├── hooks/
│   │   └── auth/
│   │       └── use-google-auth.ts  # ← Modified: account linking flow
│   ├── services/
│   │   ├── auth.service.ts  # ← Modified: new link endpoint
│   │   └── episodes.service.ts
│   └── package.json
│
└── specs/
    └── 002-podcast-app-enhancements/  # This feature's documentation
```

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Configure MongoDB URI, JWT secrets, Google Client ID
npm run start:dev
```

Backend runs on `http://localhost:3000` by default.

### 2. Frontend (Expo)

```bash
cd rawy
npm install
npx expo start
```

> **Important**: Background audio and Google Sign-In require a **development build** (not Expo Go). Create one with:
> ```bash
> npx expo run:android   # For Android
> npx expo run:ios       # For iOS
> ```

### 3. Platform Configuration Required

#### iOS — Background Audio
Add to `app.json` under `expo.ios`:
```json
{
  "infoPlist": {
    "UIBackgroundModes": ["audio"]
  }
}
```

#### Android — Background Audio
Add to `app.json` under `expo.android`:
```json
{
  "permissions": [
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"
  ]
}
```

#### Google Sign-In
Ensure these are configured in `app.json`:
- `expo.android.googleServicesFile` pointing to `google-services.json`
- `expo.ios.googleServicesFile` pointing to `GoogleService-Info.plist`
- Google OAuth client IDs in `use-google-auth.ts` (already configured)

## Key Files to Modify

| Feature | Files |
|---------|-------|
| **Auto-Metadata** | `rawy/app/(creator)/upload-episode.tsx`, `rawy/utils/audio-metadata.ts` (new) |
| **Background Audio** | `rawy/context/player-context.tsx`, `rawy/app.json`, `rawy/components/layout/MiniPlayer.tsx` |
| **Google Sign-In** | `backend/src/auth/auth.service.ts`, `backend/src/auth/auth.controller.ts`, `rawy/hooks/auth/use-google-auth.ts`, `rawy/services/auth.service.ts`, `rawy/app/(auth)/login.tsx` |

## Testing Strategy

### Auto-Metadata Extraction
1. Pick an MP3 file with a known name and duration
2. Verify title field is pre-populated (extension stripped)
3. Verify duration field matches actual file duration (±1 second)
4. Pick a file > 500 MB — verify rejection with error message
5. Pick a non-audio file — verify graceful error

### Background Audio
1. Start playing an episode
2. Press home button — verify audio continues
3. Check notification bar for media controls
4. Test play/pause, next, previous from notification
5. Lock phone — verify lock screen controls
6. Return to app — verify player state is synced

### Google Sign-In
1. Tap "Continue with Google" — verify Google dialog appears
2. Sign in with new Google account — verify account creation
3. Sign in with existing Google account — verify login
4. Sign in with Google email matching existing email/password account — verify password prompt
5. Enter correct password — verify account linking
6. Enter wrong password — verify error message
