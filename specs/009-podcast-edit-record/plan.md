# Implementation Plan: Podcast Edit, Episode Management & In-App Recording

**Branch**: `009-podcast-edit-record` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-podcast-edit-record/spec.md`

## Summary

This feature adds three capabilities: (1) admin editing of published podcasts and episode creation with auto-title extraction via the Next.js admin dashboard, (2) in-app audio recording for creators on the Expo mobile app with M4A output, pause/resume support, and draft saving, and (3) admin episode metadata editing (no audio replacement). The backend requires minimal changes since existing podcast/episode APIs already support the needed operations; the primary work is frontend UI/UX in the admin dashboard and a new recording flow in the mobile app.

## Technical Context

**Language/Version**: TypeScript 5.7.3 (backend), TypeScript 5.9.2 (mobile), TypeScript 5.x (admin dashboard)
**Primary Dependencies**: NestJS 11.x (backend), Expo SDK 54 / React Native 0.81.5 (mobile), Next.js 14.2 (admin dashboard), Mongoose 9.2, expo-audio 1.1 (playback only — recording needs new library)
**Storage**: MongoDB (Mongoose ODM), local filesystem for audio/image uploads (`./uploads/audio`, `./uploads/images`), 100MB file size limit
**Testing**: Jest with ts-jest (backend), platform-appropriate testing for mobile and admin dashboard
**Target Platform**: Linux/Windows server (backend), iOS/Android (Expo mobile), Web (Next.js admin dashboard)
**Project Type**: Web service (NestJS API) + Mobile app (Expo) + Web admin dashboard (Next.js)
**Performance Goals**: Admin podcast edits reflected within 5 seconds; episode upload completion in under 2 minutes; recording sessions up to 3 hours without data loss
**Constraints**: M4A (AAC) output for recordings; 100MB file size limit; 3-hour max recording duration; episodes attributed to podcast's original creator when created by admin; admin episode edits limited to metadata only
**Scale/Scope**: Existing podcast platform with User/Creator/Admin roles; extends admin dashboard (3 pages) and mobile app (1-2 new screens + 1 modified screen)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | Unit tests required for all new services (recording service, admin episode creation); integration tests for any new/modified API endpoints; contract tests for updated API responses |
| II. Modular Library-First | PASS | Recording functionality encapsulated as a self-contained module/service in the mobile app; admin episode creation reuses existing episode service with admin context |
| III. Role-Based Access Control | PASS | Admin operations guarded by ADMIN role; creator recording guarded by CREATOR role; existing guards and decorators reused |
| IV. API-First Design | PASS | New/modified contracts documented in `contracts/` before implementation; existing endpoints reused where sufficient |
| V. Observability | PASS | Recording session events logged; admin actions logged; error tracking for upload failures and recording interruptions |

### Post-Design Re-evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | Confirmed: tests planned for recording utility, admin episode creation, admin episode metadata edit, and all modified endpoints |
| II. Modular Library-First | PASS | Confirmed: `audio-recording.ts` utility isolates recording logic; admin episode creation delegates to existing EpisodesService; no tight coupling |
| III. Role-Based Access Control | PASS | Confirmed: `@Roles(Role.ADMIN)` on new admin endpoints; `@Roles(Role.CREATOR)` on episode creation (unchanged); creator attribution logic enforced server-side |
| IV. API-First Design | PASS | Confirmed: `contracts/api-endpoints.md` defines POST /admin/episodes and extended PATCH /admin/episodes/:id before implementation |
| V. Observability | PASS | Confirmed: recording state transitions, upload progress/errors, and admin actions all have logging points defined in research |

## Project Structure

### Documentation (this feature)

```text
specs/009-podcast-edit-record/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (not created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── episodes/
│   │   ├── episodes.controller.ts        # Modified: admin episode creation endpoint
│   │   └── episodes.service.ts           # Modified: support admin-as-creator attribution
│   ├── podcasts/
│   │   ├── podcasts.controller.ts        # No changes needed (already supports editing published)
│   │   └── podcasts.service.ts           # No changes needed (already supports editing published)
│   └── admin/
│       ├── admin.controller.ts           # Modified: add episode creation + episode metadata edit endpoints
│       └── admin.service.ts              # Modified: delegate to episode service with creator attribution
└── tests/
    ├── admin/
    │   ├── episodes.spec.ts              # Extended: admin episode creation tests
    │   └── podcasts.spec.ts              # Extended: admin edit published podcast tests
    └── episodes/
        └── episodes.service.spec.ts      # Extended: creator attribution tests

admin-dashboard/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── podcasts/
│   │       │   └── page.tsx              # Modified: edit published podcast flow
│   │       ├── episodes/
│   │       │   └── page.tsx              # Modified: add episode creation + metadata edit
│   │       └── podcast/
│   │           └── [podcastId]/
│   │               └── episode/
│   │                   └── create/       # New: episode creation page for admin
│   ├── components/
│   │   ├── episode/
│   │   │   ├── CreateEpisodeForm.tsx     # Modified: add file upload with auto-title
│   │   │   └── EditEpisodeModal.tsx      # Modified: metadata-only editing
│   │   └── podcast/
│   │       └── EditPodcastModal.tsx      # Modified: support published podcast editing
│   ├── services/
│   │   ├── adminEpisodeService.ts        # Modified: add create episode method
│   │   └── adminPodcastService.ts        # No changes needed
│   └── hooks/
│       ├── useAdminEpisodes.ts           # New: admin episode creation hook
│       └── useAdminPodcasts.ts           # No changes needed

rawy/
├── app/
│   └── (creator)/
│       ├── upload-episode.tsx            # Modified: add "Record" option alongside file picker
│       └── record-episode.tsx            # New: in-app recording screen
├── components/
│   └── ui/
│       ├── RecordingControls.tsx         # New: start/pause/resume/stop controls
│       ├── RecordingTimer.tsx            # New: live duration display
│       └── RecordingPreview.tsx          # New: playback preview after recording
├── hooks/
│   └── queries/
│       └── use-episodes.ts               # No changes needed
├── services/
│   └── episodes.service.ts               # Modified: add recording upload method
├── utils/
│   └── audio-recording.ts                # New: recording session management
└── validation/
    └── episode.schemas.ts                # No changes needed (reuse existing)
```

**Structure Decision**: Mobile + API pattern. The backend (NestJS) serves both the Expo mobile app and the Next.js admin dashboard. New functionality is distributed across: backend admin endpoints (minimal changes), admin dashboard UI (new episode creation page, modified edit modals), and mobile app recording flow (new screen, components, and utilities).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New recording library dependency (expo-audio-recorder or expo-av) | expo-audio only supports playback, not recording | Cannot implement in-app recording without a recording-capable library |
