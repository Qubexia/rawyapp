# Tasks: App Engagement Features

**Input**: Design documents from `/specs/004-app-engagement-features/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` (NestJS)
- **Frontend**: `rawy/` (Expo/React Native with Expo Router)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and create shared module scaffolds

- [x] T001 Install `expo-notifications` and `expo-location` in `rawy/` via `npx expo install expo-notifications expo-location`
- [x] T002 [P] Create `backend/src/comment-likes/` module scaffold: `comment-likes.module.ts`, `comment-likes.controller.ts`, `comment-likes.service.ts`
- [x] T003 [P] Create `backend/src/feed/` module scaffold: `feed.module.ts`, `feed.controller.ts`, `feed.service.ts`
- [x] T004 [P] Create `backend/src/suggestions/` module scaffold: `suggestions.module.ts`, `suggestions.controller.ts`, `suggestions.service.ts`
- [x] T005 Register new modules (`CommentLikesModule`, `FeedModule`, `SuggestionsModule`) in `backend/src/app.module.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema modifications and shared entities needed by multiple user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Extend `Comment` schema — add optional `parentCommentId` (`ObjectId`, ref: Comment) and `likesCount` (`Number`, default: 0) fields, add index `{ parentCommentId: 1, createdAt: 1 }` in `backend/src/comments/schemas/comment.schema.ts`
- [x] T007 [P] Create `CommentLike` schema — `userId` (`ObjectId`, ref: User), `commentId` (`ObjectId`, ref: Comment), compound unique index `{ userId: 1, commentId: 1 }`, single-field index `{ commentId: 1 }` in `backend/src/comment-likes/schemas/comment-like.schema.ts`
- [x] T008 [P] Create `Notification` schema — `recipientId`, `type` (enum: new_episode, comment_reply, comment_like, new_follower), `lastActorId`, `actorCount` (default: 1), `targetId`, `targetModel` (enum: Episode, Comment, User), `episodeId` (optional), `previewText` (optional, max 100), `isRead` (default: false); TTL index `{ createdAt: 1, expireAfterSeconds: 7776000 }`, compound index `{ recipientId: 1, isRead: 1, updatedAt: -1 }`, unique compound `{ recipientId: 1, type: 1, targetId: 1 }` in `backend/src/notifications/schemas/notification.schema.ts`
- [x] T009 [P] Extend `User` schema — add `pushEnabled` (`Boolean`, default: true), `location` (embedded: `city` string, `coordinates` [Number] with `2dsphere` index sparse) in `backend/src/users/schemas/user.schema.ts`
- [x] T010 Register `Notification` schema in `MongooseModule.forFeature()` within `backend/src/notifications/notifications.module.ts`

**Checkpoint**: All schemas updated — user story implementation can now begin

---

## Phase 3: User Story 3 — Comment System Improvements (Priority: P3) 🎯 MVP

**Goal**: Enable comment likes and threaded replies on episode comments

**Independent Test**: Navigate to an episode, post a comment, like another comment (verify count increments), reply to a comment (verify nested display), unlike (verify count decrements)

### Implementation for User Story 3

- [x] T011 [P] [US3] Create `CreateCommentLikeDto` and `CommentLikeStatusDto` in `backend/src/comment-likes/dto/`
- [x] T012 [US3] Implement `CommentLikesService` — `like(userId, commentId)` (create CommentLike + increment Comment.likesCount atomically), `unlike(userId, commentId)` (delete CommentLike + decrement), `getStatus(userId, commentId)` (return isLiked + likesCount) in `backend/src/comment-likes/comment-likes.service.ts`
- [x] T013 [US3] Implement `CommentLikesController` — `POST /comment-likes/comments/:commentId`, `DELETE /comment-likes/comments/:commentId`, `GET /comment-likes/comments/:commentId/status` with JWT auth in `backend/src/comment-likes/comment-likes.controller.ts`
- [x] T014 [US3] Extend `CommentsService` — modify `create()` to accept optional `parentCommentId`, enforce one-level nesting (if parent has parentCommentId, reassign to root), update Episode.commentsCount; add `getReplies(commentId, page, limit)` method; modify `delete()` to cascade-delete child replies and adjust Episode.commentsCount by (1 + replyCount) in `backend/src/comments/comments.service.ts`
- [x] T015 [US3] Extend `CommentsController` — update `POST /comments/episodes/:episodeId` to accept `parentCommentId` in body; add `GET /comments/:commentId/replies` endpoint; modify `GET /comments/episodes/:episodeId` to filter only top-level comments (`parentCommentId: null`) and include virtual `replyCount` in `backend/src/comments/comments.controller.ts`
- [x] T016 [US3] Update `CreateCommentDto` to include optional `parentCommentId` field in `backend/src/comments/dto/`
- [x] T017 [P] [US3] Create `comment-likes.service.ts` frontend service — `likeComment(commentId)`, `unlikeComment(commentId)`, `getCommentLikeStatus(commentId)` using axios in `rawy/services/comment-likes.service.ts`
- [x] T018 [P] [US3] Extend `comments.service.ts` frontend — add `createReply(episodeId, text, parentCommentId)`, `getReplies(commentId, page, limit)` methods in `rawy/services/comments.service.ts`
- [x] T019 [US3] Create `useCommentLikes` React Query hook — `useCommentLikeStatus(commentId)` query, `useLikeComment` and `useUnlikeComment` mutations with optimistic updates in `rawy/hooks/queries/use-comment-likes.ts`
- [x] T020 [US3] Extend `useComments` hook — add `useCommentReplies(commentId)` query and `useCreateReply` mutation in `rawy/hooks/queries/use-comments.ts`
- [x] T021 [US3] Create `CommentItem` component — displays comment text, author avatar + name, timestamp, like button with count (toggleable), reply button, expandable reply list with "N replies" indicator in `rawy/components/CommentItem.tsx`
- [x] T022 [US3] Integrate `CommentItem` into episode screen — replace existing flat comment list with `CommentItem` components supporting likes and threaded replies, add reply input field in `rawy/app/episode/[id].tsx`

**Checkpoint**: Comments now support likes and one-level threaded replies, fully testable independently

---

## Phase 4: User Story 4 — Following System Improvements (Priority: P4)

**Goal**: Enable following both users and creators, display follower/following counts, provide paginated follow lists

**Independent Test**: Visit a user profile, tap Follow (verify counts update), view follower/following lists, unfollow (verify counts decrement)

### Implementation for User Story 4

- [x] T023 [US4] Review and verify `FollowsService` supports user-to-user following — the existing `follow(followerId, creatorId)` method uses `creatorId` as a generic `ObjectId` ref to User; confirm it already works for non-creator users; if not, update logic to handle both in `backend/src/follows/follows.service.ts`
- [x] T024 [US4] Ensure `getFollowers` and `getFollowing` endpoints return proper user data (name, avatarUrl, followerCount) for both creators and regular users in `backend/src/follows/follows.controller.ts`
- [x] T025 [P] [US4] Update frontend `follows.service.ts` — ensure `followUser(targetId)`, `unfollowUser(targetId)`, `getFollowStatus(targetId)`, `getFollowers(targetId, page)`, `getFollowing(userId, page)` methods are available in `rawy/services/follows.service.ts`
- [x] T026 [US4] Update profile screen — display follower count and following count, tappable to open follower/following list screens; show Follow/Following button for other users (with unfollow confirmation prompt) in relevant profile screen files under `rawy/app/`
- [x] T027 [US4] Create follower/following list screen — paginated list of users with avatar, name, and follow button; accessible by tapping counts on profile in `rawy/app/followers.tsx` and `rawy/app/following.tsx` (or modal)

**Checkpoint**: Following system supports both users and creators with counts and lists

---

## Phase 5: User Story 1 — In-App Notifications System (Priority: P1)

**Goal**: Store and display in-app notifications with aggregation, unread badge, and navigation to target content

**Independent Test**: Trigger notification events (follow a creator → publish episode, reply to comment, like comment, follow user), open Notifications tab, verify notifications appear with correct content, tap to navigate, mark all as read

**Depends On**: Phase 3 (comment likes/replies generate notifications), Phase 4 (follow events generate notifications)

### Implementation for User Story 1

- [x] T028 [P] [US1] Create notification DTOs — `NotificationResponseDto`, `UnreadCountDto`, `PaginatedNotificationsDto` in `backend/src/notifications/dto/`
- [x] T029 [US1] Extend `NotificationsService` — add `createOrAggregateNotification(recipientId, type, lastActorId, targetId, targetModel, episodeId?, previewText?)` method with upsert logic (find existing by recipientId+type+targetId → if found: increment actorCount, update lastActorId, reset isRead; if not: create new); add `getNotifications(userId, page, limit)` with populate lastActorId (name, avatarUrl); add `getUnreadCount(userId)`; add `markAsRead(notificationId, userId)`; add `markAllAsRead(userId)` in `backend/src/notifications/notifications.service.ts`
- [x] T030 [US1] Create `NotificationsController` — `GET /notifications` (paginated), `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` with JWT auth in `backend/src/notifications/notifications.controller.ts`
- [x] T031 [US1] Integrate notification triggers into `CommentLikesService.like()` — after creating a comment like, call `notificationsService.createOrAggregateNotification(commentOwnerId, 'comment_like', likerId, commentId, 'Comment', episodeId)` (skip if liker === comment owner) in `backend/src/comment-likes/comment-likes.service.ts`
- [x] T032 [US1] Integrate notification triggers into `CommentsService.create()` — when creating a reply, call `notificationsService.createOrAggregateNotification(parentCommentOwnerId, 'comment_reply', replierId, parentCommentId, 'Comment', episodeId, replyText.slice(0,100))` (skip if replier === parent owner) in `backend/src/comments/comments.service.ts`
- [x] T033 [US1] Integrate notification triggers into `FollowsService.follow()` — call `notificationsService.createOrAggregateNotification(targetId, 'new_follower', followerId, followerId, 'User')` in `backend/src/follows/follows.service.ts`
- [x] T034 [US1] Integrate notification triggers into existing new-episode notification — call `createOrAggregateNotification` for each follower with type `new_episode`, targeting the episode, in `backend/src/notifications/notifications.service.ts` (modify `sendNewEpisodeNotification`)
- [x] T035 [P] [US1] Create `notifications.service.ts` frontend — `getNotifications(page, limit)`, `getUnreadCount()`, `markAsRead(notificationId)`, `markAllAsRead()` using axios in `rawy/services/notifications.service.ts`
- [x] T036 [US1] Create `useNotifications` React Query hooks — `useNotifications(page)` query (paginated), `useUnreadCount()` query (with `refetchInterval: 30000` for polling), `useMarkAsRead` mutation, `useMarkAllAsRead` mutation with optimistic updates in `rawy/hooks/queries/use-notifications.ts`
- [x] T037 [US1] Create `NotificationItem` component — renders notification type icon, actor name + count ("Ahmed and 12 others"), target description, time ago, unread highlight (bold/background), tappable with navigation logic (new_episode → episode screen, comment_reply/comment_like → episode with comments, new_follower → profile) in `rawy/components/NotificationItem.tsx`
- [x] T038 [US1] Create Notifications screen — FlatList of `NotificationItem` with pagination (onEndReached), "Mark all as read" header action, empty state ("No notifications yet"), pull-to-refresh in `rawy/app/(profile)/notifications.tsx`
- [x] T039 [US1] Add notification badges — add badge on profile tab in `rawy/app/(tabs)/_layout.tsx` and on home screen bell icon in `rawy/app/(tabs)/index.tsx` using `useUnreadCount()` data.

**Checkpoint**: In-app notifications working end-to-end with aggregation, badge, and deep navigation

---

## Phase 6: User Story 2 — Firebase Push Notifications (Priority: P2)

**Goal**: Send real push notifications via FCM for all notification events, handle foreground/background, navigate on tap

**Independent Test**: Trigger a notification event with app backgrounded, verify push appears on device, tap to navigate to correct screen; toggle push off in settings, verify no push sent

**Depends On**: Phase 5 (in-app notification infrastructure)

### Implementation for User Story 2

- [x] T040 [US2] Extend `NotificationsService` — add private `sendPush(recipientId, title, body, data)` method that: looks up user's `pushEnabled` and `deviceTokens`, constructs FCM message with `data` payload (type, targetId, episodeId), calls `getMessaging().sendEachForMulticast()`, removes failed tokens via `usersService.removeDeviceToken()` in `backend/src/notifications/notifications.service.ts`
- [x] T041 [US2] Wire push sending into `createOrAggregateNotification` — after creating/updating the in-app notification, call `sendPush()` with appropriate title/body per type (new_episode: "New episode from {creator}", comment_reply: "{actor} replied to your comment", comment_like: "{actor} liked your comment", new_follower: "{actor} started following you") in `backend/src/notifications/notifications.service.ts`
- [x] T042 [P] [US2] Add device token management endpoints — `POST /users/me/device-token` (add token to `deviceTokens[]`), `DELETE /users/me/device-token` (remove token), implement in UsersService in `backend/src/users/users.controller.ts` and `backend/src/users/users.service.ts`
- [x] T043 [P] [US2] Add push preference endpoint — `PATCH /users/me/push-preference` (update `pushEnabled` field) in `backend/src/users/users.controller.ts` and `backend/src/users/users.service.ts`
- [x] T044 [US2] Create push notification setup utility — request permissions via `expo-notifications`, get device token via `getDevicePushTokenAsync()`, register token with backend on login, remove token on logout in `rawy/utils/push-notifications.ts`
- [x] T045 [US2] Configure notification handlers in root layout — set up `Notifications.setNotificationHandler` for foreground (show as in-app banner), add response listener for tap handling (extract `data.type` and `data.targetId` → navigate with `router.push`), initialize push token registration on app start in `rawy/app/_layout.tsx`
- [x] T046 [US2] Add push notification toggle to Settings screen — switch component bound to `pushEnabled` preference, calls `PATCH /users/me/push-preference` on toggle in the appropriate settings screen under `rawy/app/`

**Checkpoint**: Push notifications sent for all events, handled in foreground/background, navigation on tap works

---

## Phase 7: User Story 5 — Podcast Sharing & Deep Linking (Priority: P5)

**Goal**: Generate shareable deep links for episodes that open the app directly or redirect to app store

**Independent Test**: Tap share on an episode, send the link to another device, tap the link — app opens to the correct episode (or redirects to store if not installed)

### Implementation for User Story 5

- [x] T047 [P] [US5] Create deep link utility — `generateEpisodeLink(episodeId)` returns `https://<domain>/episode/<episodeId>`, `parseDeepLink(url)` extracts route and params in `rawy/utils/deep-link.ts`
- [x] T048 [US5] Configure Expo Router deep linking — add `scheme` and `intentFilters` (Android) / `associatedDomains` (iOS) to `rawy/app.json` or `app.config.ts`; configure linking prefixes in `rawy/app/_layout.tsx`
- [x] T049 [US5] Update share functionality on episode screen — replace text-only `Share.share()` with deep link URL from `generateEpisodeLink(episodeId)`, include episode title in share message in `rawy/app/episode/[id].tsx`
- [x] T050 [P] [US5] Create `.well-known/apple-app-site-association` and `.well-known/assetlinks.json` template files for domain configuration (document in `specs/004-app-engagement-features/` as reference)
- [x] T051 [US5] Handle deep link cold-start and warm-start — use Expo Router's built-in URL handling to ensure `app/episode/[id].tsx` renders correctly when opened via deep link in both states in `rawy/app/_layout.tsx`

