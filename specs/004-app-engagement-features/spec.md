# Feature Specification: App Engagement Features

**Feature Branch**: `004-app-engagement-features`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "In-App Notifications, Firebase Push Notifications, Deep Linking, Comment System Improvements, Following System Improvements, Personalized Feed, User Suggestions Based on Location, Episode Screen UX/UI Improvements, Fix View Count Issue, General UX Improvements"

## Clarifications

### Session 2026-03-08

- Q: How long should in-app notifications be retained before automatic cleanup? → A: Auto-delete after 90 days.
- Q: Should the system aggregate or throttle notifications to prevent flooding? → A: Aggregate same-type notifications on the same target (e.g., "Ahmed and 12 others liked your comment").
- Q: Which deep linking approach should be used for episode sharing? → A: Expo deep linking with Universal Links (iOS) / App Links (Android) using a custom domain — no third-party dependency.
- Q: When a user's location is collected for suggestions, at what granularity should it be stored? → A: City-level only (city name or coordinates rounded to ~10km radius).
- Q: Should the Notifications tab replace an existing tab or be added as a 5th tab? → A: Add as a 5th tab (Home, Explore, Notifications, Library, Profile).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — In-App Notifications System (Priority: P1)

As a podcast listener, I want to receive in-app notifications when something relevant happens — a creator I follow publishes a new episode, someone replies to my comment, someone likes my comment, or someone follows me. I want a dedicated Notifications screen as a 5th tab in the tab bar (Home, Explore, Notifications, Library, Profile) where I can view all my notifications, see which ones are unread, and mark them as read. The tab icon should show a badge indicating unread notification count.

**Why this priority**: Notifications are the primary driver for user re-engagement and retention. Without notifications, users must manually check for new content, which leads to churn. An in-app notification system keeps users informed and engaged, and is a prerequisite for the push notification integration (User Story 2).

**Independent Test**: Can be tested by triggering a notification event (e.g., following a creator who then publishes an episode, or receiving a reply to a comment), navigating to the Notifications tab, and verifying the notification appears with the correct content and unread badge. Marking the notification as read should remove the badge count.

**Acceptance Scenarios**:

1. **Given** a creator I follow publishes a new episode, **When** I open the Notifications tab, **Then** I see a notification with the episode title, creator name, and a timestamp.
2. **Given** another user replies to my comment on an episode, **When** I check my Notifications tab, **Then** I see a notification indicating who replied, what episode, and a preview of the reply text.
3. **Given** another user likes my comment, **When** I check my Notifications tab, **Then** I see a notification indicating who liked my comment and on which episode.
4. **Given** a user follows me, **When** I check my Notifications tab, **Then** I see a notification indicating who followed me, with their name and avatar.
5. **Given** I have 3 unread notifications, **When** I look at the tab bar, **Then** the Notifications tab icon shows a badge with the number "3".
6. **Given** I open the Notifications tab, **When** I view my notifications, **Then** unread notifications are visually distinguished (e.g., highlighted background or bold text) from read ones.
7. **Given** I tap on a notification about a new episode, **When** the navigation completes, **Then** I am taken to the Episode detail screen for that episode, and the notification is marked as read.
8. **Given** I tap on a notification about a comment reply, **When** the navigation completes, **Then** I am taken to the Episode screen with the comment section visible.
9. **Given** I tap on a notification about a new follower, **When** the navigation completes, **Then** I am taken to that user's profile screen.
10. **Given** I have unread notifications, **When** I tap "Mark all as read", **Then** all notifications become read and the badge count resets to zero.

---

### User Story 2 — Firebase Push Notifications (Priority: P2)

As a user, I want to receive push notifications on my device even when the app is not open. When a new episode is published by a creator I follow, someone replies to or likes my comment, or someone follows me, I should receive a push notification. Tapping the notification should open the app and navigate me directly to the relevant screen.

**Why this priority**: Push notifications are the channel that brings users back to the app. While in-app notifications (P1) provide the inbox, push notifications drive re-engagement from outside the app. They build on the in-app notification infrastructure and are the second most impactful engagement feature.

**Independent Test**: Can be tested by triggering a notification event while the app is in the background, verifying a push notification appears on the device, and tapping it to verify the app opens and navigates to the correct screen.

**Acceptance Scenarios**:

