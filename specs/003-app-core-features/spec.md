# Feature Specification: App Core Features

**Feature Branch**: `003-app-core-features`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "Explore page enhancements, Library following section, views system, auth modifications, settings modifications, and terms & conditions"

## Clarifications

### Session 2026-03-08

- Q: When a creator deletes their account, should their published podcasts and episodes be deleted too, or preserved? → A: Full cascade delete — deleting a creator account also deletes all their podcasts, episodes, associated views, and follows.
- Q: At what point should a view be recorded — immediately on play, or after a listening duration threshold? → A: Immediately when playback starts (on play tap).
- Q: How should search on the Explore page be triggered — debounced auto-search or submit-based? → A: Debounced auto-search (fires ~500ms after user stops typing).
- Q: Do the Change Password and Delete Account backend endpoints already exist? → A: No, both must be built as part of this feature (backend + frontend).
- Q: Should Delete Account require password re-entry before proceeding? → A: Yes, require password re-entry as a security confirmation before permanently deleting the account.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore Page Enhancement (Priority: P1)

As a podcast listener, I want the Explore page to provide a rich discovery experience so I can find new podcasts and episodes easily. The Explore page should display featured/trending podcasts, allow searching by keywords, filter by categories, and show popular creators — all with engaging visuals including podcast cover images and creator avatars.

**Why this priority**: The Explore page is the primary discovery mechanism for the app. A well-designed Explore page directly drives engagement and content consumption. Currently, it lacks podcast cover images, category filtering doesn't affect results, and the search only filters locally without server-side search. Fixing this is the highest-impact change for user acquisition and retention.

**Independent Test**: Can be tested by opening the Explore tab, verifying that podcast cards show cover images, searching for a keyword and seeing relevant server-side results, filtering by a category and seeing only matching podcasts, and tapping a creator to navigate to their profile.

**Acceptance Scenarios**:

1. **Given** I open the Explore tab, **When** the page loads, **Then** I see a search bar, category chips, a "Popular Creators" section with creator avatars, and an "All Podcasts" section with podcast cover images.
2. **Given** I am on the Explore page, **When** I type a search keyword and pause briefly, **Then** the podcast list automatically updates to show only podcasts matching the keyword in title or description (debounced server-side search, ~500ms after typing stops).
3. **Given** I am on the Explore page, **When** I tap a category chip (e.g., "Technology"), **Then** only podcasts in that category are displayed, and the active chip is visually highlighted.
4. **Given** I am viewing a podcast card, **When** I look at the card, **Then** I see the podcast cover image (or a placeholder if none exists), the podcast title, the creator name, and the episode count.
5. **Given** I am viewing the Popular Creators section, **When** I see a creator chip, **Then** it displays the creator's avatar image (or a placeholder), name, and follower count.
6. **Given** I tap on a podcast card, **When** the navigation completes, **Then** I am taken to the podcast detail page for that podcast.
7. **Given** there are no podcasts matching my search or category, **When** I see the results area, **Then** an appropriate empty state message is displayed.

---

### User Story 2 - Episode Views Tracking System (Priority: P2)

As a podcast listener, when I play an episode, the app should automatically record that I've viewed/listened to it. As a creator, I want to see how many views each of my episodes has received. The view count should be visible on episode cards, the player screen, and the creator dashboard.

**Why this priority**: A views system is fundamental to content analytics and creator engagement. Creators need feedback on their content performance, and displaying view counts adds social proof that encourages listeners to try popular episodes. The backend already exists — this story focuses on the frontend integration.

**Independent Test**: Can be tested by playing an episode and verifying the view count increments by one. Replaying the same episode should not increase the count again (idempotent). Navigate to the creator dashboard and verify that episode view counts are displayed accurately.

**Acceptance Scenarios**:

1. **Given** I am a logged-in listener, **When** I tap play on an episode for the first time, **Then** the system immediately records a view, and the episode's view count increases by one.
2. **Given** I have already viewed an episode, **When** I play the same episode again, **Then** no additional view is recorded (the view count remains unchanged).
3. **Given** I am viewing an episode card or the player screen, **When** I look at the episode information, **Then** I see the current view count displayed (e.g., "1.2K views").
4. **Given** I am a creator on the creator dashboard, **When** I look at my episodes list, **Then** each episode shows its total view count.
5. **Given** I am not logged in, **When** I play an episode, **Then** the view is not recorded (views require authentication).