**Checkpoint**: Episodes shareable with working deep links

---

## Phase 8: User Story 6 — Personalized Feed (Priority: P6)

**Goal**: Home tab shows followed creators' episodes first, then recommendations

**Independent Test**: Follow 3 creators, open Home tab, verify their recent episodes appear in "From Your Following" section; scroll to see "Recommended for You" with different episodes

**Depends On**: Phase 4 (following system for followed creator IDs)

### Implementation for User Story 6

- [x] T052 [US6] Implement `FeedService` — `getPersonalizedFeed(userId, page, limit)` uses MongoDB aggregation: fetch followed creator IDs via FollowsService, query recent episodes from those creators (sort createdAt DESC), separately query popular episodes from non-followed creators weighted by category match and viewsCount; return `{ following, recommended, followingTotal, recommendedTotal }` in `backend/src/feed/feed.service.ts`
- [x] T053 [US6] Implement `FeedController` — `GET /feed` (authenticated: personalized), fallback for unauthenticated: trending only; inject FollowsService and EpisodesService in `backend/src/feed/feed.controller.ts`
- [x] T054 [P] [US6] Create `feed.service.ts` frontend — `getFeed(page, limit)` using axios in `rawy/services/feed.service.ts`
- [x] T055 [US6] Create `useFeed` React Query hook — `useFeed(page)` query with pull-to-refresh support in `rawy/hooks/queries/use-feed.ts`
- [x] T056 [US6] Redesign Home tab — replace current content with two sections: "From Your Following" (horizontal or vertical list of followed creator episodes) and "Recommended for You" (vertical episode list); pull-to-refresh; empty state for no-followers ("Explore and follow creators to personalize your feed") in `rawy/app/(tabs)/index.tsx`

