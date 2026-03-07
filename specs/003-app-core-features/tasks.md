# Tasks: App Core Features

**Input**: Design documents from `/specs/003-app-core-features/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story (6 stories) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and directories needed across multiple user stories

- [X] T001 Create Terms & Conditions constants file with static legal text in `rawy/constants/terms.ts`
- [X] T002 [P] Create views frontend service with `recordView(episodeId)` function in `rawy/services/views.service.ts`
- [X] T003 [P] Create views React Query mutation hook (`useRecordView`) in `rawy/hooks/queries/use-views.ts`
- [X] T004 [P] Create `ChangePasswordDto` with validation (currentPassword: required, newPassword: required min 8 chars) in `backend/src/auth/dto/change-password.dto.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend schema and API changes that MUST be complete before frontend user stories

**⚠️ CRITICAL**: No frontend user story work should begin until these backend tasks are complete

- [X] T005 Add `category` optional field (enum: Technology, Business, Comedy, Education, Health, Science, Culture, Sports) to Podcast schema, add text index on `{title: 'text', description: 'text'}` and index on `{category: 1}` in `backend/src/podcasts/schemas/podcast.schema.ts`
- [X] T006 Add `search` and `category` query parameters to `PodcastsController.findAll()`, add `@ApiQuery` decorators for both in `backend/src/podcasts/podcasts.controller.ts`
- [X] T007 Implement text search (`$text: {$search}`) and category filter logic in `PodcastsService.findAll()` — when `search` is provided use `$text` filter, when `category` is provided add to filter object in `backend/src/podcasts/podcasts.service.ts`
- [X] T008 Add `changePassword(userId, currentPassword, newPassword)` method to `AuthService` — find user by ID with `+passwordHash`, verify current password with bcrypt.compare, hash new password with bcrypt.hash, update user in `backend/src/auth/auth.service.ts`
- [X] T009 Add `PATCH change-password` endpoint to `AuthController` using `@Body() dto: ChangePasswordDto` and `@CurrentUser()`, return `{message: "Password changed successfully"}` in `backend/src/auth/auth.controller.ts`
- [X] T010 Add `deleteAccount(userId, password)` method to `UsersService` — verify password, cascade delete: find all user's podcasts → call `PodcastsService.delete()` for each → delete creator profile via `CreatorsService` → delete all follows (both directions) → delete user record in `backend/src/users/users.service.ts`
- [X] T011 Add `DELETE me` endpoint to `UsersController` with `@Body() {password}` and `@CurrentUser()`, call `usersService.deleteAccount()`, return `{message: "Account deleted successfully"}` in `backend/src/users/users.controller.ts`

**Checkpoint**: All backend changes complete. Frontend work can now begin.

---

## Phase 3: User Story 1 — Explore Page Enhancement (Priority: P1) 🎯 MVP

**Goal**: Rich Explore page with podcast cover images, debounced server-side search, category filtering, and popular creators with avatars.

**Independent Test**: Open Explore tab → verify podcast cards show cover images → type a keyword → verify results filter via server → tap a category chip → verify only matching podcasts display → tap a creator → navigate to their profile.

### Implementation for User Story 1

- [X] T012 [US1] Update `getPodcasts()` function to accept optional `search` and `category` parameters, pass them as query params in `rawy/services/podcasts.service.ts`
- [X] T013 [US1] Update `usePodcasts()` hook to accept `{search, category}` params, include them in the React Query key so queries refetch when params change in `rawy/hooks/queries/use-podcasts.ts`
- [X] T014 [US1] Refactor `explore.tsx` — add state variables `searchQuery` (string) and `debouncedSearch` (debounced by 500ms using `useEffect` + `setTimeout`), and `activeCategory` (string, default 'All'). Pass `debouncedSearch` and `activeCategory` to `usePodcasts()` in `rawy/app/(tabs)/explore.tsx`
- [X] T015 [US1] Update podcast card rendering in `explore.tsx` — display cover image using `resolveImageUrl(podcast.coverImageUrl)` with a `<Image>` component, show placeholder icon when no image exists. Display title, creator name, and episode count on each card in `rawy/app/(tabs)/explore.tsx`
- [X] T016 [US1] Implement category chips in `explore.tsx` — render horizontal `ScrollView` of chips for: All, Technology, Business, Comedy, Education, Health, Science, Culture, Sports. Highlight active chip. On tap, set `activeCategory` state which triggers `usePodcasts` refetch in `rawy/app/(tabs)/explore.tsx`
- [X] T017 [US1] Update Popular Creators section in `explore.tsx` — display creator avatar using `resolveImageUrl(creator.avatarUrl)` with `<Image>`, show placeholder when no avatar exists. Display name and follower count in `rawy/app/(tabs)/explore.tsx`
- [X] T018 [US1] Add empty state handling in `explore.tsx` — when `podcasts.data` is empty after search/filter, show "No podcasts found" illustration/message. When no creators exist, show appropriate fallback in `rawy/app/(tabs)/explore.tsx`
- [X] T019 [US1] Ensure pull-to-refresh works in `explore.tsx` by connecting `refetch()` from `usePodcasts` to the list's `refreshControl` prop in `rawy/app/(tabs)/explore.tsx`