1. **Given** I install the app and log in, **When** the app initializes, **Then** the device token is registered with the backend.
2. **Given** a creator I follow publishes a new episode, **When** I am not using the app, **Then** I receive a push notification with the podcast name and episode title.
3. **Given** someone replies to my comment, **When** I am not using the app, **Then** I receive a push notification with the replier's name and a preview of the reply.
4. **Given** someone likes my comment, **When** I am not using the app, **Then** I receive a push notification indicating who liked my comment.
5. **Given** someone follows me, **When** I am not using the app, **Then** I receive a push notification with the follower's name.
6. **Given** I receive a push notification about a new episode, **When** I tap the notification, **Then** the app opens and navigates directly to the Episode detail screen.
7. **Given** I receive a push notification while the app is in the foreground, **When** the notification arrives, **Then** a subtle in-app banner or toast appears (not a system-level interruption).
8. **Given** I have disabled push notifications in the Settings page, **When** a notification event occurs, **Then** no push notification is sent to my device.
9. **Given** I log out of the app, **When** I log in on a different device, **Then** the device token is updated and notifications are sent to the new device.

---

### User Story 3 — Comment System Improvements (Priority: P3)

As a listener engaging with podcast episodes, I want to be able to like individual comments and reply to comments in a threaded conversation. I want to see the number of likes on each comment and read replies nested under the original comment. This enables richer discussions and community engagement around episodes.

**Why this priority**: The comment system is the primary social interaction layer. Currently, comments are flat (no replies or likes), severely limiting engagement. Adding likes and replies transforms comments from a simple list into a community discussion, which increases time-in-app and return visits. This is a prerequisite for comment-related notifications (P1).

**Independent Test**: Can be tested by navigating to an episode, posting a comment, liking another user's comment, replying to a comment, and verifying the like count and nested reply appear correctly.

**Acceptance Scenarios**:

1. **Given** I am viewing a comment on an episode, **When** I tap the like button on the comment, **Then** the like count increments by one and the like icon becomes filled/highlighted.
2. **Given** I have already liked a comment, **When** I tap the like button again, **Then** the like is removed, the count decrements, and the icon returns to the default state.
3. **Given** I am viewing a comment, **When** I tap the reply button, **Then** a text input field appears pre-focused, indicating I am replying to that specific comment.
4. **Given** I submit a reply to a comment, **When** the reply is saved, **Then** the reply appears nested under the parent comment with the author name, timestamp, and reply text.
5. **Given** a comment has 3 replies, **When** I view the comment, **Then** I see a "3 replies" indicator. Tapping it expands/shows the replies underneath.
6. **Given** a comment has 15 likes, **When** I view the comment, **Then** I see "15" next to the like icon.
7. **Given** I am not logged in, **When** I try to like or reply to a comment, **Then** I am prompted to log in.
8. **Given** I wrote a reply, **When** I want to delete it, **Then** I can delete my own reply (same as deleting a regular comment).

---

### User Story 4 — Following System Improvements (Priority: P4)

As a user, I want a more comprehensive following system where I can follow both users and creators, see follower and following counts on profiles, and have a smooth follow/unfollow experience. As a creator, I want to see who follows me and how many followers I have.

**Why this priority**: The following system is the backbone of the personalized feed (User Story 6) and notification triggers. Currently, the system only supports following creators with limited profile data. Enhancing it to include user-following, follower/following counts, and optimized queries directly feeds into personalization and community features.

**Independent Test**: Can be tested by visiting a creator/user profile, tapping follow, verifying the follower count increments, navigating to the user's profile to confirm the following count increments, and then unfollowing to verify counts decrement.

**Acceptance Scenarios**:

1. **Given** I visit a creator's profile, **When** I tap "Follow", **Then** the follow button changes to "Following", the creator's follower count increments, and my following count increments.
2. **Given** I am following a creator, **When** I tap "Following" (unfollow), **Then** a confirmation prompt appears. Upon confirming, the button reverts to "Follow" and counts decrement.
3. **Given** I visit another user's profile, **When** I tap "Follow", **Then** I start following that user and counts update accordingly.
4. **Given** I view my own profile, **When** I look at my stats, **Then** I see my follower count and following count.
5. **Given** I view a creator's profile, **When** I look at their stats, **Then** I see their follower count.
6. **Given** I tap on my "Followers" count, **When** the list loads, **Then** I see a list of users who follow me, each with their avatar and name.
7. **Given** I tap on my "Following" count, **When** the list loads, **Then** I see a list of creators/users I follow, each with their avatar and name.