---

### User Story 3 - Library Following Section Enhancement (Priority: P3)

As a logged-in user, when I navigate to the Library tab and select the "Following" segment, I want to see a rich list of creators I follow, including their avatar, name, podcast name, and a quick-action button to unfollow. Tapping a followed creator should navigate to their creator profile page.

**Why this priority**: The Library's following section is the primary way users manage their content subscriptions. Currently, it shows a minimal creator chip — enhancing it to show richer information and direct actions (unfollow, navigate) improves user engagement and content management.

**Independent Test**: Can be tested by following a creator, navigating to the Library tab, selecting the "Following" segment, and verifying the followed creator appears with avatar, name, podcast info, and an unfollow button. Tapping unfollow should remove the creator from the list.

**Acceptance Scenarios**:

1. **Given** I am on the Library tab with the "Following" segment active, **When** the list loads, **Then** I see all creators I follow, each with their avatar image, name, and podcast name.
2. **Given** I see a followed creator in the list, **When** I tap the "Unfollow" button, **Then** a confirmation prompt appears. Upon confirming, the creator is removed from the list and the follow count is updated.
3. **Given** I see a followed creator in the list, **When** I tap on the creator's row (not the unfollow button), **Then** I am navigated to that creator's profile page.
4. **Given** I am not following any creators, **When** I view the Following segment, **Then** I see an empty state message encouraging me to explore and follow creators, with a link/button to the Explore page.
5. **Given** I follow or unfollow a creator from another screen (e.g., Explore), **When** I return to the Library Following section, **Then** the list reflects the updated follow status.

---

### User Story 4 - Auth Flow Modification (Priority: P4)

As a new user launching the app for the first time, I want the onboarding flow to guide me directly to the login screen (instead of the register screen). As a user on the login/register screens, I want the password field to have a visibility toggle so I can see what I'm typing. The login and register screens should also display a link to the Terms & Conditions.

**Why this priority**: Auth flow is the entry point for all users. Directing users to login first (rather than register) simplifies the initial experience since many users may already have accounts. The password visibility toggle is a standard UX pattern that prevents typos. Linking to Terms & Conditions is a legal requirement.

**Independent Test**: Can be tested by clearing app data, launching the app, completing onboarding, and verifying navigation goes to the login screen. On both login and register screens, verify the password field has a visibility toggle and a Terms & Conditions link is visible.

**Acceptance Scenarios**:

1. **Given** I am a new user who has completed the onboarding slides, **When** I tap "Get Started" on the last slide, **Then** I am navigated to the login screen (not the register screen).
2. **Given** I am on the login screen, **When** I look at the password field, **Then** I see an eye icon to toggle password visibility. Tapping it reveals/hides the password text.
3. **Given** I am on the register screen, **When** I look at the password field, **Then** I see the same password visibility toggle.
4. **Given** I am on the login or register screen, **When** I look below the form, **Then** I see a "Terms & Conditions" link. Tapping it navigates to the Terms & Conditions page.
5. **Given** I am on the login screen, **When** I do not have an account, **Then** I see a link to navigate to the register screen and vice versa.

---

### User Story 5 - Settings Page Enhancement (Priority: P5)

As a logged-in user, I want the Settings page to provide full control over my preferences. The settings should include functional push notification toggle, account management options (change password, delete account), and navigation to Terms & Conditions, Privacy Policy, and Help & Support pages.

**Why this priority**: The settings page is currently a stub with non-functional elements. Making it fully functional is necessary for a production-ready app, especially for account management and legal compliance. However, it's lower priority because users interact with settings infrequently compared to content discovery and playback.

