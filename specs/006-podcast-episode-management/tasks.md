# Tasks: Podcast and Episode Management with Admin Dashboard

**Feature**: Podcast and Episode Management with Admin Dashboard  
**Branch**: `006-podcast-episode-management`  
**Date**: 2026-03-30  
**Spec**: [spec.md](spec.md)

## Implementation Strategy

This feature implements podcast and episode management with an admin dashboard. The backend APIs already exist; the focus is on frontend implementation and adding the podcast status field. MVP scope includes User Story 1 (Create Podcast) as the primary deliverable.

## Dependencies

```
US1 (Create Podcast) → US2 (Add Episode) → US3 (Admin View) → US4 (Admin Management)
                                                           ↓
                                                    US5 (Backend Check) [independent]
```

**Story Completion Order**:
- US1 and US2 are sequential (episodes require podcasts)
- US3 can start after US1 is complete
- US4 can start after US3 data is visible
- US5 is independent and can run in parallel

**Parallel Opportunities**:
- US1 (podcast creation UI) and US2 (episode creation UI) can be built in parallel once services exist
- US3 (admin views) and US5 (backend check) can run in parallel

---

## Phase 1: Setup

*No setup tasks required - project already initialized*

---

## Phase 2: Foundational

These tasks must complete before user story implementation begins.

- [x] T001 Add status field to Podcast schema in backend/src/podcasts/schemas/podcast.schema.ts
- [x] T002 Create frontend API client service in frontend/src/services/api.ts
- [x] T003 Configure Axios base instance with interceptors in frontend/src/lib/axios.ts
- [x] T004 Create podcast types in frontend/src/types/podcast.ts
- [x] T005 Create episode types in frontend/src/types/episode.ts

---

## Phase 3: User Story 1 - Create Podcast (Priority: P1)

**Goal**: Allow creators to create podcasts with title, description, and category  
**Independent Test**: Creator can create a podcast and see it in their profile

- [x] T006 [US1] Create podcast service methods in frontend/src/services/podcastService.ts
- [x] T007 [US1] Create useCreatePodcast hook in frontend/src/hooks/usePodcast.ts
- [x] T008 [US1] Build CreatePodcastForm component in frontend/src/components/podcast/CreatePodcastForm.tsx
- [x] T009 [US1] Create podcast creation page in frontend/src/app/creator/podcast/create/page.tsx
- [x] T010 [US1] Add podcast list display in frontend/src/app/creator/podcasts/page.tsx

**Tests**: Not requested (backend APIs already exist)

---

## Phase 4: User Story 2 - Add Episode to Podcast (Priority: P1)

**Goal**: Allow creators to add episodes to their podcasts  
**Independent Test**: Creator can add an episode and see it in the podcast's episode list

- [x] T011 [US2] Create episode service methods in frontend/src/services/episodeService.ts
- [x] T012 [US2] Create useCreateEpisode hook in frontend/src/hooks/useEpisode.ts
- [x] T013 [US2] Build CreateEpisodeForm component in frontend/src/components/episode/CreateEpisodeForm.tsx
- [x] T014 [US2] Create episode creation page in frontend/src/app/creator/podcast/[podcastId]/episode/create/page.tsx
- [x] T015 [US2] Add episode list display in frontend/src/app/podcast/[podcastId]/page.tsx
- [x] T016 [US2] Update podcast episode count after episode creation

**Tests**: Not requested (backend APIs already exist)

---

## Phase 5: User Story 3 - View Podcasts and Episodes in Admin Dashboard (Priority: P1)

**Goal**: Allow admins to view all podcasts and episodes with pagination and filtering  
**Independent Test**: Admin can see paginated list of all podcasts and episodes

- [x] T017 [US3] Create admin podcast service in frontend/src/services/adminPodcastService.ts
- [x] T018 [US3] Create admin episode service in frontend/src/services/adminEpisodeService.ts
- [x] T019 [US3] Create useAdminStats hook in frontend/src/hooks/useAdminStats.ts
- [x] T020 [US3] Build AdminDashboard component in frontend/src/components/admin/AdminDashboard.tsx
- [x] T021 [US3] Create podcasts list page in frontend/src/app/admin/podcasts/page.tsx
- [x] T022 [US3] Create episodes list page in frontend/src/app/admin/episodes/page.tsx
- [x] T023 [US3] Add pagination and search to admin podcast list
- [x] T024 [US3] Add pagination and search to admin episode list

**Tests**: Not requested

---

## Phase 6: User Story 4 - Admin Management of Podcasts and Episodes (Priority: P2)

**Goal**: Allow admins to update and delete podcasts and episodes  
**Independent Test**: Admin can edit or remove any podcast/episode

- [x] T025 [US4] Add update podcast functionality in adminPodcastService.ts
- [x] T026 [US4] Add delete podcast functionality in adminPodcastService.ts
- [x] T027 [US4] Add update episode functionality in adminEpisodeService.ts
- [x] T028 [US4] Add delete episode functionality in adminEpisodeService.ts
- [x] T029 [US4] Build EditPodcastModal component in frontend/src/components/admin/EditPodcastModal.tsx
- [x] T030 [US4] Build EditEpisodeModal component in frontend/src/components/admin/EditEpisodeModal.tsx
- [x] T031 [US4] Add delete confirmation dialog in frontend/src/components/admin/DeleteConfirmDialog.tsx

**Tests**: Not requested

---

## Phase 7: User Story 5 - Backend Connection Verification (Priority: P2)

**Goal**: Verify frontend can communicate with backend and handle errors gracefully  
**Independent Test**: App displays connection status and handles failures

- [x] T032 [US5] Create health check service in frontend/src/services/healthService.ts
- [x] T033 [US5] Build useHealthCheck hook in frontend/src/hooks/useHealthCheck.ts
- [x] T034 [US5] Add connection status indicator in frontend/src/components/common/ConnectionStatus.tsx
- [x] T035 [US5] Integrate health check on app initialization in frontend/src/app/layout.tsx
- [x] T036 [US5] Add global error handler for API failures in frontend/src/lib/axios.ts

**Tests**: Not requested

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T037 Handle podcast deleted while viewing (redirect or show message)
- [x] T038 Handle audio file upload failures with retry option
- [x] T039 Validate episode count limits and display appropriate message
- [x] T040 Sanitize special characters in podcast/episode titles
- [x] T041 Add loading states to all async operations
- [x] T042 Verify SC-001: podcast creation under 30 seconds
- [x] T043 Verify SC-002: episodes appear within 5 seconds
- [x] T044 Verify SC-003: admin dashboard loads under 3 seconds

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 44 |
| User Story 1 (Create Podcast) | 5 tasks |
| User Story 2 (Add Episode) | 6 tasks |
| User Story 3 (Admin View) | 8 tasks |
| User Story 4 (Admin Management) | 7 tasks |
| User Story 5 (Backend Check) | 5 tasks |
| Foundational | 5 tasks |
| Polish | 8 tasks |

**Parallel Execution Opportunities**:
- US1 and US2 can be built in parallel after foundational phase
- US3 and US5 can run in parallel after US1 is complete

**MVP Scope**: Tasks T001-T010 (Phase 2 + Phase 3) represent the MVP - creating podcasts as a creator. This delivers value independently.