---

### User Story 5 — Podcast Sharing & Deep Linking (Priority: P5)

As a listener, I want to share a podcast episode with friends via a shareable link. When the recipient taps the link, the app should open directly to that episode. If the app is not installed, the link should redirect to the app store.

**Why this priority**: Sharing is the most organic user acquisition channel. Currently, the share feature only shares a text message without a functional link. Adding deep links enables viral growth — every shared episode becomes a potential download. This is a high-leverage growth feature but ranked after core engagement features.

**Independent Test**: Can be tested by tapping the share button on an episode, sending the link to another device, tapping the link, and verifying the app opens to the correct episode screen (or redirects to the store if not installed).

**Acceptance Scenarios**:

1. **Given** I am viewing an episode, **When** I tap the "Share" button, **Then** a system share sheet appears with a deep link to the episode.
2. **Given** I receive a shared episode link and the app is installed, **When** I tap the link, **Then** the app opens and navigates directly to the Episode detail screen for that episode.
3. **Given** I receive a shared episode link and the app is NOT installed, **When** I tap the link, **Then** I am redirected to the app store (Google Play / Apple App Store).
4. **Given** I share an episode, **When** the link is generated, **Then** the link contains the episode identifier and is a valid URL that can be shared via any platform (WhatsApp, SMS, etc.).
5. **Given** the app is in the background, **When** I tap a deep link, **Then** the app resumes and navigates to the correct episode.

---

### User Story 6 — Personalized Feed (Priority: P6)

As a listener, I want my home feed to prioritize episodes from creators I follow, mixed with recommended podcasts that I might enjoy. The feed should feel dynamic and engaging, not just a chronological list of all episodes.

**Why this priority**: A personalized feed dramatically increases content consumption by surfacing relevant content. Currently, the home page shows all podcasts without personalization. While impactful, this depends on the following system (P4) being robust and is more of an optimization than a new core capability.

**Independent Test**: Can be tested by following several creators, then opening the Home tab and verifying that episodes from followed creators appear prominently, interspersed with recommended podcasts the user doesn't follow.

**Acceptance Scenarios**:

1. **Given** I follow 3 creators, **When** I open the Home tab, **Then** the feed shows recent episodes from the creators I follow at the top or in a prominent "From Your Following" section.
2. **Given** I am on the Home tab, **When** I scroll past the followed content, **Then** I see a "Recommended for You" section with podcasts I don't follow yet, based on category or popularity.
3. **Given** I follow no creators, **When** I open the Home tab, **Then** I see trending/popular podcasts and a suggestion to explore and follow creators.
4. **Given** I am on the Home tab, **When** I pull to refresh, **Then** the feed updates with the latest episodes and recommendations.
5. **Given** a creator I follow publishes a new episode, **When** I refresh my feed, **Then** the new episode appears near the top of my feed.

---

### User Story 7 — User Suggestions Based on Location (Priority: P7)

As a user, I want to discover other users and creators near me or with similar interests. The app should show a "Suggested Users" or "Suggested Creators" section, presented in a horizontal scrollable list.

**Why this priority**: User suggestions enhance community building and content discovery. However, this is a "nice to have" feature that depends on location data and interest profiling. It's lower priority because the Explore page and personalized feed already serve discovery needs. Location-based suggestions add an extra layer of relevance.

**Independent Test**: Can be tested by granting location permission, opening the relevant screen, and verifying that suggested users/creators appear in a horizontal list, prioritized by geographic proximity.

**Acceptance Scenarios**:

1. **Given** I have granted location permission, **When** I view the Explore page or Home tab, **Then** I see a "Suggested Near You" horizontal list of users/creators.
2. **Given** I view a suggested creator, **When** I see their card, **Then** it shows their name, avatar, podcast name, and distance/location tag.
3. **Given** I tap on a suggested user/creator, **When** the navigation completes, **Then** I am taken to their profile page.
4. **Given** I have not granted location permission, **When** I view the suggestions section, **Then** I see interest-based suggestions instead of location-based ones, or a prompt to enable location for better results.
5. **Given** suggestions are shown, **When** I scroll horizontally, **Then** I can browse through multiple suggestions smoothly.
6. **Given** I follow a suggested creator, **When** the suggestions refresh, **Then** that creator is removed from the suggestions list.