**Independent Test**: Can be tested by navigating to Profile → Settings and verifying all settings options are visible and interactive. Toggle push notifications and verify the state persists. Tap "Terms & Conditions" and verify it navigates to a content page. Tap "Delete Account" and verify a confirmation prompt appears.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I toggle "Push Notifications", **Then** the toggle state changes and persists across app restarts.
2. **Given** I am on the Settings page, **When** I tap "Change Password", **Then** I am navigated to a change password form that requires my current password and a new password (with confirmation).
3. **Given** I am on the Settings page, **When** I tap "Delete Account", **Then** a confirmation dialog appears warning me that this action is irreversible (and for creators, that all content will be permanently deleted). I must re-enter my password to confirm. Upon successful verification, my account is deleted and I am logged out.
4. **Given** I am on the Settings page, **When** I tap "Terms & Conditions", **Then** I am navigated to a page displaying the app's terms and conditions.
5. **Given** I am on the Settings page, **When** I tap "Privacy Policy", **Then** I am navigated to a page displaying the privacy policy.
6. **Given** I am on the Settings page, **When** I tap "Help & Support", **Then** I am navigated to a help page or an external support link/email.
7. **Given** I am on the Settings page, **When** I view the page, **Then** I see the current app version number.

---

### User Story 6 - Terms & Conditions Page (Priority: P6)

As a user, I want to be able to read the app's Terms and Conditions at any time, either from the login/register screens or from the Settings page. The Terms & Conditions page should display the full legal text in a scrollable, readable format.

**Why this priority**: Terms & Conditions are a legal necessity for any published app. However, the actual content is static and rarely changes, making this the lowest priority in terms of user-facing impact. It is primarily a compliance requirement.

**Independent Test**: Can be tested by navigating to the Terms & Conditions page from either the Settings page or the login/register screen and verifying the full text is displayed in a readable, scrollable format.

**Acceptance Scenarios**:

1. **Given** I am on the login or register screen, **When** I tap the "Terms & Conditions" link, **Then** I am navigated to the Terms & Conditions page.
2. **Given** I am on the Settings page, **When** I tap "Terms & Conditions", **Then** I am navigated to the same Terms & Conditions page.
3. **Given** I am on the Terms & Conditions page, **When** I view the content, **Then** I see the full terms text in a scrollable view with clear headings and readable formatting.
4. **Given** I am on the Terms & Conditions page, **When** I want to go back, **Then** I can tap the back button/arrow to return to the previous screen.

---

### Edge Cases

- What happens when the Explore page has no podcasts at all? → An empty state illustration with a "No podcasts available" message is displayed.
- What happens when a podcast has no cover image? → A default placeholder icon (headphones) is displayed in place of the cover image.
- What happens when a creator has no avatar? → A default placeholder icon (microphone or user silhouette) is displayed.
- What happens when the user tries to view the Library Following section without being logged in? → A prompt to sign in is displayed with a button to navigate to the login page.
- What happens when the network is unavailable while recording a view? → The view recording fails silently; the app does not show an error to the user. The view will not be counted.
- What happens when the user taps "Delete Account" and then loses network connectivity during the process? → The app shows an error message and the account is not deleted. The user can retry.
- What happens when a creator deletes their account? → All content owned by the creator (podcasts, episodes, views, follows) is permanently deleted (cascade delete). The deletion warning must explicitly mention this.
- What happens when the Terms & Conditions text is very long? → The page is scrollable, and the user can scroll through the entire text.
- What happens when the user changes their password to the same password? → The system should accept the change without error (or show a warning suggesting a different password, based on UX preference).
- What happens when the Explore search returns too many results? → Results are paginated, loading more as the user scrolls down.

## Requirements *(mandatory)*

### Functional Requirements

**Explore Page:**

- **FR-001**: System MUST display podcast cards with cover images, title, creator name, and episode count on the Explore page.
- **FR-002**: System MUST support debounced server-side keyword search (~500ms delay after user stops typing) across podcast titles and descriptions on the Explore page.
- **FR-003**: System MUST filter podcasts by category when a category chip is tapped.
- **FR-004**: System MUST display a "Popular Creators" section showing creator avatars, names, and follower counts.
- **FR-005**: System MUST provide pull-to-refresh functionality on the Explore page.
- **FR-006**: System MUST display appropriate empty states when no results match the search or category filter.

**Views System:**