**Checkpoint**: Personalized home feed working with followed content + recommendations

---

## Phase 9: User Story 7 — User Suggestions Based on Location (Priority: P7)

**Goal**: Horizontal scrollable suggestion cards on Explore/Home based on proximity or interests

**Independent Test**: Grant location permission, open Explore page, verify "Suggested Near You" horizontal list appears with nearby creators; deny location — verify fallback to interest-based suggestions

**Depends On**: Phase 4 (following system — to exclude already-followed users)

### Implementation for User Story 7

- [x] T057 [US7] Implement `SuggestionsService` — `getSuggestions(userId, lat?, lng?, limit)`: if lat/lng provided, use `$geoNear` aggregation on User collection with `2dsphere` index on `location.coordinates` to find nearby creators/users (max 50km), exclude already-followed; if no location, suggest by category overlap (user's followed creators' categories vs. other creators' categories) + popularity (followerCount DESC); exclude self in `backend/src/suggestions/suggestions.service.ts`
- [x] T058 [US7] Implement `SuggestionsController` — `GET /suggestions/users?limit=10&lat=...&lng=...` with JWT auth in `backend/src/suggestions/suggestions.controller.ts`
- [x] T059 [US7] Add location update endpoint — `PATCH /users/me/location` accepting `{ city, coordinates }`, round coordinates to 2 decimal places, update User document in `backend/src/users/users.controller.ts` and `backend/src/users/users.service.ts`
- [x] T060 [P] [US7] Create `SuggestionCard` component — displays user/creator avatar, name, show name (if creator), follower count, location city tag, Follow button in `rawy/components/SuggestionCard.tsx`
- [x] T061 [US7] Add location collection utility — request permission via `expo-location`, get current position, round coordinates, send to `PATCH /users/me/location` on app launch (if permission granted) in `rawy/utils/location.ts`
- [x] T062 [US7] Add "Suggested for You" horizontal FlatList section to Explore or Home tab — fetch suggestions with current location params, render `SuggestionCard` components, handle Follow action (remove card from list on follow) in `rawy/app/(tabs)/explore.tsx`

**Checkpoint**: Location-based (or interest-based fallback) user suggestions working

---

## Phase 10: User Story 8 — Episode Screen UX/UI Improvements (Priority: P8)

**Goal**: Polished episode detail screen with clear hierarchy, prominent play controls, improved comment section, visible share button, collapsible description

**Independent Test**: Open any episode, verify visual hierarchy (cover → title → podcast → play → actions → description → comments), test collapsible description, verify share button visible, verify smooth layout across device sizes

**Depends On**: Phase 3 (CommentItem with likes/replies), Phase 7 (deep link share)

### Implementation for User Story 8

- [x] T063 [US8] Redesign episode screen header — large cover image at top, episode title with proper typography (bold, larger font), podcast name subtitle, duration badge, view count display with clear visual hierarchy and proper spacing in `rawy/app/episode/[id].tsx`
- [x] T064 [US8] Improve play/pause controls — prominent circular play button with adequate tap target (min 48dp), visual press feedback (scale animation via react-native-reanimated), loading state indicator in `rawy/app/episode/[id].tsx`
- [x] T065 [US8] Add action bar — horizontal row with like button (heart icon + count), comment button (message icon + count), share button (share icon, labeled "Share") using lucide-react-native icons, clear visual separation in `rawy/app/episode/[id].tsx`
- [x] T066 [US8] Implement collapsible description — "Read more" / "Show less" toggle for descriptions longer than 3 lines, smooth height animation in `rawy/app/episode/[id].tsx`
- [x] T067 [US8] Polish comment section layout — clear section header ("Comments"), comment input at top of section, improved `CommentItem` spacing, separator lines between comments, proper empty state in `rawy/app/episode/[id].tsx`

**Checkpoint**: Episode screen visually polished with improved UX

---

## Phase 11: User Story 9 — Fix View Count Issue (Priority: P9)

**Goal**: Ensure view counts are accurate — no duplicate counting from same user, display reflects actual count

**Independent Test**: Play episode as user A (count +1), replay same episode (count unchanged), play as user B (count +1), verify counts match on episode card and player

### Implementation for User Story 9

- [x] T068 [US9] Fix duplicate `recordView` calls — add a `Set<string>` of `viewedEpisodeIds` in PlayerContext (or equivalent state), check before calling `recordView`; only call once per episode per app session in the player/audio context file under `rawy/`
- [x] T069 [US9] Invalidate episode query cache after recording a view — after successful `recordView` API call, call `queryClient.invalidateQueries(['episode', episodeId])` to refresh displayed count in the relevant hook/service under `rawy/hooks/` or `rawy/services/views.service.ts`
- [x] T070 [US9] Verify view count display consistency — ensure episode cards (home, explore, search results) and the player screen all read from the same React Query cache key for episode data; fix any stale display issues in relevant component files

**Checkpoint**: View counts are accurate and idempotent

---

## Phase 12: User Story 10 — General UX Improvements (Priority: P10)

**Goal**: Polish navigation transitions, consistent spacing, visual feedback for all interactions

**Independent Test**: Navigate through Home → Explore → Notifications → Library → Profile, verify smooth transitions; tap like/follow/share buttons, verify immediate visual feedback; scroll lists, verify no jank

### Implementation for User Story 10

- [x] T071 [US10] Add smooth navigation transitions — configure tab bar animations, screen transition animations (slide/fade) via React Navigation config in `rawy/app/(tabs)/_layout.tsx` and `rawy/app/_layout.tsx`
- [x] T072 [P] [US10] Implement consistent spacing tokens — create shared spacing/typography constants (padding, margins, font sizes, font weights) and apply across all screens for uniform visual hierarchy in `rawy/constants/theme.ts` (or equivalent)
- [x] T073 [US10] Add optimistic update feedback — ensure all interactive actions (like, follow, share, comment) update UI immediately with optimistic state, show subtle loading indicator only if server is slow, rollback on error; audit and update all mutation hooks in `rawy/hooks/queries/`
- [x] T074 [US10] Add touch feedback to all interactive elements — ripple/opacity on cards, buttons, list items; add Pressable with `android_ripple` and opacity feedback across key components in `rawy/components/` and `rawy/app/`
- [x] T075 [US10] Smooth scrolling audit — ensure all FlatList and ScrollView components use `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize` optimizations; fix any jank in long lists (home feed, comments, notifications) across `rawy/app/` screens

**Checkpoint**: App feels polished, consistent, and responsive across all screens

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, cleanup, and validation

- [ ] T076 [P] Review and ensure all new backend endpoints have proper Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) in all new/modified controllers
- [ ] T077 [P] Add input validation decorators (`class-validator`) to all new DTOs — ensure `IsMongoId`, `IsString`, `MaxLength`, `IsOptional`, `IsBoolean`, `IsNumber` constraints in `backend/src/*/dto/`
- [ ] T078 Run full backend build (`npm run build` in `backend/`) and verify no TypeScript errors
- [ ] T079 Run full frontend build (`npx expo export` in `rawy/`) and verify no TypeScript errors
- [ ] T080 End-to-end smoke test: register user → follow creator → like comment → check notifications → share episode → verify all flows work together
- [ ] T081 [P] Update API documentation — verify all 14 new endpoints appear in Swagger at `http://localhost:3000/api`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US3 Comments (Phase 3)**: Depends on Phase 2 — first story because US1 notifications depend on comment events
- **US4 Following (Phase 4)**: Depends on Phase 2 — can run in parallel with Phase 3
- **US1 Notifications (Phase 5)**: Depends on Phases 3 + 4 (needs comment + follow triggers)
- **US2 Push Notifications (Phase 6)**: Depends on Phase 5 (extends notification infrastructure)
- **US5 Deep Linking (Phase 7)**: Depends on Phase 2 only — can run in parallel with Phases 3–6
- **US6 Feed (Phase 8)**: Depends on Phase 4 (following data for personalization)
- **US7 Suggestions (Phase 9)**: Depends on Phase 4 (following data to exclude)
- **US8 Episode UX (Phase 10)**: Depends on Phase 3 (CommentItem) + Phase 7 (share deep link)
- **US9 View Count (Phase 11)**: Depends on Phase 2 only — can run in parallel with any story
- **US10 General UX (Phase 12)**: Depends on all feature phases (polish applied last)
- **Polish (Phase 13)**: Depends on all phases complete