---

### User Story 8 — Episode Screen UX/UI Improvements (Priority: P8)

As a listener, I want the Episode detail screen to have an improved layout with better visual hierarchy, clearer play controls, an enhanced comment section, a prominent share button, and improved spacing and typography. The screen should feel polished, modern, and intuitive.

**Why this priority**: The Episode screen is one of the most visited screens in the app. Improving its UX directly impacts every listening session. However, this is a polish/refinement story that doesn't add new functionality, which is why it ranks behind feature-adding stories. The current screen is functional but needs layout and design improvements.

**Independent Test**: Can be tested by navigating to any episode and visually verifying the improved layout, clearer hierarchy, better play button placement, improved comment section design, visible share button, and proper spacing.

**Acceptance Scenarios**:

1. **Given** I open an episode detail screen, **When** I view the layout, **Then** the episode cover image, title, podcast name, and duration are arranged in a clear visual hierarchy with proper spacing.
2. **Given** I view the episode screen, **When** I look for the play button, **Then** the play/pause control is prominently visible with a clear, tappable area and visual feedback.
3. **Given** I scroll to the comments section, **When** I view the comments, **Then** comments are displayed with clear separation, author avatars, timestamps, like buttons, and reply indicators.
4. **Given** I look at the action bar, **When** I see the available actions, **Then** the share button is clearly visible and labeled alongside like and comment actions.
5. **Given** I view the episode description, **When** the text is long, **Then** it is collapsible with a "Read more" / "Show less" toggle.
6. **Given** I view the episode screen on different device sizes, **When** I compare the layouts, **Then** the design adapts gracefully to different screen sizes.

---

### User Story 9 — Fix View Count Issue (Priority: P9)

As a creator, the episode views counter must accurately reflect unique views. Views should increment correctly when a listener plays an episode for the first time and should not count duplicate views from the same user. The view count displayed on episode cards and the player screen must be accurate and up-to-date.

**Why this priority**: Accurate analytics are essential for creator trust and content strategy. If view counts are inaccurate, creators lose confidence in the platform. However, this is a bug fix rather than a new feature, and the backend already has idempotent view recording — the issue is likely on the frontend integration side.

**Independent Test**: Can be tested by playing an episode as a logged-in user, noting the view count, replaying the same episode, and verifying the count did not change. Then play the episode as a different user and verify the count increments by one.

**Acceptance Scenarios**:

1. **Given** I play an episode for the first time, **When** playback starts, **Then** the view count increments by exactly one.
2. **Given** I have already played an episode, **When** I play it again, **Then** the view count does NOT increment (idempotent).
3. **Given** I view an episode card on any screen, **When** I look at the view count, **Then** it shows the accurate, up-to-date number of unique views.
4. **Given** I am on the player screen, **When** I look at the episode info, **Then** the view count displayed matches the actual count from the database.
5. **Given** I am not logged in, **When** I play an episode, **Then** no view is recorded (the count does not change).

---

### User Story 10 — General UX Improvements (Priority: P10)

As a user navigating the app, I want smoother navigation transitions, clearer visual hierarchy across all screens, better spacing and padding, and more intuitive interactions. The overall experience should feel polished and comparable to modern podcast apps.

**Why this priority**: General UX polish is important for user satisfaction and retention but is the lowest priority because it doesn't add specific functionality. It's a holistic improvement pass applied after all feature work is complete.

**Independent Test**: Can be tested by navigating through the main screens (Home, Explore, Library, Profile), verifying smooth transitions, consistent spacing, proper hierarchy, and intuitive touch targets.

**Acceptance Scenarios**:

1. **Given** I navigate between tabs, **When** the transition occurs, **Then** the screen change is smooth with no flickering or layout shifts.
2. **Given** I view any screen, **When** I look at the content, **Then** the visual hierarchy is clear — headings are prominent, secondary text is subdued, and interactive elements are easily identifiable.
3. **Given** I view the app on different screens (Home, Explore, Library, Profile), **When** I compare spacing, **Then** padding and margins are consistent across all screens.
4. **Given** I interact with buttons, cards, or list items, **When** I tap them, **Then** there is visual feedback (ripple, opacity change, or animation) confirming my interaction.
5. **Given** I view lists of content (episodes, podcasts, comments), **When** I scroll, **Then** scrolling is smooth with no jank or frame drops.
6. **Given** I perform any action (follow, like, share), **When** the action completes, **Then** the UI updates immediately with optimistic feedback (not waiting for the server response to update the display).

