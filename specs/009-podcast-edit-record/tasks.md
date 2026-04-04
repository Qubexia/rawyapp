# Tasks: Podcast Edit, Episode Management & In-App Recording

**Input**: Design documents from `/specs/009-podcast-edit-record/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-endpoints.md

**Tests**: Included — Constitution Principle I (Test-First Development) mandates TDD for all features.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Admin Dashboard**: `admin-dashboard/src/`
- **Mobile App**: `rawy/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new setup needed — existing project infrastructure (NestJS backend, Next.js admin dashboard, Expo mobile app) is already in place.

- [x] T001 Verify existing backend file upload util supports M4A MIME type (`audio/x-m4a`, `audio/mp4`) in `backend/src/common/utils/file-upload.util.ts`
- [x] T002 [P] Configure expo-audio recording permissions in `rawy/app.json` (microphonePermission, enableBackgroundRecording)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core changes that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Extend UpdateEpisodeDto to include optional imageUrl in `backend/src/episodes/dto/update-episode.dto.ts`
- [x] T004 Add createEpisode method to AdminService with podcast creator attribution in `backend/src/admin/admin.service.ts`
- [x] T005 Add POST /admin/episodes endpoint to AdminController with FileFieldsInterceptor in `backend/src/admin/admin.controller.ts`
- [x] T006 Add PATCH /admin/episodes/:id with optional imageFile upload to AdminController in `backend/src/admin/admin.controller.ts`
- [x] T007 [P] Add createAdminEpisode method to adminEpisodeService in `admin-dashboard/src/services/adminEpisodeService.ts`
- [x] T008 [P] Add createRecordingEpisode method to episodes service in `rawy/services/episodes.service.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Admin Edits Published Podcasts (Priority: P1) 🎯 MVP

**Goal**: Admins can edit published podcast details (title, description, category, cover image) without unpublishing

**Independent Test**: Log in as admin, select a published podcast, modify fields, save, and verify changes appear on admin dashboard and public views

### Tests for User Story 1

- [x] T009 [P] [US1] Integration test: admin edits published podcast title/description in `backend/tests/admin/podcasts.spec.ts`
- [x] T010 [P] [US1] Integration test: admin edits published podcast cover image in `backend/tests/admin/podcasts.spec.ts`
- [x] T011 [P] [US1] Integration test: admin edits published podcast category in `backend/tests/admin/podcasts.spec.ts`
- [x] T012 [US1] Integration test: verify podcast remains published after edit in `backend/tests/admin/podcasts.spec.ts`

### Implementation for User Story 1

- [x] T013 [US1] Verify PodcastsService.update() does not restrict by status (confirm existing behavior) in `backend/src/podcasts/podcasts.service.ts`
- [x] T014 [US1] Update EditPodcastModal to support cover image file upload in `admin-dashboard/src/components/admin/EditPodcastModal.tsx`
- [x] T015 [US1] Update podcasts page edit flow to pass published podcasts to EditPodcastModal in `admin-dashboard/src/app/(dashboard)/podcasts/page.tsx`
- [x] T016 [US1] Add admin podcast update with imageFile support to adminPodcastService in `admin-dashboard/src/services/adminPodcastService.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Admin Adds Episodes to Any Podcast (Priority: P1) 🎯 MVP

**Goal**: Admins can create episodes for any podcast via admin dashboard with audio file upload, auto-title extraction, and creator attribution

**Independent Test**: Log in as admin, navigate to a podcast, upload an audio file, verify title auto-filled from filename, add details, submit, and confirm episode appears in podcast's episode list attributed to the podcast's creator

### Tests for User Story 2