**Checkpoint**: Explore page fully functional — search, category filter, images, creators. Testable independently.

---

## Phase 4: User Story 2 — Episode Views Tracking (Priority: P2)

**Goal**: Frontend integration to record views when episodes are played and display view counts on episode cards, player screen, and creator dashboard.

**Independent Test**: Log in → play an episode → verify view count increments → replay same episode → verify count stays same → check creator dashboard → verify view counts display.

### Implementation for User Story 2

- [X] T020 [US2] Integrate view recording into `PlayerContext.playEpisode()` — after setting the episode, check if user is authenticated (import auth context/token check), if yes call `recordView(episode._id)` as fire-and-forget (no await, catch silently) in `rawy/context/player-context.tsx`
- [X] T021 [US2] Display view count on episode cards — add a views label (e.g., "1.2K views") to episode card components wherever episodes are listed (explore episode list, podcast detail episodes). Format large numbers with K/M suffix in `rawy/app/(tabs)/explore.tsx` and relevant episode list components
- [X] T022 [US2] Display view count on the player screen — show the `viewsCount` from the current episode data alongside other episode metadata in `rawy/app/player.tsx`
- [X] T023 [US2] Display view count on creator dashboard episode list — ensure each episode row shows its `viewsCount` formatted appropriately in the creator dashboard episodes section

**Checkpoint**: Views system fully integrated — records on play, displays everywhere, idempotent via backend.

---

## Phase 5: User Story 3 — Library Following Section Enhancement (Priority: P3)

**Goal**: Rich list of followed creators in Library "Following" tab with avatar, name, podcast info, unfollow button, and navigation to creator profile.

**Independent Test**: Follow a creator → navigate to Library → select "Following" → verify creator shows with avatar, name, podcast → tap unfollow → confirm → verify removed → tap a creator → navigate to their profile.

### Implementation for User Story 3

- [ ] T024 [US3] Refactor the "Following" segment in `library.tsx` — replace minimal creator chip with a rich list item component showing: creator avatar (via `resolveImageUrl`), creator name, podcast name, and an unfollow icon-button on the right side in `rawy/app/(tabs)/library.tsx`
- [ ] T025 [US3] Add unfollow action with confirmation — when unfollow button is tapped, show an `Alert.alert` confirmation dialog. On confirm, call `useToggleFollow` mutation (already in `use-follows.ts`). On success, the React Query cache invalidation should automatically remove the creator from the list in `rawy/app/(tabs)/library.tsx`
- [ ] T026 [US3] Add navigation to creator profile — when a creator row (not the unfollow button) is tapped, navigate to the creator's public profile page using `router.push(\`/(profile)/\${creatorId}/public\`)` in `rawy/app/(tabs)/library.tsx`
- [ ] T027 [US3] Add empty state for Following segment — when user follows no creators, display an illustration with "You're not following anyone yet" message and a button/link to the Explore tab in `rawy/app/(tabs)/library.tsx`
- [ ] T028 [US3] Add sign-in prompt for unauthenticated users — when user is not logged in and selects Following, show a prompt to sign in with a button navigating to the login screen in `rawy/app/(tabs)/library.tsx`

**Checkpoint**: Library Following section fully functional — rich creator cards, unfollow, navigation, empty states.

---

## Phase 6: User Story 4 — Auth Flow Modification (Priority: P4)

**Goal**: Onboarding navigates to login (not register), password visibility toggle on login/register, T&C link on auth screens.

