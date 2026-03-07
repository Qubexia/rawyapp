# Implementation Plan: Podcast App Enhancements

**Branch**: `002-podcast-app-enhancements` | **Date**: 2026-03-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-podcast-app-enhancements/spec.md`

## Summary

This feature delivers three enhancements to the RAWY Podcast App:

1. **Auto-Extract Episode Metadata** (P1): When a creator selects an audio file during episode upload, the app automatically extracts the episode title from the file name and the audio duration from the file contents, pre-filling the form fields.

2. **Background Audio Playback** (P2): Audio continues playing when the app is backgrounded or the device is locked. A persistent media notification with play/pause, next, and previous controls is displayed. The playback queue is derived from episodes within the same podcast, ordered by publish date.

3. **Google Sign-In** (P3): Enhances the existing partial Google auth implementation to be fully functional. Includes secure account linking with password verification when the Google email matches an existing email/password account.

**Technical approach**: All three features leverage existing infrastructure — `expo-audio` for playback, `expo-auth-session` for Google auth, and `expo-document-picker` for file selection. The backend requires one new endpoint (`POST /auth/google/link`) and modification of the existing OAuth flow. No schema changes are needed.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.7 (backend)  
**Primary Dependencies**: Expo SDK 54, React Native 0.81, NestJS 11, expo-audio, expo-auth-session, expo-document-picker  
**Storage**: MongoDB (via Mongoose/NestJS Mongoose)  
**Testing**: Jest (backend), manual testing (frontend — Expo)  
**Target Platform**: Android & iOS (React Native via Expo), Node.js server  
**Project Type**: Mobile app (Expo/React Native) + REST API (NestJS)  
**Performance Goals**: Audio metadata extraction <3s, notification control response <1s, Google sign-in <10s  
**Constraints**: Must use Expo development build (not Expo Go) for background audio and Google Sign-In native modules  
**Scale/Scope**: Single-user local playback, ~50 screens, standard podcast episode sizes (≤500 MB)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file (`.specify/memory/constitution.md`) is an unfilled template with no active principles defined. **No gates to enforce.** Proceeding without violations.

**Post-Phase 1 Re-check**: No violations. The design maintains the existing monorepo structure (backend + rawy frontend), uses existing dependencies where possible, and introduces minimal new complexity.

## Project Structure

### Documentation (this feature)

```text
specs/002-podcast-app-enhancements/
├── plan.md              # This file
├── spec.md              # Feature specification (with clarifications)
├── research.md          # Phase 0: Technology research & decisions
├── data-model.md        # Phase 1: Entity definitions & data flows
├── quickstart.md        # Phase 1: Setup & testing guide
├── contracts/
│   └── api-endpoints.md # Phase 1: API contract changes
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts    # ← Add POST /auth/google/link
│   │   ├── auth.service.ts       # ← Modify validateOAuthUser, add linkGoogleAccount
│   │   └── dto/
│   │       └── link-google.dto.ts  # ← NEW: DTO for link request
│   ├── episodes/                 # No changes
│   └── users/                    # No changes
└── package.json

rawy/
├── app/
│   ├── (auth)/
│   │   └── login.tsx             # ← Handle account linking password prompt
│   ├── (creator)/
│   │   └── upload-episode.tsx    # ← Add auto-metadata extraction
│   ├── player.tsx                # ← Update for queue-based next/prev
│   └── _layout.tsx               # No changes needed
├── context/
│   └── player-context.tsx        # ← Major: add queue, next, prev, NowPlayingInfo
├── hooks/
│   └── auth/
│       └── use-google-auth.ts    # ← Handle 409 + link flow
├── services/
│   └── auth.service.ts           # ← Add linkGoogleAccount API call
├── utils/
│   └── audio-metadata.ts         # ← NEW: extract title & duration from audio file
├── app.json                      # ← Add iOS UIBackgroundModes, Android permissions
└── package.json
```

**Structure Decision**: Uses the existing monorepo layout (backend + rawy mobile frontend). No new top-level directories or packages needed. Changes are localized to existing modules with one new utility file (`audio-metadata.ts`) and one new DTO (`link-google.dto.ts`).

## Complexity Tracking

> No constitution violations to justify. All changes stay within existing architecture and patterns.