- [x] T017 [P] [US2] Contract test: POST /admin/episodes returns 201 with episode object in `backend/tests/admin/episodes.spec.ts`
- [x] T018 [P] [US2] Integration test: admin creates episode attributed to podcast's original creator in `backend/tests/admin/episodes.spec.ts`
- [x] T019 [P] [US2] Integration test: admin creates episode increments podcast episodeCount in `backend/tests/admin/episodes.spec.ts`
- [x] T020 [P] [US2] Integration test: admin creates episode notifies followers in `backend/tests/admin/episodes.spec.ts`
- [x] T021 [P] [US2] Integration test: admin creates episode with unsupported file format returns 400 in `backend/tests/admin/episodes.spec.ts`
- [x] T022 [US2] Integration test: PATCH /admin/episodes/:id updates title/description/imageUrl in `backend/tests/admin/episodes.spec.ts`
- [x] T023 [US2] Integration test: PATCH /admin/episodes/:id does NOT allow audioFileUrl change in `backend/tests/admin/episodes.spec.ts`

### Implementation for User Story 2

- [x] T024 [US2] Implement POST /admin/episodes handler: resolve podcast creatorId, call EpisodesService.create() in `backend/src/admin/admin.service.ts`
- [x] T025 [US2] Implement PATCH /admin/episodes/:id handler: validate no audioFileUrl change, call EpisodesService.update() in `backend/src/admin/admin.service.ts`
- [x] T026 [P] [US2] Create useAdminEpisodes hook with createEpisode mutation in `admin-dashboard/src/hooks/useAdminEpisodes.ts`
- [x] T027 [P] [US2] Create admin episode creation page at `admin-dashboard/src/app/(dashboard)/podcast/[podcastId]/episode/create/page.tsx`
- [x] T028 [US2] Update CreateEpisodeForm to support file upload with auto-title from filename in `admin-dashboard/src/components/episode/CreateEpisodeForm.tsx`
- [x] T029 [US2] Update EditEpisodeModal to support cover image upload (metadata-only, no audio replacement) in `admin-dashboard/src/components/admin/EditEpisodeModal.tsx`
- [x] T030 [US2] Add episode creation action and edit metadata action to episodes page in `admin-dashboard/src/app/(dashboard)/episodes/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Creator Records Episode In-App (Priority: P2)

**Goal**: Creators can record audio directly in the app with start/pause/resume/stop controls, preview, and publish or save as draft

**Independent Test**: Open episode creation screen, select "Record", record a short clip, pause/resume, stop, preview, fill in details, select podcast, and publish

### Tests for User Story 3

- [x] T031 [P] [US3] Unit test: audio-recording utility start/pause/stop lifecycle in `rawy/utils/__tests__/audio-recording.spec.ts`
- [x] T032 [P] [US3] Unit test: recording duration tracking and max duration enforcement in `rawy/utils/__tests__/audio-recording.spec.ts`
- [x] T033 [P] [US3] Unit test: app interruption handling (pause on background, resume on foreground) in `rawy/utils/__tests__/audio-recording.spec.ts`
- [x] T034 [US3] Unit test: recording file upload with FormData in `rawy/services/__tests__/episodes.service.spec.ts`
- [x] T035 [US3] Integration test: full recording flow — record, preview, publish in `rawy/app/(creator)/__tests__/record-episode.spec.tsx`

### Implementation for User Story 3

- [x] T036 [P] [US3] Create RecordingControls component (start/pause/resume/stop buttons) in `rawy/components/ui/RecordingControls.tsx`
- [x] T037 [P] [US3] Create RecordingTimer component (live duration display) in `rawy/components/ui/RecordingTimer.tsx`
- [x] T038 [P] [US3] Create RecordingPreview component (playback preview after recording) in `rawy/components/ui/RecordingPreview.tsx`
- [x] T039 [US3] Create audio-recording utility: session management, expo-audio integration, M4A output, 3-hour limit in `rawy/utils/audio-recording.ts`
- [x] T040 [US3] Create record-episode screen: permission request, recording controls, preview, metadata form, podcast selector, publish/draft actions in `rawy/app/(creator)/record-episode.tsx`
- [x] T041 [US3] Modify upload-episode screen to add "Record" option alongside existing file picker in `rawy/app/(creator)/upload-episode.tsx`
- [x] T042 [US3] Add createRecordingEpisode method: convert recording URI to blob, build FormData, call existing createEpisode endpoint in `rawy/services/episodes.service.ts`
- [x] T043 [US3] Add AppState listener for recording interruption handling (pause on background, resume on foreground) in `rawy/utils/audio-recording.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 — Creator Edits Episode Metadata After Recording (Priority: P3)