**Independent Test**: Clear app data → launch app → complete onboarding → verify lands on login (not register) → on login screen verify password eye toggle works → verify T&C link is visible and navigates to terms page → verify same on register screen.

### Implementation for User Story 4

- [ ] T029 [P] [US4] Modify onboarding final navigation — change the "Get Started" button's `router.replace()` target from `/(auth)/register` to `/(auth)/login` in `rawy/app/(auth)/onboarding.tsx`
- [ ] T030 [P] [US4] Add password visibility toggle to login screen — add state `showPassword` (boolean), toggle eye/eye-off icon from `lucide-react-native`, set `secureTextEntry={!showPassword}` on the password `TextInput` in `rawy/app/(auth)/login.tsx`
- [ ] T031 [P] [US4] Add password visibility toggle to register screen — same implementation as T030, apply to the password field in `rawy/app/(auth)/register.tsx`
- [ ] T032 [US4] Add "Terms & Conditions" link to login screen — add a `TouchableOpacity` or `Pressable` below the form with text "By continuing, you agree to our Terms & Conditions", navigating to `/(legal)/terms` on tap in `rawy/app/(auth)/login.tsx`
- [ ] T033 [US4] Add "Terms & Conditions" link to register screen — same T&C link as T032 in `rawy/app/(auth)/register.tsx`

**Checkpoint**: Auth flow streamlined — onboarding→login, password toggles, T&C links. Testable independently.

---

## Phase 7: User Story 5 — Settings Page Enhancement (Priority: P5)

**Goal**: Fully functional settings page with push notification toggle, change password, delete account (with cascade + password re-entry), and navigation to legal/support pages.

**Independent Test**: Navigate to Profile → Settings → verify all options visible → toggle push notifications → restart app → verify persisted → tap Change Password → verify form → tap Delete Account → verify confirmation with password → tap T&C → verify navigation → verify app version displayed.

### Implementation for User Story 5

- [ ] T034 [US5] Create frontend auth service function `changePassword(currentPassword, newPassword)` that calls `PATCH /auth/change-password` in `rawy/services/auth.service.ts`
- [ ] T035 [US5] Create frontend users service function `deleteAccount(password)` that calls `DELETE /users/me` with `{password}` in body in `rawy/services/users.service.ts`
- [ ] T036 [US5] Create Change Password screen with form: current password field, new password field, confirm new password field, all with visibility toggles. Client-side validation (newPassword === confirmPassword, min 8 chars). On submit call `changePassword()`, show success toast or error in `rawy/app/(profile)/change-password.tsx`
- [ ] T037 [US5] Refactor Settings screen — redesign with sections: (1) Notifications section with functional push notification `Switch` toggle reading/writing `@rawy:push_notifications_enabled` from AsyncStorage, (2) Account section with "Change Password" row → navigates to change-password screen, "Delete Account" row → triggers delete flow in `rawy/app/(profile)/settings.tsx`
- [ ] T038 [US5] Implement Delete Account flow in Settings — on tap show `Alert.alert` with warning message (for creators: "All your podcasts, episodes, and data will be permanently deleted"), include a password `TextInput` in the alert (or navigate to a confirmation screen), on confirm call `deleteAccount(password)`, on success clear tokens and navigate to login in `rawy/app/(profile)/settings.tsx`
- [ ] T039 [US5] Add navigation rows to Settings — "Terms & Conditions" → `/(legal)/terms`, "Privacy Policy" → `/(legal)/privacy` (placeholder), "Help & Support" → `Linking.openURL('mailto:support@rawy.app')` or in-app help page in `rawy/app/(profile)/settings.tsx`
- [ ] T040 [US5] Display app version number in Settings — read version from `expo-constants` or `app.json` and display at the bottom of the settings list in `rawy/app/(profile)/settings.tsx`

**Checkpoint**: Settings fully functional — notifications persist, password change works, account deletion cascades, legal links work.

---

## Phase 8: User Story 6 — Terms & Conditions Page (Priority: P6)

**Goal**: Dedicated, scrollable Terms & Conditions page accessible from auth screens and Settings.

**Independent Test**: Tap T&C link from login → verify page shows full legal text in scrollable view → tap back → returns to previous screen → navigate via Settings → verify same page.

### Implementation for User Story 6