- **FR-007**: System MUST record an episode view immediately when a logged-in user starts playback (on play tap), using the existing backend API (`POST /views/episodes/:episodeId`).
- **FR-008**: System MUST display episode view counts on episode cards, the player screen, and the creator dashboard.
- **FR-009**: System MUST ensure views are idempotent — the same user viewing the same episode multiple times counts as one view.
- **FR-010**: System MUST NOT record views for unauthenticated users.

**Library Following:**

- **FR-011**: System MUST display followed creators with their avatar, name, and podcast name in the Library "Following" segment.
- **FR-012**: System MUST provide an unfollow action button for each followed creator, with a confirmation prompt.
- **FR-013**: System MUST navigate to the creator's profile page when a followed creator row is tapped.
- **FR-014**: System MUST display an empty state with a call-to-action when the user is not following any creators.

**Auth Modifications:**

- **FR-015**: System MUST navigate new users from onboarding to the login screen (instead of the register screen).
- **FR-016**: System MUST provide a password visibility toggle on both login and register screens.
- **FR-017**: System MUST display a "Terms & Conditions" link on both login and register screens.

**Settings:**

- **FR-018**: System MUST provide a functional push notification toggle that persists its state.
- **FR-019**: System MUST provide a "Change Password" option that requires current password and new password with confirmation.
- **FR-020**: System MUST provide a "Delete Account" option with a confirmation dialog, warning message, and mandatory password re-entry for security. For creator accounts, the warning MUST explicitly state that all podcasts, episodes, and associated data will be permanently deleted (cascade delete).
- **FR-021**: System MUST provide navigation to Terms & Conditions, Privacy Policy, and Help & Support pages.
- **FR-022**: System MUST display the app version number.

**Terms & Conditions:**

- **FR-023**: System MUST display the Terms & Conditions in a dedicated, scrollable page.
- **FR-024**: System MUST allow navigation to the Terms & Conditions page from both auth screens and the Settings page.

### Key Entities

- **Podcast**: Represents a podcast show with title, description, cover image, category, creator, and episode count. Used in the Explore page.
- **Episode**: Represents a single podcast episode with title, duration, audio file, and view count. Views are tracked per-user per-episode.
- **View**: Tracks unique user-episode view events. One entry per user-episode pair (idempotent).
- **Creator**: A user with the "creator" role, having a public profile with avatar, name, podcast(s), and follower count.
- **Follow**: Represents a user following a creator. Used in the Library Following section.
- **User**: App user with authentication credentials, profile information, notification preferences, and account management capabilities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of Explore page content (podcast cards with images, creator chips with avatars) loads within 3 seconds on a standard network.
- **SC-002**: Episode view counts are accurately tracked with 100% idempotency (no duplicate views from the same user).
- **SC-003**: Users can search for and discover relevant podcasts within 5 seconds from the Explore page.
- **SC-004**: 95% of users can successfully follow/unfollow creators from the Library page within 2 taps.
- **SC-005**: Auth flow completion rate (onboarding to successful login/register) improves with the streamlined flow.
- **SC-006**: Password change and account deletion flows complete successfully within 30 seconds.
- **SC-007**: Terms & Conditions page loads and is fully scrollable within 2 seconds.
- **SC-008**: All settings toggles persist their state correctly across app restarts with 100% reliability.

## Assumptions

- The existing backend API already supports podcast search via query parameters (e.g., `GET /podcasts?search=keyword&category=Technology`).
- The backend already has a fully functional views module (`/views/episodes/:episodeId`) that handles idempotent view recording.
- Podcast cover images and creator avatars are served via URLs stored in the database; the frontend uses `resolveImageUrl()` utility to build full URLs.
- Push notification toggle on the frontend stores the preference locally (using AsyncStorage) and optionally sends it to the backend. Actual push notification setup (FCM/APNs) is handled separately.
- The Terms & Conditions text will be provided as static content within the app (not fetched from a server). If the text needs to be dynamic in the future, it can be migrated to a CMS.
- The "Change Password" backend endpoint (`PATCH /auth/change-password`) does not currently exist and MUST be built as part of this feature.
- The "Delete Account" backend endpoint (`DELETE /users/me`) does not currently exist and MUST be built as part of this feature, including cascade deletion of all creator content.
- The app already has navigation infrastructure (expo-router) set up to support adding new screens.