---

### Edge Cases

- What happens when a notification event occurs but the user has disabled push notifications? → The in-app notification is still created and stored; only the push notification is suppressed.
- What happens when a deep link contains an invalid or deleted episode ID? → The app shows an "Episode not found" error screen with a "Go Home" button.
- What happens when a user has thousands of notifications? → Notifications are paginated (loaded in batches of 20), with older notifications accessible by scrolling.
- What happens when a user likes their own comment? → The like is allowed (consistent with most social platforms); the user does NOT receive a notification for liking their own content.
- What happens when a reply chain becomes deeply nested? → Only one level of nesting is supported (replies to comments, not replies to replies). Replies to replies are treated as additional replies to the original comment.
- What happens when the follower/following count is very large? → Counts are displayed in compact format (e.g., "12.5K followers") and the follower/following lists are paginated.
- What happens when the personalized feed has no followed creators and no recommendations? → A "Getting Started" section guides users to explore and follow creators.
- What happens when location services are denied? → The suggestion section falls back to interest-based or popularity-based suggestions without showing an error.
- What happens when a comment with replies is deleted? → All child replies are also deleted (cascade). The reply count on the parent adjusts accordingly.
- What happens when multiple notification events happen simultaneously? → Each event creates a separate notification entry; they are displayed in reverse chronological order.
- What happens when the device token changes (e.g., app reinstall)? → On app launch and login, the current token replaces any stale token for that device/user combination.
- What happens when a user is viewing the episode screen and a view recording request fails? → The failure is silent (fire-and-forget); the user's playback experience is not interrupted.
- What happens when the share sheet is dismissed without sharing? → Nothing happens; no side effects occur.
- What happens to notifications older than 90 days? → They are automatically deleted. Users cannot view notifications beyond the 90-day retention window.
- What happens when a comment receives many likes in a short period? → Same-type notifications for the same target are aggregated into a single notification (e.g., "Ahmed and 12 others liked your comment"). The aggregated notification updates as new events arrive.

## Requirements *(mandatory)*

### Functional Requirements

**In-App Notifications:**

- **FR-001**: System MUST create and store an in-app notification when a creator the user follows publishes a new episode.
- **FR-002**: System MUST create and store an in-app notification when another user replies to the user's comment.
- **FR-003**: System MUST create and store an in-app notification when another user likes the user's comment.
- **FR-004**: System MUST create and store an in-app notification when another user follows the user.
- **FR-005**: System MUST display a Notifications screen as a dedicated 5th tab in the main tab bar (tab order: Home, Explore, Notifications, Library, Profile), listing all notifications in reverse chronological order with pagination.
- **FR-006**: System MUST display a badge on the Notifications tab icon showing the count of unread notifications.
- **FR-007**: System MUST visually distinguish unread notifications from read notifications.
- **FR-008**: System MUST mark a notification as read when the user taps on it and navigates to the related content.
- **FR-009**: System MUST provide a "Mark all as read" action to mark all unread notifications as read at once.
- **FR-010**: System MUST NOT create a notification for a user's own actions (e.g., liking own comment, following self).

**Firebase Push Notifications:**

- **FR-011**: System MUST register the device's FCM token with the backend upon user login or app initialization.
- **FR-012**: System MUST send a push notification when a creator publishes a new episode (to all followers with tokens).
- **FR-013**: System MUST send a push notification when a user receives a comment reply.
- **FR-014**: System MUST send a push notification when a user receives a comment like.
- **FR-015**: System MUST send a push notification when a user receives a new follower.
- **FR-016**: System MUST handle push notifications in both foreground (display as in-app banner) and background (display as system notification).
- **FR-017**: System MUST navigate the user to the correct screen (episode, profile, etc.) when the user taps a push notification.
- **FR-018**: System MUST respect the user's push notification toggle setting — if disabled, no push notifications are sent to that user's devices.
- **FR-019**: System MUST remove invalid/expired device tokens when push delivery fails.

