# Tasks: Fix Podcast Cover Image, Google Auth, and Admin Display Issues

**Feature**: Fix Podcast Cover Image, Google Auth, and Admin Display Issues  
**Branch**: 007-fix-podcast-issues  
**Generated**: 2026-04-01

## Phase 1: Foundational (Verify Existing Codebase)

- [ ] T001 [P] Verify podcast card component exists in frontend at frontend/src/components/

- [ ] T002 [P] Verify Explore page exists at frontend/src/pages/explore.tsx or frontend/src/app/explore/page.tsx

- [ ] T003 [P] Verify Library page exists at frontend/src/pages/library.tsx or frontend/src/app/library/page.tsx

- [ ] T004 [P] Verify auth service exists in backend at backend/src/auth/

- [ ] T005 [P] Verify suggestions service exists in backend at backend/src/suggestions/

## Phase 2: User Story 1 - Podcast Cover Images (P1)

**Goal**: Fix podcast cover images not displaying in cards  
**Independent Test**: View podcast cards and verify cover images load correctly

- [ ] T006 [US1] Inspect podcast card component to identify cover image rendering issue in frontend/src/components/

- [ ] T007 [US1] Fix cover image binding in podcast card component at frontend/src/components/

- [ ] T008 [US1] Verify cover image displays correctly with proper URL and alt text

- [ ] T009 [US1] Test cover image loads within 3 seconds on standard connection

## Phase 3: User Story 4 - Admin Filtering (P1)

**Goal**: Exclude admin accounts from "Who to Follow" section  
**Independent Test**: Check Who to Follow section and verify no admin accounts appear

- [ ] T010 [P] [US4] Inspect suggestions service query in backend/src/suggestions/suggestions.service.ts

- [ ] T011 [US4] Add role filter to exclude admin users from suggestions query

- [ ] T012 [US4] Test that admin accounts do not appear in Who to Follow recommendations

- [ ] T013 [US4] Verify followed admin accounts are not re-recommended

## Phase 4: User Story 2 - Explore/Library Layout (P2)

**Goal**: Improve Explore page and Library layout and display  
**Independent Test**: Navigate to Explore and Library pages and verify proper display

- [ ] T014 [P] [US2] Inspect Explore page layout and styling at frontend/src/pages/explore.tsx

- [ ] T015 [P] [US2] Inspect Library page layout and styling at frontend/src/pages/library.tsx

- [ ] T016 [US2] Fix Explore page layout, spacing, and content organization

- [ ] T017 [US2] Fix Library page layout displaying subscribed podcasts with proper spacing

- [ ] T018 [US2] Verify responsive display on mobile devices

- [ ] T019 [US2] Handle empty content state for Explore and Library pages

## Phase 5: User Story 3 - Google Auth Integration (P2)

**Goal**: Fix Google Auth integration issues  
**Independent Test**: Complete Google Sign-In and verify successful authentication

- [ ] T020 [P] [US3] Inspect Google OAuth flow in backend/src/auth/ to identify issues

- [ ] T021 [US3] Fix OAuth callback handling in auth service

- [ ] T022 [US3] Fix token exchange and user creation/update flow

- [ ] T023 [US3] Add error handling with clear messages for auth failures

- [ ] T024 [US3] Test Google Sign-In flow completes successfully

- [ ] T025 [US3] Verify returning users are recognized without re-authentication

- [ ] T026 [US3] Test error display and retry option when Google Auth fails

## Phase 6: Polish & Cross-Cutting

- [ ] T027 [P] Run lint and typecheck for frontend

- [ ] T028 [P] Run lint and typecheck for backend

- [ ] T029 Run backend tests to verify no regressions

- [ ] T030 [P] Verify all success criteria are met:
  - Podcast cover images display correctly (SC-001)
  - Explore/Library pages display properly (SC-002)
  - Google Auth login succeeds 95% of attempts (SC-003)
  - Zero admin accounts in Who to Follow (SC-004)
  - 90% task completion on first attempt (SC-005)

## Dependencies

```
Phase 1 (Foundational)
  │
  ├── Phase 2 (US1 - Cover Images) ──────┐
  ├── Phase 3 (US4 - Admin Filtering) ───┤
  ├── Phase 4 (US2 - Explore/Library) ───┤
  └── Phase 5 (US3 - Google Auth) ───────┘
                                              │
                                              ▼
                                        Phase 6 (Polish)
```

## Parallel Execution Opportunities

- **Phase 2 & Phase 3**: US1 (frontend) and US4 (backend) can run in parallel - different files
- **Phase 4 & Phase 5**: US2 (frontend) and US3 (backend) can run in parallel - different files
- **T001-T005**: All verification tasks can run in parallel
- **T027-T028**: Lint tasks can run in parallel

## Implementation Strategy

**MVP Scope**: User Story 1 (Cover Images) + User Story 4 (Admin Filtering) - both P1 priority

These two P1 stories deliver immediate user value and can be tested independently:
- Cover images fix - users can visually identify podcasts
- Admin filtering - follows only relevant users

**Incremental Delivery**:
1. First deliver US1 + US4 (MVP)
2. Then deliver US2 (Explore/Library)
3. Then deliver US3 (Google Auth)
4. Final polish phase

## Notes

- Bug fixes use existing codebase - no new components needed
- Tests follow constitution TDD requirement - write tests before implementation
- Each user story is independently testable
