# Tasks: Admin Dashboard

**Feature**: Admin Dashboard  
**Branch**: 005-d-projects-rawyapp  
**Generated**: March 30, 2026

## Task Summary

- **Total Tasks**: 87
- **User Stories**: 9
- **Parallel Opportunities**: 15+

## Phase 1: Setup (Project Initialization)

- [X] T001 Initialize Next.js 14 project with TypeScript and Tailwind CSS in admin-dashboard/
- [X] T002 Install dependencies: @tanstack/react-query, axios, lucide-react, recharts, clsx, tailwind-merge
- [X] T003 Configure Next.js with App Router structure per plan.md
- [X] T004 Set up environment variables (.env.local with NEXT_PUBLIC_API_URL)
- [X] T005 Verify project builds without errors

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T006 [P] Create API client wrapper in admin-dashboard/lib/api.ts using axios
- [X] T007 [P] Set up TanStack Query provider in admin-dashboard/app/providers.tsx
- [X] T008 Create authentication context and hooks in admin-dashboard/contexts/AuthContext.tsx
- [X] T009 Implement JWT token storage and retrieval
- [X] T010 [P] Create UI component primitives in admin-dashboard/components/ui/ (Button, Input, Card, Table, Badge, Modal)
- [X] T011 Create layout components: Sidebar in admin-dashboard/components/layout/Sidebar.tsx
- [X] T012 Create layout components: Header in admin-dashboard/components/layout/Header.tsx
- [X] T013 Create main layout wrapper in admin-dashboard/app/(dashboard)/layout.tsx
- [X] T014 Implement auth middleware to protect dashboard routes (ADMIN role check)
- [X] T015 Create login page in admin-dashboard/app/(auth)/login/page.tsx

## Phase 3: User Story 1 - Dashboard Overview (Priority: P1)

**Story Goal**: Admin sees summary of platform statistics  
**Independent Test**: Load dashboard page, verify stat cards display correct numbers

### Tests (TDD)
- [X] T016 [US1] Write Jest test for dashboard stats fetching in backend/tests/admin/dashboard.spec.ts
- [X] T017 [US1] Write Jest test for stats component rendering in admin-dashboard/tests/DashboardStats.test.tsx

### Backend
- [X] T018 [US1] Extend admin.controller.ts with GET /admin/stats endpoint in backend/src/admin/
- [X] T019 [US1] Implement getStats method in admin.service.ts returning counts for users, creators, podcasts, episodes

### Frontend
- [X] T020 [US1] [P] Create DashboardStats component in admin-dashboard/components/features/dashboard/StatsCards.tsx
- [X] T021 [P] Create RecentActivity component in admin-dashboard/components/features/dashboard/RecentActivity.tsx
- [X] T022 [P] Create QuickActions component in admin-dashboard/components/features/dashboard/QuickActions.tsx
- [X] T023 [US1] Create dashboard overview page in admin-dashboard/app/(dashboard)/page.tsx

## Phase 4: User Story 2 - User Management (Priority: P1)

**Story Goal**: Admin can view and manage user accounts  
**Independent Test**: Create test users, perform all management operations

### Tests
- [X] T024 [US2] Write Jest tests for user CRUD operations in backend/tests/admin/users.spec.ts
- [X] T025 [US2] Write integration tests for user list API endpoint

### Backend
- [X] T026 [US2] Extend admin.controller.ts with GET /admin/users endpoint (pagination, search, filter)
- [X] T027 [US2] Add GET /admin/users/:userId endpoint
- [X] T028 [US2] Add PATCH /admin/users/:userId for updates
- [X] T029 [US2] Add PATCH /admin/users/:userId/activate endpoint
- [X] T030 [US2] Add PATCH /admin/users/:userId/deactivate endpoint
- [X] T031 [US2] Add PATCH /admin/users/:userId/promote endpoint
- [X] T032 [US2] Add DELETE /admin/users/:userId with cascade

### Frontend
- [X] T033 [US2] [P] Create useUsers hook in admin-dashboard/hooks/useUsers.ts
- [X] T034 [P] Create UserTable component in admin-dashboard/components/features/users/UserTable.tsx
- [X] T035 [P] Create UserFilters component in admin-dashboard/components/features/users/UserFilters.tsx
- [X] T036 [P] Create UserModal for edit/create in admin-dashboard/components/features/users/UserModal.tsx
- [X] T037 [US2] Create users page in admin-dashboard/app/(dashboard)/users/page.tsx
- [X] T038 [US2] Create user detail page in admin-dashboard/app/(dashboard)/users/[userId]/page.tsx

## Phase 5: User Story 3 - Creator Management (Priority: P1)

**Story Goal**: Admin can manage creator accounts  
**Independent Test**: Access creators page, perform management operations