**Comment System Improvements:**

- **FR-020**: System MUST allow logged-in users to like and unlike individual comments.
- **FR-021**: System MUST display the like count on each comment.
- **FR-022**: System MUST track and enforce one like per user per comment (idempotent).
- **FR-023**: System MUST allow logged-in users to reply to a comment, creating a threaded conversation.
- **FR-024**: System MUST display replies nested under their parent comment.
- **FR-025**: System MUST limit nesting depth to one level (replies to comments only; replies to replies become sibling replies under the same parent).
- **FR-026**: System MUST display the count of replies on each comment with a toggle to expand/collapse.
- **FR-027**: System MUST allow users to delete their own replies.

**Following System Improvements:**

- **FR-028**: System MUST support following and unfollowing both users and creators.
- **FR-029**: System MUST display follower count and following count on user and creator profiles.
- **FR-030**: System MUST provide paginated follower and following lists accessible by tapping the respective counts.
- **FR-031**: System MUST update follower/following counts in real time upon follow/unfollow actions (optimistic updates).

**Podcast Sharing & Deep Linking:**

- **FR-032**: System MUST generate a deep link URL for each episode when the user taps "Share".
- **FR-033**: System MUST handle incoming deep links by navigating to the correct episode screen when the app is opened via a link.
- **FR-034**: System MUST redirect to the appropriate app store if the app is not installed when a deep link is opened, using Universal Links (iOS) and App Links (Android) fallback behavior.
- **FR-035**: System MUST support both cold-start and warm-start deep link handling.

**Personalized Feed:**

- **FR-036**: System MUST prioritize episodes from creators the user follows in the home feed.
- **FR-037**: System MUST include a "Recommended for You" section with podcasts/episodes the user doesn't follow, based on category popularity.
- **FR-038**: System MUST display a "Getting Started" guide when the user has no followed creators and no recommendations.
- **FR-039**: System MUST support pull-to-refresh on the home feed to load fresh content.

**User Suggestions:**

- **FR-040**: System MUST display a "Suggested for You" section on the Explore or Home screen in a horizontally scrollable list.
- **FR-041**: System MUST suggest users/creators based on geographic proximity (city-level) when location permission is granted.
- **FR-042**: System MUST fall back to interest-based or popularity-based suggestions when location permission is denied.
- **FR-043**: System MUST exclude already-followed users/creators from suggestions.

**Episode Screen UX/UI:**

- **FR-044**: System MUST display episode information (cover, title, podcast, duration, view count) in a clear, well-spaced visual hierarchy.
- **FR-045**: System MUST provide prominently visible play/pause controls with visual feedback.
- **FR-046**: System MUST display a visible, labeled share button in the action bar.
- **FR-047**: System MUST support collapsible episode descriptions with "Read more" / "Show less" toggle for long text.
- **FR-048**: System MUST display the improved comment section with likes and reply indicators.

**View Count Fix:**

- **FR-049**: System MUST ensure views increment correctly by exactly one per unique user per episode.
- **FR-050**: System MUST prevent duplicate counting (frontend MUST NOT send multiple record-view requests for the same episode in the same session).
- **FR-051**: System MUST display accurate, up-to-date view counts on episode cards, the player screen, and the creator dashboard.

**General UX:**

- **FR-052**: System MUST provide smooth navigation transitions between screens and tabs.
- **FR-053**: System MUST use consistent spacing, padding, and typography across all screens.
- **FR-054**: System MUST provide immediate visual feedback (optimistic updates) for interactive actions (like, follow, share).
- **FR-055**: System MUST ensure smooth scrolling with no perceptible jank on lists and feeds.

**Notification Retention:**

- **FR-056**: System MUST automatically delete in-app notifications older than 90 days.
- **FR-057**: System MUST aggregate same-type notifications targeting the same entity (e.g., multiple likes on the same comment) into a single notification entry showing the most recent actor and a count of others (e.g., "Ahmed and 12 others liked your comment").

### Key Entities