**Goal**: Creators can edit episode title, description, and cover image after publishing without affecting the audio file

**Independent Test**: Record and publish an episode, then edit its title and description, and confirm changes are saved without affecting the audio file

### Tests for User Story 4

- [x] T044 [P] [US4] Integration test: creator edits published episode metadata in `rawy/app/(creator)/__tests__/edit-episode.spec.tsx`
- [x] T045 [US4] Integration test: creator edits published episode metadata does NOT change audioFileUrl in `rawy/app/(creator)/__tests__/edit-episode.spec.tsx`

### Implementation for User Story 4

- [x] T046 [US4] Verify existing edit-episode screen supports recorded episodes (audio file preserved during metadata edits) in `rawy/app/(creator)/edit-episode.tsx`
- [x] T047 [US4] Add "Re-record" option to edit-episode screen as alternative to audio file upload in `rawy/app/(creator)/edit-episode.tsx`

**Checkpoint**: All user stories are now independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T048 [P] Add Swagger/OpenAPI documentation for new admin endpoints in `backend/src/admin/admin.controller.ts`
- [x] T049 [P] Add structured logging for admin episode creation and edit operations in `backend/src/admin/admin.service.ts`
- [x] T050 [P] Add structured logging for recording session events (start, pause, stop, publish) in `rawy/utils/audio-recording.ts`
- [x] T051 Add upload progress indicator to admin episode creation form in `admin-dashboard/src/components/episode/CreateEpisodeForm.tsx`
- [x] T052 Add recording duration warning at 2h45m (15 minutes before 3-hour limit) in `rawy/components/ui/RecordingTimer.tsx`
- [x] T053 [P] Run quickstart.md validation for all feature flows in `specs/009-podcast-edit-record/quickstart.md`
- [x] T054 Run full test suite and verify all tests pass
---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Depends on T004-T006 (backend admin episode endpoints)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — No dependencies on US1/US2 (uses existing POST /episodes)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) — No dependencies on other stories (uses existing PATCH /episodes)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/components before services
- Services before endpoints/screens
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001 (Setup) and T002 (Setup) can run in parallel
- T003-T006 (Foundational backend) can run in parallel with T007-T008 (Foundational frontend/mobile services)
- T009-T012 (US1 tests) can all run in parallel
- T017-T021 (US2 tests) can all run in parallel
- T026 (US2 hook) and T027 (US2 page) can run in parallel
- T031-T033 (US3 tests) can all run in parallel
- T036-T038 (US3 UI components) can all run in parallel
- T044-T045 (US4 tests) can run in parallel
- T048-T050 (Polish logging/docs) can all run in parallel

---

## Parallel Example: User Story 3 (Recording)

```bash
# Launch all UI components for US3 together:
Task: "Create RecordingControls in rawy/components/ui/RecordingControls.tsx"
Task: "Create RecordingTimer in rawy/components/ui/RecordingTimer.tsx"
Task: "Create RecordingPreview in rawy/components/ui/RecordingPreview.tsx"

# Launch all US3 tests together:
Task: "Unit test: audio-recording lifecycle in rawy/utils/__tests__/audio-recording.spec.ts"
Task: "Unit test: duration tracking in rawy/utils/__tests__/audio-recording.spec.ts"
Task: "Unit test: interruption handling in rawy/utils/__tests__/audio-recording.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T008)
3. Complete Phase 3: User Story 1 (T009-T016)
4. **STOP and VALIDATE**: Test admin editing of published podcasts independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Admin edit published podcasts) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Admin episode creation) → Test independently → Deploy/Demo
4. Add User Story 3 (In-app recording) → Test independently → Deploy/Demo
5. Add User Story 4 (Edit after recording) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (admin podcast editing)
   - Developer B: User Story 2 (admin episode creation)
   - Developer C: User Story 3 (mobile recording)
   - Developer D: User Story 4 (edit after recording)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 54
- US1: 8 tasks, US2: 14 tasks, US3: 11 tasks, US4: 4 tasks, Setup: 2, Foundational: 6, Polish: 7