### User Story Dependencies

```
Phase 1 (Setup) ──▶ Phase 2 (Foundational) ──┬──▶ Phase 3 (US3: Comments) ──┐
                                               │                              │
                                               ├──▶ Phase 4 (US4: Following)──┤
                                               │                              │
                                               │                              ▼
                                               │                   Phase 5 (US1: Notifications) ──▶ Phase 6 (US2: Push)
                                               │
                                               ├──▶ Phase 7 (US5: Deep Links) ──────────────────────┐
                                               │                                                     │
                                               ├──▶ Phase 11 (US9: View Count Fix)                   │
                                               │                                                     │
                                               └──(via Phase 4)──▶ Phase 8 (US6: Feed)               │
                                                                                                      │
                                                  (via Phase 4)──▶ Phase 9 (US7: Suggestions)         │
                                                                                                      │
                                                  (via Phase 3+7)──▶ Phase 10 (US8: Episode UX) ◀────┘
                                                  
                                               All ──▶ Phase 12 (US10: General UX) ──▶ Phase 13 (Polish)
```

### Parallel Opportunities

- **Phases 3 + 4 + 7 + 11** can run in parallel after Phase 2 completes
- **Phases 8 + 9** can run in parallel (both depend on Phase 4 only)
- Within each phase, tasks marked `[P]` can run in parallel
- Backend and frontend tasks within the same story can overlap once the backend API is defined