- [ ] T041 [US6] Create `(legal)` route group layout file (if needed by expo-router) with a back button header in `rawy/app/(legal)/_layout.tsx`
- [ ] T042 [US6] Create Terms & Conditions screen — import terms text from `rawy/constants/terms.ts`, render in a `ScrollView` with proper heading styles (`<Text>` with heading sizes), readable paragraph formatting, and adequate padding in `rawy/app/(legal)/terms.tsx`

**Checkpoint**: T&C page accessible from all entry points — auth screens and settings.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [ ] T043 Verify all image loading across the app uses `resolveImageUrl()` correctly — audit explore.tsx, library.tsx, and player.tsx for consistent image handling with proper fallback placeholders
- [ ] T044 [P] Add loading states and skeleton screens — ensure explore.tsx shows skeleton cards while loading, library.tsx shows skeleton items while loading followed creators
- [ ] T045 [P] Handle error states across all modified screens — ensure network errors show appropriate retry messages on explore, library, settings, and change-password screens
- [ ] T046 Verify all navigation flows end-to-end: onboarding→login→register (and back), settings→change-password (and back), settings→terms (and back), auth→terms (and back), library→creator profile, explore→podcast detail
- [ ] T047 Run quickstart.md validation — follow the setup guide in `specs/003-app-core-features/quickstart.md` to verify all features work from a fresh setup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T004 from Setup (ChangePasswordDto) — BLOCKS all frontend stories
- **User Stories (Phases 3–8)**: All depend on Phase 2 completion
  - User stories can proceed in parallel (if staffed) or sequentially in priority order
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Explore)**: Depends on T005-T007 (backend search/category). No dependency on other stories.
- **US2 (Views)**: Depends on T001-T003 (setup: views service/hook). No dependency on other stories.
- **US3 (Library Following)**: No backend dependencies (follows already exist). No dependency on other stories.
- **US4 (Auth Flow)**: Depends on US6 T&C page (T042) for the T&C link to work. Can implement T029-T031 in parallel immediately.
- **US5 (Settings)**: Depends on T008-T011 (backend change-password/delete). Depends on US6 (T042) for T&C navigation.
- **US6 (Terms & Conditions)**: Depends on T001 (constants). Should be completed before US4 and US5 for T&C links.

### Recommended Execution Order

```
Phase 1 (Setup) → Phase 2 (Foundational Backend)
                          ↓
    ┌─────────────────────┼──────────────────────┐
    ↓                     ↓                      ↓
  US6 (T&C)         US1 (Explore)          US2 (Views)
    ↓                     ↓                      ↓
  US4 (Auth)         US3 (Library)         (independent)
    ↓
  US5 (Settings)
    ↓
  Phase 9 (Polish)
```

### Within Each User Story

- Backend tasks before frontend tasks
- Services/hooks before screen implementations
- Core functionality before edge cases and empty states
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001, T002, T003, T004 — all create new files, no conflicts
- **Phase 2**: T005→T007 (sequential, same files), T008→T009 (sequential, same files), T010→T011 (sequential, same files) — the three groups can run in parallel with each other
- **Phase 3 (US1)**: T012 and T013 parallel (different files), then T014-T019 sequential (same file)
- **Phase 6 (US4)**: T029, T030, T031 all parallel (different files)
- **Phase 9**: T043, T044, T045 parallel (different concerns)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational Backend (T005-T011)
3. Complete Phase 3: User Story 1 — Explore Page (T012-T019)
4. **STOP and VALIDATE**: Test Explore page independently
5. Deploy/demo if ready — the app now has a rich discovery experience

### Incremental Delivery

1. Setup + Foundational → Backend ready
2. Add US6 (T&C) + US1 (Explore) → Content discovery + legal compliance
3. Add US2 (Views) → Engagement metrics visible
4. Add US4 (Auth) → Streamlined onboarding
5. Add US3 (Library) → Social features enhanced
6. Add US5 (Settings) → Full account management
7. Polish → Production-ready

### Parallel Team Strategy

With 3 developers after Phase 2 completes:

- **Developer A**: US6 (quick) → US4 (Auth) → US5 (Settings)
- **Developer B**: US1 (Explore) → US3 (Library)
- **Developer C**: US2 (Views) → Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US6 (T&C) should be done early since US4 and US5 link to it
