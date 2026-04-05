# Tasks: Rawy Hybrid Podcast Platform

**Input**: Design documents from `/specs/011-podcast-hybrid-platform/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: REQUIRED - TDD is mandatory per Constitution

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Note**: Backend already exists at `backend/src/`. Tasks here are for adding NEW modules.

- [x] T001 Add episodes module directory structure in backend/src/episodes/
- [x] T002 Add sync module directory structure in backend/src/sync/
- [x] T003 Add claims module directory structure in backend/src/claims/
- [x] T004 [P] Add common guards directory for new guards in backend/src/common/guards/
- [x] T005 Configure file upload utilities in backend/src/common/utils/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Note**: Auth module, guards, and logging already exist. Tasks here add NEW functionality.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Add source field to Podcast schema in backend/src/podcasts/schemas/podcast.schema.ts
- [x] T007 [P] Add autoSync field to Podcast schema
- [x] T008 Add subscriptions array to User schema in backend/src/users/schemas/user.schema.ts
- [x] T009 Create Episode schema in backend/src/episodes/schemas/episode.schema.ts
- [x] T010 Create ClaimRequest schema in backend/src/claims/schemas/claim-request.schema.ts
- [x] T011 [P] Create OwnershipGuard in backend/src/common/guards/ownership.guard.ts
- [x] T012 Add @Roles decorator usage for new creator endpoints

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Standard Listener Sign Up and Podcast Discovery (Priority: P1) 🎯 MVP

**Goal**: Users can register, login, browse Top 100 Apple podcasts, and subscribe to external podcasts

**Independent Test**: Can be fully tested by creating an account, logging in, browsing Discover, and subscribing to a podcast

### Tests for User Story 1 (TDD - Write First, Must Fail) ⚠️

- [x] T013 [P] [US1] Unit test for AppleApiService.fetchTopPodcasts() in backend/tests/unit/apple-api.service.spec.ts
- [x] T014 [P] [US1] Unit test for EpisodesService.findByPodcast() in backend/tests/unit/episodes.service.spec.ts
- [x] T015 [US1] Integration test for podcast discovery in backend/tests/integration/podcast-discovery.spec.ts

### Implementation for User Story 1

**Note**: Auth module already exists. Tasks here ENHANCE existing functionality.

- [x] T016 [P] [US1] Extend PodcastsController with discover() endpoint in backend/src/podcasts/podcasts.controller.ts
- [x] T017 [US1] Implement Apple Podcasts API service in backend/src/podcasts/services/apple-api.service.ts
- [x] T018 [US1] Implement GET /podcasts/discover endpoint
- [x] T019 [P] [US1] Create EpisodeService in backend/src/episodes/episodes.service.ts
- [x] T020 [P] [US1] Create EpisodesController in backend/src/episodes/episodes.controller.ts
- [x] T021 [US1] Implement subscription endpoint in PodcastsService
- [x] T022 [US1] Add subscription management to User model
- [x] T023 [US1] Add structured logging for podcast discovery events

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Claim Your Podcast Flow (Priority: P2)

**Goal**: Users can search for their externally synced podcast, request ownership, and verify via email to upgrade to CREATOR

**Independent Test**: Can be tested by searching for a podcast, requesting ownership, and verifying via email link

### Tests for User Story 2 (TDD - Write First, Must Fail) ⚠️

- [x] T031 [P] [US2] Unit test for ClaimService.createRequest() in backend/tests/unit/claim.service.spec.ts
- [x] T032 [P] [US2] Unit test for ClaimService.verify() in backend/tests/unit/claim.service.spec.ts
- [x] T033 [US2] Integration test for claim flow in backend/tests/integration/claim.spec.ts

### Implementation for User Story 2

- [x] T034 [P] [US2] Create ClaimService in backend/src/claims/claims.service.ts
- [x] T035 [US2] Implement ClaimsController in backend/src/claims/claims.controller.ts
- [x] T036 [US2] Implement email verification with token generation in ClaimsService
- [x] T037 [US2] Implement GET /podcasts/search endpoint in PodcastsController
- [x] T038 [US2] Implement POST /podcasts/claim endpoint in ClaimsController
- [x] T039 [US2] Implement GET /claims/verify/:token endpoint
- [x] T040 [US2] Extend AuthService with role upgrade logic
- [x] T041 [US2] Add logging for claim request and verification events

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Creator Dashboard Access (Priority: P2)

**Goal**: Creators can access dashboard to manage owned podcasts and upload episodes with resource-based authorization

**Independent Test**: Can be tested by logging in as CREATOR and accessing Creator Dashboard without errors

### Tests for User Story 3 (TDD - Write First, Must Fail) ⚠️

- [x] T042 [P] [US3] Unit test for PodcastService.getCreatorPodcasts() in backend/tests/unit/podcast.service.spec.ts
- [x] T043 [P] [US3] Unit test for resource-based authorization guard in backend/tests/unit/ownership.guard.spec.ts
- [x] T044 [US3] Integration test for creator dashboard access in backend/tests/integration/creator.spec.ts

### Implementation for User Story 3

- [x] T045 [US3] Implement OwnershipGuard in backend/src/common/guards/ownership.guard.ts
- [x] T046 [US3] Add GET /podcasts/creator endpoint in PodcastsController
- [x] T047 [US3] Add @Roles('CREATOR') guard to creator-specific endpoints
- [x] T048 [US3] Add ownership verification before allowing episode uploads

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work independently

---

## Phase 6: User Story 4 - External Podcast Auto-Sync (Priority: P2)

**Goal**: Subscribed podcasts automatically update with new episodes, with toggle and deduplication

**Independent Test**: Can be tested by subscribing to an external podcast and verifying new episodes appear after sync

### Tests for User Story 4 (TDD - Write First, Must Fail) ⚠️

- [x] T049 [P] [US4] Unit test for SyncService.syncPodcast() in backend/tests/unit/sync.service.spec.ts
- [x] T050 [P] [US4] Unit test for deduplication logic in backend/tests/unit/deduplication.service.spec.ts
- [x] T051 [US4] Integration test for sync job in backend/tests/integration/sync.spec.ts

### Implementation for User Story 4

- [x] T052 [P] [US4] Implement RSS parser service in backend/src/sync/services/rss-parser.service.ts
- [x] T053 [US4] Implement SyncService with Cron job in backend/src/sync/services/sync.service.ts
- [x] T054 [US4] Configure Cron job to run every 6 hours in backend/src/sync/sync.module.ts
- [x] T055 [US4] Implement deduplication service in backend/src/sync/services/deduplication.service.ts
- [x] T056 [US4] Add PATCH /podcasts/:id/sync endpoint in PodcastsController
- [x] T057 [US4] Add data fencing to skip internal podcasts during external sync
- [x] T058 [US4] Add logging for sync job execution and results

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: User Story 5 - Internal Podcast Hosting (Priority: P3)

**Goal**: Creators can create internal podcasts and upload exclusive episodes stored on platform

**Independent Test**: Can be tested by creating an internal podcast and uploading an episode

### Tests for User Story 5 (TDD - Write First, Must Fail) ⚠️

- [x] T059 [P] [US5] Unit test for PodcastsController.createInternal() in backend/tests/unit/podcast.controller.spec.ts
- [x] T060 [P] [US5] Unit test for EpisodeService.uploadInternal() in backend/tests/unit/episode.service.spec.ts
- [x] T061 [US5] Integration test for internal podcast creation in backend/tests/integration/internal.spec.ts

### Implementation for User Story 5

- [x] T062 [P] [US5] Implement file upload service in backend/src/common/services/file-upload.service.ts
- [x] T063 [US5] Configure local storage for audio files in backend/src/config/storage.config.ts
- [x] T064 [US5] Add POST /podcasts (internal) endpoint in PodcastsController
- [x] T065 [US5] Add POST /episodes/upload endpoint in EpisodesController
- [x] T066 [US5] Add 100MB file size validation for audio uploads
- [x] T067 [US5] Add logging for internal podcast and episode creation

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T068 [P] Update API documentation in specs/011-podcast-hybrid-platform/contracts/
- [ ] T069 Run full test suite and fix any failing tests
- [ ] T070 Run lint and fix any code quality issues
- [ ] T071 Security audit - verify all endpoints have proper authorization
- [ ] T072 Performance optimization - add database indexes
- [ ] T073 Validate against quickstart.md setup guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Requires US1 podcast subscription
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Requires US3 creator access

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for User.create() in backend/tests/unit/user.service.spec.ts"
Task: "Unit test for AuthService.register() in backend/tests/unit/auth.service.spec.ts"
Task: "Contract test for POST /auth/register in backend/tests/contract/auth.spec.ts"

# Launch all models for User Story 1 together:
Task: "Create User schema in backend/src/schemas/user.schema.ts"
Task: "Create Podcast schema in backend/src/schemas/podcast.schema.ts"
Task: "Create Episode schema in backend/src/schemas/episode.schema.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 73 |
| Setup (Phase 1) | 5 |
| Foundational (Phase 2) | 7 |
| User Story 1 (P1) | 18 |
| User Story 2 (P2) | 11 |
| User Story 3 (P2) | 6 |
| User Story 4 (P2) | 10 |
| User Story 5 (P3) | 9 |
| Polish | 7 |

**Suggested MVP Scope**: User Story 1 (Phase 3) - Basic listener signup and podcast discovery

**Independent Test Criteria per Story**:
- US1: Register account → Login → Browse Discover → Subscribe to podcast
- US2: Search podcast → Request claim → Verify email → Role upgrades to CREATOR
- US3: Login as CREATOR → Access dashboard → Upload episode → Verify ownership
- US4: Subscribe to podcast → Wait for sync → Verify new episodes appear
- US5: Create internal podcast → Upload audio episode → Verify storage path set