---

## Parallel Example: Phase 2 (Foundational)

```bash
# All schema tasks can run in parallel (different files):
Task T006: Extend Comment schema in backend/src/comments/schemas/comment.schema.ts
Task T007: Create CommentLike schema in backend/src/comment-likes/schemas/comment-like.schema.ts
Task T008: Create Notification schema in backend/src/notifications/schemas/notification.schema.ts
Task T009: Extend User schema in backend/src/users/schemas/user.schema.ts
# Then T010 after T008 (registers Notification schema)
```

## Parallel Example: Phase 3 (US3 — Comments)

```bash
# Backend service tasks run sequentially (T012 → T013 → T014 → T15 → T016)
# Frontend service tasks can run in parallel:
Task T017: Create comment-likes.service.ts (frontend)
Task T018: Extend comments.service.ts (frontend)
# Then hooks (T019, T020) after services
# Then components (T021) after hooks
# Then integration (T022) after components
```

---

## Implementation Strategy

### MVP First (Phases 1–5: Comments + Following + Notifications)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational schemas
3. Complete Phase 3: Comment likes & replies → **testable increment**
4. Complete Phase 4: Following improvements → **testable increment**
5. Complete Phase 5: In-app notifications → **testable MVP with core engagement loop**
6. **STOP and VALIDATE**: Full notification flow working

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. + Comments (US3) → Test independently → Social interaction enabled
3. + Following (US4) → Test independently → Social backbone improved
4. + Notifications (US1) → Test independently → **Core engagement MVP!**
5. + Push (US2) → Test independently → Re-engagement channel active
6. + Deep Linking (US5) → Test independently → Growth channel enabled
7. + Feed (US6) → Test independently → Content discovery improved
8. + Suggestions (US7) → Test independently → Community building enabled
9. + Episode UX (US8) → Test independently → Polish layer 1
10. + View Count Fix (US9) → Test independently → Data accuracy
11. + General UX (US10) → Test independently → Polish layer 2
12. Polish (Phase 13) → Final validation

### Parallel Team Strategy

With 2 developers after Phase 2:

- **Developer A**: Phase 3 (Comments) → Phase 5 (Notifications) → Phase 6 (Push)
- **Developer B**: Phase 4 (Following) → Phase 7 (Deep Links) → Phase 8 (Feed) → Phase 9 (Suggestions)
- **Together**: Phase 10 (Episode UX) → Phase 11 (View Fix) → Phase 12 (General UX) → Phase 13 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US3 (Comments) and US4 (Following) are ordered before US1 (Notifications) because notifications depend on the events those features generate