- **Notification**: Represents an in-app notification with type (new_episode, comment_reply, comment_like, new_follower), recipient user, sender user (most recent actor), reference to target entity (episode, comment, user), read/unread status, timestamp, aggregation count (number of grouped actors), and a 90-day retention window (auto-deleted after expiry). Same-type notifications on the same target are aggregated rather than stored individually.
- **Comment**: Extended with optional `parentCommentId` for reply threading, and `likesCount` for comment-level likes. Replies reference their parent comment.
- **CommentLike**: Tracks unique user-comment like events. One entry per user-comment pair (idempotent). Records the liker and the target comment.
- **Follow**: Extended to support following both users and creators. Tracks follower ID, target ID, and target type.
- **DeviceToken**: Represents a registered FCM device token associated with a user. A user may have multiple devices/tokens.
- **View**: Tracks unique user-episode view events. One entry per user-episode pair (idempotent).
- **User**: Extended with optional city-level location (city name or coarse coordinates rounded to ~10km) and interests/categories for suggestion matching. Exact GPS coordinates are NOT stored for privacy reasons.
- **Episode**: Existing entity with `viewsCount`, `likesCount`, `commentsCount`. View counts must be accurately maintained.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of in-app notifications are delivered and visible to the user within 5 seconds of the triggering event.
- **SC-002**: Push notifications reach the user's device within 10 seconds of the triggering event (when the app is backgrounded and push is enabled).
- **SC-003**: Users can discover, tap, and navigate from a notification to the relevant content within 2 taps.
- **SC-004**: Comment like and reply actions complete (UI updates visually) within 1 second of the user's tap (optimistic).
- **SC-005**: Following/unfollowing a user or creator updates follower/following counts immediately via optimistic update with 100% eventual consistency.
- **SC-006**: Deep links resolve to the correct episode screen 100% of the time for valid episode links.
- **SC-007**: Episode view counts are accurate with 100% idempotency — no duplicate views from the same user.
- **SC-008**: The personalized home feed loads within 3 seconds and shows followed creators' content in the top section.
- **SC-009**: User suggestions load within 3 seconds and display at least 5 suggestions when available.
- **SC-010**: The Episode detail screen renders the improved layout within 2 seconds with no layout shifts during loading.
- **SC-011**: Navigation transitions between all screens complete within 300ms with no visible jank.
- **SC-012**: All interactive elements provide visual feedback within 100ms of the user's touch.

## Assumptions

- The existing backend has a `notifications` module with Firebase configuration (`firebase.config.ts`) and a basic `NotificationsService` that currently only handles new episode notifications. This module will be extended to support storing in-app notifications and sending additional push notification types.
- The comment schema currently has `text`, `userId`, and `episodeId` fields. It will need to be extended with `parentCommentId` (optional) for reply threading. A new `CommentLike` schema will be added.
- The likes service currently supports episode-level likes only. A new module/extension will handle comment-level likes.
- The follows service currently supports following creators only (`/follows/users/:targetId`). It will be extended or supplemented to support following regular users and providing follower/following counts.
- The views service backend already handles idempotent view recording. The view count fix will focus on the **frontend** — ensuring the `recordView` call is made exactly once per playback session and that cached/displayed view counts refresh correctly.
- The app uses Expo Router for navigation, which supports deep linking natively via Universal Links (iOS) and App Links (Android). Deep link handling will use Expo's built-in linking configuration with a custom domain — no third-party service (Firebase Dynamic Links, Branch.io, etc.) is required.
- For deep links, a custom domain (e.g., `rawy.app` or `links.rawy.app`) must be configured with a `.well-known/assetlinks.json` file (Android) and an `apple-app-site-association` file (iOS) hosted on the domain. The assumption is that a domain is available or can be set up.
- Location data for user suggestions will use the device's GPS coordinates (with permission) to determine the user's city-level location (city name or coordinates rounded to ~10km). Only the coarse location is stored on the user's profile — exact GPS coordinates are never persisted. Location is optional and never required.
- The User model may already have a `location` field or it will be added. Interests/categories can be inferred from the user's listening history and followed creators' categories.
- The personalized feed algorithm will be a simple priority-based sorting: followed creators' recent episodes first, then popular/trending, then general. No ML-based recommendation engine is needed for the MVP.
- Push notification token registration infrastructure partially exists in the backend (the `usersService.getDeviceTokensForUserIds` and `usersService.removeDeviceToken` methods are already called). The `User` model likely has a `deviceTokens` array field.
- The app uses React Native Paper components and lucide-react-native icons for UI consistency.