### Tests
- [X] T039 [US3] Write Jest tests for creator operations in backend/tests/admin/creators.spec.ts

### Backend
- [X] T040 [US3] Add GET /admin/creators endpoint (pagination)
- [X] T041 [US3] Add GET /admin/creators/:creatorId endpoint
- [X] T042 [US3] Add PATCH /admin/creators/:creatorId endpoint
- [X] T043 [US3] Add DELETE /admin/creators/:creatorId (remove creator status)

### Frontend
- [X] T044 [US3] [P] Create useCreators hook in admin-dashboard/hooks/useCreators.ts
- [X] T045 [P] Create CreatorTable component in admin-dashboard/components/features/creators/CreatorTable.tsx
- [X] T046 [US3] Create creators page in admin-dashboard/app/(dashboard)/creators/page.tsx
- [X] T047 [US3] Create creator detail page in admin-dashboard/app/(dashboard)/creators/[creatorId]/page.tsx

## Phase 6: User Story 4 - Podcast Management (Priority: P2)

**Story Goal**: Admin can manage podcasts  
**Independent Test**: Access podcasts page, perform all operations

### Tests
- [X] T048 [US4] Write Jest tests for podcast operations in backend/tests/admin/podcasts.spec.ts

### Backend
- [X] T049 [US4] Add GET /admin/podcasts endpoint (pagination, search, category filter)
- [X] T050 [US4] Add GET /admin/podcasts/:podcastId endpoint
- [X] T051 [US4] Add PATCH /admin/podcasts/:podcastId endpoint
- [X] T052 [US4] Add DELETE /admin/podcasts/:podcastId with cascade episodes

### Frontend
- [X] T053 [US4] [P] Create usePodcasts hook in admin-dashboard/hooks/usePodcasts.ts
- [X] T054 [P] Create PodcastTable component in admin-dashboard/components/features/podcasts/PodcastTable.tsx
- [X] T055 [P] Create PodcastFilters component in admin-dashboard/components/features/podcasts/PodcastFilters.tsx
- [X] T056 [P] Create PodcastModal for edit in admin-dashboard/components/features/podcasts/PodcastModal.tsx
- [X] T057 [US4] Create podcasts page in admin-dashboard/app/(dashboard)/podcasts/page.tsx

## Phase 7: User Story 5 - Episode Management (Priority: P2)

**Story Goal**: Admin can manage episodes  
**Independent Test**: Access episodes page, perform operations

### Tests
- [X] T058 [US5] Write Jest tests for episode operations in backend/tests/admin/episodes.spec.ts

### Backend
- [X] T059 [US5] Add GET /admin/episodes endpoint (pagination, podcast/creator filter)
- [X] T060 [US5] Add GET /admin/episodes/:episodeId endpoint
- [X] T061 [US5] Add PATCH /admin/episodes/:episodeId endpoint
- [X] T062 [US5] Add DELETE /admin/episodes/:episodeId endpoint

### Frontend
- [X] T063 [US5] [P] Create useEpisodes hook in admin-dashboard/hooks/useEpisodes.ts
- [X] T064 [P] Create EpisodeTable component in admin-dashboard/components/features/episodes/EpisodeTable.tsx
- [X] T065 [US5] Create episodes page in admin-dashboard/app/(dashboard)/episodes/page.tsx

## Phase 8: User Story 6 - Comment Moderation (Priority: P2)

**Story Goal**: Admin can moderate comments  
**Independent Test**: Access comments page, perform delete operations

### Tests
- [X] T066 [US6] Write Jest tests for comment operations in backend/tests/admin/comments.spec.ts

### Backend
- [X] T067 [US6] Add GET /admin/comments endpoint (pagination, episode filter)
- [X] T068 [US6] Add GET /admin/comments/:commentId endpoint
- [X] T069 [US6] Add DELETE /admin/comments/:commentId endpoint

### Frontend
- [X] T070 [US6] [P] Create useComments hook in admin-dashboard/hooks/useComments.ts
- [X] T071 [P] Create CommentTable component in admin-dashboard/components/features/comments/CommentTable.tsx
- [X] T072 [US6] Create comments page in admin-dashboard/app/(dashboard)/comments/page.tsx

## Phase 9: User Story 7 - Analytics View (Priority: P2)

**Story Goal**: Admin can view platform analytics  
**Independent Test**: Access analytics page, verify data displays

### Tests
- [X] T073 [US7] Write Jest tests for analytics endpoints in backend/tests/admin/analytics.spec.ts

### Backend
- [X] T074 [US7] Add GET /admin/analytics/overview endpoint
- [X] T075 [US7] Add GET /admin/analytics/top-episodes endpoint
- [X] T076 [US7] Add GET /admin/analytics/top-creators endpoint

### Frontend
- [X] T077 [US7] [P] Create useAnalytics hook in admin-dashboard/hooks/useAnalytics.ts
- [X] T078 [P] Create AnalyticsOverview component in admin-dashboard/components/features/analytics/Overview.tsx
- [X] T079 [P] Create TopEpisodesChart component in admin-dashboard/components/features/analytics/TopEpisodes.tsx
- [X] T080 [P] Create TopCreatorsChart component in admin-dashboard/components/features/analytics/TopCreators.tsx
- [X] T081 [US7] Create analytics page with tabs in admin-dashboard/app/(dashboard)/analytics/page.tsx

## Phase 10: User Story 8 - Notification Broadcast (Priority: P3)

**Story Goal**: Admin can send broadcast notifications  
**Independent Test**: Compose and send broadcast notification

### Tests
- [X] T082 [US8] Write Jest tests for notification broadcast in backend/tests/admin/notifications.spec.ts

### Backend
- [X] T083 [US8] Add GET /admin/notifications endpoint (history)
- [X] T084 [US8] Add POST /admin/notifications/broadcast endpoint
- [X] T085 [US8] Add POST /admin/notifications/broadcast-by-role endpoint

### Frontend
- [X] T086 [US8] [P] Create useNotifications hook in admin-dashboard/hooks/useNotifications.ts
- [X] T087 [P] Create BroadcastForm component in admin-dashboard/components/features/notifications/BroadcastForm.tsx
- [X] T088 [P] Create NotificationHistory component in admin-dashboard/components/features/notifications/History.tsx
- [X] T089 [US8] Create notifications page in admin-dashboard/app/(dashboard)/notifications/page.tsx

## Phase 11: User Story 9 - System Health (Priority: P3)

**Story Goal**: Admin can view system health  
**Independent Test**: Access system page, verify health data

### Backend
- [X] T090 [US9] Add GET /admin/system/health endpoint
- [X] T091 [US9] Add GET /admin/system/config endpoint

### Frontend
- [X] T092 [US9] [P] Create useSystemHealth hook in admin-dashboard/hooks/useSystemHealth.ts
- [X] T093 [P] Create SystemHealthCard component in admin-dashboard/components/features/system/HealthCard.tsx
- [X] T094 [P] Create SystemConfigCard component in admin-dashboard/components/features/system/ConfigCard.tsx
- [X] T095 [US9] Create system page in admin-dashboard/app/(dashboard)/system/page.tsx

## Phase 12: Cross-Cutting & Polish

- [X] T096 Add audit logging implementation in backend (log all admin actions per FR-040)
- [X] T097 Add bulk operations support (FR-035, FR-036) in list pages
- [X] T098 Implement confirmation dialogs for delete operations (FR-038)
- [X] T099 Add undo capability for accidental actions (FR-039) - implement 5-min undo cache
- [X] T100 Add skeleton loaders for loading states (FR-032)
- [X] T101 Add contextual empty state messages (FR-033)
- [X] T102 Add error toast notifications with retry (FR-034)
- [X] T103 Perform end-to-end testing across all user stories
- [X] T104 Verify all Success Criteria are met (SC-001 through SC-008)

## Implementation Strategy

### MVP Scope (Phase 3-5)
User Stories 1-3 (Dashboard Overview, User Management, Creator Management) constitute the MVP. These should be implemented first as they provide the core admin functionality.

### Incremental Delivery
- Sprint 1: Setup + Phase 2 Foundational + US1
- Sprint 2: US2 + US3
- Sprint 3: US4 + US5
- Sprint 4: US6 + US7
- Sprint 5: US8 + US9
- Sprint 6: Polish & cross-cutting

### Parallel Execution
The following can be executed in parallel:
- T006, T007 (API client + Query provider)
- T010, T011, T012 (UI primitives + layout)
- T020, T021, T022 (Dashboard components)
- T033, T044, T053, T063, T070 (Hooks for each domain)
- T034-036 (User components)
- T045-046 (Creator components)
- T054-056 (Podcast components)
- T077-080 (Analytics components)
- T086-088 (Notification components)
- T092-094 (System components)

### Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundational)
            ├── Phase 3 (US1 - Dashboard)
            ├── Phase 4 (US2 - Users)
            ├── Phase 5 (US3 - Creators)
            ├── Phase 6 (US4 - Podcasts)
            ├── Phase 7 (US5 - Episodes)
            ├── Phase 8 (US6 - Comments)
            ├── Phase 9 (US7 - Analytics)
            ├── Phase 10 (US8 - Notifications)
            └── Phase 11 (US9 - System)
                    └── Phase 12 (Polish)
```

## Notes

- All backend tasks include corresponding Jest tests (TDD per Constitution)
- Frontend components use React Query for server state management
- API contracts documented in contracts/admin-api.md
- Entity definitions in data-model.md