# Feature Specification: RAWY Podcast Platform – Backend (MVP)

**Feature Branch**: `001-podcast-platform-backend`  
**Created**: 2026-03-03  
**Status**: Draft  
**Input**: User description: "Production-ready MVP backend for a podcast platform called Rawy with three user roles (User, Creator, Admin), podcast/episode management, engagement features, follow system, push notifications, and file uploads."

## Clarifications

### Session 2026-03-03

- Q: Do episodes go through lifecycle states (draft → published) or are they published immediately upon creation? → A: No drafts — episodes are published immediately upon creation.
- Q: Where are refresh tokens stored and how are they managed? → A: Stored in the database per user, enabling revocation, forced logout, and session control.
- Q: Can creators edit or delete their own podcasts and episodes after publication? → A: Yes. Creators can both edit and delete their own podcasts and episodes.
- Q: How are admin accounts created? → A: First admin seeded via environment variables/DB seed; additional admins created only by existing admins via API.
- Q: Can unauthenticated users browse podcasts and episodes? → A: Yes. Browsing (list/view podcasts, episodes, creator profiles) is public. Engagement actions (like, comment, follow) require authentication.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration & Authentication (Priority: P1)

A new user arrives at the Rawy platform and creates an account using their email and password. They receive a JWT access token and refresh token upon successful registration. Alternatively, they can sign up or log in using their Google or Facebook account. Returning users log in with their credentials and receive fresh tokens. When their access token expires, the system seamlessly issues a new one using the refresh token.

**Why this priority**: Authentication is the foundational gate for all other features. Without it, no other user story can function. Every action in the platform requires an authenticated identity.

**Independent Test**: Can be fully tested by registering a new user, logging in, verifying token issuance, refreshing tokens, and confirming OAuth flows work — all without any other features.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they register with a valid email and password, **Then** they receive an access token, refresh token, and their account is created with the "USER" role.
2. **Given** a registered user, **When** they log in with correct credentials, **Then** they receive valid access and refresh tokens.
3. **Given** a registered user, **When** they log in with incorrect credentials, **Then** they receive a clear error message and no tokens are issued.
4. **Given** an expired access token, **When** the user presents a valid refresh token, **Then** a new access token is issued without requiring re-login.
5. **Given** a new visitor, **When** they authenticate via Google OAuth, **Then** an account is created (or linked if email exists) and tokens are issued.
6. **Given** a new visitor, **When** they authenticate via Facebook OAuth, **Then** an account is created (or linked if email exists) and tokens are issued.
7. **Given** a registration attempt, **When** the email is already in use, **Then** the system rejects the registration with a descriptive error.
8. **Given** an unauthenticated visitor, **When** they browse podcast listings, episode details, or creator profiles, **Then** the system returns the content without requiring login.
9. **Given** an unauthenticated visitor, **When** they attempt to like, comment, or follow, **Then** the system returns an authentication-required error.

---

### User Story 2 - Podcast & Episode Management by Creators (Priority: P1)

A user who has been elevated to the "CREATOR" role can create podcasts with a title, description, and cover image. Within each podcast, the creator uploads episodes that include a title, description, and audio file. The system stores uploaded audio and image files locally. Upon episode publication, the system automatically notifies all followers of the creator.

**Why this priority**: This is the core value proposition of the platform — without podcasts and episodes, there is no content and no reason for users to exist. It is co-equal with authentication as the most critical feature.

**Independent Test**: Can be fully tested by having a creator create a podcast, upload an episode with an audio file and cover image, and verifying the content is persisted and retrievable.

**Acceptance Scenarios**:

1. **Given** an authenticated creator, **When** they submit a new podcast with a title, description, and cover image, **Then** the podcast is created and associated with their creator profile.
2. **Given** an authenticated creator with an existing podcast, **When** they upload a new episode with title, description, and audio file, **Then** the episode is saved, the audio file is stored locally, and the episode appears under the podcast.
3. **Given** a non-creator user, **When** they attempt to create a podcast, **Then** the system denies the action with an authorization error.
4. **Given** a creator uploading an episode, **When** the audio file exceeds the maximum allowed size, **Then** the upload is rejected with a clear error message.
5. **Given** a creator, **When** they create a new episode, **Then** the system sends a push notification to all followers of that creator.
6. **Given** any authenticated user, **When** they request podcast or episode details, **Then** the system returns the full metadata including file URLs.
7. **Given** an authenticated creator, **When** they edit a podcast's title, description, or cover image, **Then** the changes are persisted and reflected immediately.
8. **Given** an authenticated creator, **When** they edit an episode's title or description, **Then** the changes are persisted and reflected immediately.
9. **Given** an authenticated creator, **When** they delete a podcast, **Then** the podcast and all its episodes are removed and no longer accessible.
10. **Given** an authenticated creator, **When** they delete an episode, **Then** the episode is removed and the associated likes, comments, and views are cleaned up.

---

### User Story 3 - Creator Profile & Role Elevation (Priority: P2)

A regular user decides they want to share their own content. They request to become a creator, and the system elevates their role. A creator profile is generated with public-facing information (bio, avatar, social links). Other users can browse and view creator profiles.

**Why this priority**: Creator profiles are essential for content discoverability and building a community around creators, but they depend on authentication being in place first.

**Independent Test**: Can be tested by having a user request role elevation, verifying the creator profile is created, and confirming other users can view the public profile.

**Acceptance Scenarios**:

1. **Given** an authenticated user with the "USER" role, **When** they request to become a creator, **Then** their role is updated to "CREATOR" and a creator profile is initialized.
2. **Given** an authenticated creator, **When** they update their profile (bio, avatar, social links), **Then** the changes are persisted and reflected publicly.
3. **Given** any user, **When** they view a creator's public profile, **Then** they see the creator's name, bio, avatar, podcast count, and follower count.
4. **Given** a user who is already a creator, **When** they attempt to become a creator again, **Then** the system returns an appropriate message indicating they already have the role.

---

### User Story 4 - Follow System (Priority: P2)

A user discovers a creator whose content they enjoy and follows them. The follow action is recorded, and the user will receive push notifications whenever the followed creator publishes a new episode. A user can also unfollow a creator at any time.

**Why this priority**: The follow system is the bridge between content creation and content consumption. It directly powers the notification system and creates user engagement loops.

**Independent Test**: Can be tested by having a user follow a creator, verifying the relationship is recorded, checking the follower count increments, and confirming the user can unfollow.

**Acceptance Scenarios**:

1. **Given** an authenticated user and a creator, **When** the user follows the creator, **Then** the follow relationship is recorded and the creator's follower count increases by one.
2. **Given** a user who already follows a creator, **When** the user attempts to follow the same creator again, **Then** the system prevents duplicate follows and returns an appropriate response.
3. **Given** a user who follows a creator, **When** the user unfollows the creator, **Then** the relationship is removed and the follower count decreases by one.
4. **Given** a user who follows a creator, **When** the creator publishes a new episode, **Then** the user receives a push notification about the new episode.
5. **Given** any user, **When** they view a creator's profile, **Then** they can see whether they currently follow that creator.

---

### User Story 5 - Episode Likes (Priority: P3)

A user listens to an episode they enjoy and likes it. The like is recorded (one per user per episode), and the episode's like count increments atomically. The user can also unlike an episode.

**Why this priority**: Likes are a core engagement metric but are not required for the basic podcast listening experience. They enhance social proof and help surface popular content.

**Independent Test**: Can be tested by having a user like an episode, verifying the count increments, attempting a duplicate like (rejected), and unliking.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an episode, **When** the user likes the episode, **Then** the like is recorded and the episode's like count increases by one.
2. **Given** a user who has already liked an episode, **When** they attempt to like it again, **Then** the system prevents the duplicate and returns an appropriate response.
3. **Given** a user who has liked an episode, **When** they unlike it, **Then** the like is removed and the like count decreases by one.
4. **Given** any user viewing an episode, **When** they check the episode details, **Then** they can see the total like count and whether they have liked it.

---

### User Story 6 - Episode Comments (Priority: P3)

A user wants to share their thoughts on an episode. They write a flat comment (no nested replies in MVP). Comments are associated with the episode and the commenting user. Users can view all comments on an episode.

**Why this priority**: Comments foster community discussion and engagement but are not essential for the core listening experience.

**Independent Test**: Can be tested by posting a comment on an episode, viewing all comments, and verifying the comment appears with the correct user attribution.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an episode, **When** the user posts a comment, **Then** the comment is saved and associated with both the episode and the user.
2. **Given** an episode with comments, **When** any user requests the comment list, **Then** they receive all comments with user information, ordered by creation date.
3. **Given** a user, **When** they post an empty or excessively long comment, **Then** the system rejects it with a validation error.
4. **Given** an authenticated user, **When** they delete their own comment, **Then** the comment is removed.

---

### User Story 7 - Episode Views Tracking (Priority: P3)

When a user opens or plays an episode, the system records a view. Each user can only contribute one view per episode (no duplicate counting). The total view count is displayed on the episode.

**Why this priority**: View tracking provides analytics and helps gauge content popularity, but it does not block any core user interaction.

**Independent Test**: Can be tested by having a user view an episode, verifying the count increments, and confirming a second view by the same user does not increment the count.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an episode, **When** the user views the episode for the first time, **Then** a view record is created and the episode view count increases by one.
2. **Given** a user who has already viewed an episode, **When** they view it again, **Then** the view count does not increment (duplicate prevention).
3. **Given** any user viewing episode details, **When** they check the episode, **Then** the total view count is displayed.

---

### User Story 8 - Push Notifications (Priority: P3)

When a creator publishes a new episode, all followers of that creator receive a push notification on their devices. Users can register their device tokens for push notifications. The platform uses a cloud messaging service to deliver notifications.

**Why this priority**: Notifications drive re-engagement but are an enhancement to the core experience, not a prerequisite.

**Independent Test**: Can be tested by registering a device token, having a followed creator publish an episode, and verifying the notification is dispatched.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they register a device token, **Then** the token is stored and associated with their account.
2. **Given** a user with a registered device token who follows a creator, **When** the creator publishes a new episode, **Then** the user receives a push notification with the episode title and podcast name.
3. **Given** a user with multiple devices, **When** a notification is triggered, **Then** all registered device tokens receive the notification.
4. **Given** an invalid or expired device token, **When** a notification is sent, **Then** the system handles the failure gracefully without crashing.

---

### User Story 9 - Admin Platform Management (Priority: P4)

An admin user can manage the platform by viewing all users, creators, podcasts, and episodes. Admins can deactivate users, remove inappropriate content, and oversee platform health.

**Why this priority**: Admin capabilities are important for platform governance but are not needed for the initial user-facing MVP launch.

**Independent Test**: Can be tested by logging in as an admin, listing users, deactivating a user, and removing content.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they request a list of all users, **Then** they receive a paginated list with user details and roles.
2. **Given** an authenticated admin, **When** they deactivate a user account, **Then** the user can no longer log in or interact with the platform.
3. **Given** an authenticated admin, **When** they remove a podcast or episode, **Then** the content is no longer accessible to any user.
4. **Given** a non-admin user, **When** they attempt to access admin endpoints, **Then** the system denies access with an authorization error.
5. **Given** an authenticated admin, **When** they promote a user to admin, **Then** the user's role is updated to ADMIN.
6. **Given** the system on first launch, **When** admin seed credentials are configured in environment variables, **Then** the first admin account is created automatically.

---

### Edge Cases

- What happens when a user tries to register with an already-used email? → Registration is rejected with a descriptive error.
- How does the system handle expired refresh tokens? → The stored refresh token is removed from the database and the user is required to log in again.
- Can an admin or the user themselves force-revoke a refresh token? → Yes. Deleting the stored refresh token from the database invalidates the session.
- What happens when a creator with followers deletes a podcast? → The podcast and all its episodes are removed. Associated likes, comments, and views are cleaned up. Followers are not notified of deletion in MVP.
- What happens when a file upload is interrupted midway? → The partial file is cleaned up and the user receives an error asking them to retry.
- How does the system handle a push notification failure for one device among many? → The failure is logged, and notifications to other devices continue.
- What happens when a deactivated user's access token is still valid? → The system checks the user's active status on protected routes and rejects deactivated users.
- What happens when someone tries to follow themselves (if they are a creator)? → The system prevents self-follows.
- How are file size limits enforced? → Audio files are limited to 200MB; image files are limited to 10MB. Exceeding these limits results in a validation error.
- Can a creator save an episode as a draft before publishing? → No. Episodes are published immediately upon creation; there is no draft state in the MVP.
- How is the first admin account created? → Seeded from environment variables on first launch. No public registration endpoint for admins exists.
- Can a non-admin user become an admin? → Only if promoted by an existing admin via a protected API endpoint.
- Can unauthenticated users browse content? → Yes. Podcast listings, episode details, and creator profiles are publicly accessible. Engagement actions (like, comment, follow) require authentication.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email and password, hashing passwords securely before storage.
- **FR-002**: System MUST authenticate users and issue JWT access tokens (short-lived) and refresh tokens (long-lived).
- **FR-003**: System MUST support token refresh to issue new access tokens without re-authentication. Refresh tokens MUST be stored server-side in the database, enabling revocation and forced logout.
- **FR-004**: System MUST support Google OAuth and Facebook OAuth for registration and login.
- **FR-005**: System MUST enforce role-based access control with three roles: USER, CREATOR, and ADMIN.
- **FR-006**: System MUST allow a USER to upgrade their role to CREATOR, creating an associated creator profile.
- **FR-007**: System MUST allow creators to create podcasts with a title, description, and cover image.
- **FR-008**: System MUST allow creators to upload episodes under their podcasts, including title, description, and audio file.
- **FR-009**: System MUST store uploaded audio files and images on the local filesystem in organized directories.
- **FR-010**: System MUST allow users to follow and unfollow creators, enforcing uniqueness of the follow relationship.
- **FR-011**: System MUST allow users to like and unlike episodes, enforcing one like per user per episode and updating like counts atomically.
- **FR-012**: System MUST allow users to post flat comments on episodes and view all comments on an episode.
- **FR-013**: System MUST track episode views per user, preventing duplicate view counts from the same user.
- **FR-014**: System MUST send push notifications to all followers when a creator publishes a new episode.
- **FR-015**: System MUST allow users to register device tokens for receiving push notifications.
- **FR-016**: System MUST provide admin endpoints for listing, deactivating, and managing users, podcasts, and episodes.
- **FR-017**: System MUST provide complete API documentation accessible via a documentation interface.
- **FR-018**: System MUST validate all incoming data using DTO validation before processing.
- **FR-019**: System MUST enforce unique email constraints at the data layer.
- **FR-020**: System MUST enforce file size limits on uploads (200MB for audio, 10MB for images).
- **FR-021**: System MUST handle errors gracefully, returning meaningful error messages with appropriate status codes.
- **FR-022**: System MUST support pagination for list endpoints (users, podcasts, episodes, comments).
- **FR-023**: System MUST prevent deactivated users from accessing protected resources.
- **FR-024**: System MUST allow creators to edit their own podcasts (title, description, cover image) and episodes (title, description).
- **FR-025**: System MUST allow creators to delete their own podcasts (cascading to all episodes) and individual episodes (cleaning up associated likes, comments, and views).
- **FR-026**: System MUST seed the first admin account from environment variables on initial launch. Additional admins MUST only be created by existing admins via a protected endpoint.
- **FR-027**: System MUST allow unauthenticated access to browse podcasts, episodes, and creator profiles. Engagement actions (liking, commenting, following) MUST require authentication.

### Key Entities *(include if feature involves data)*

- **User**: Represents any person on the platform. Key attributes: name, email, password hash, role (USER/CREATOR/ADMIN), device tokens, active status, OAuth identifiers, stored refresh token(s). A user is uniquely identified by email.
- **CreatorProfile**: Extends a user with public creator information. Key attributes: bio, avatar image, social links, follower count, podcast count. One-to-one relationship with User.
- **Podcast**: A content container created by a creator. Key attributes: title, description, cover image, associated creator. A podcast belongs to one creator; a creator can have many podcasts.
- **Episode**: An individual audio content item within a podcast. Key attributes: title, description, audio file reference, duration, view count, like count, creation timestamp. An episode belongs to one podcast. Episodes have no draft state — they are immediately visible and trigger follower notifications upon creation.
- **Comment**: A text response from a user on an episode. Key attributes: text content, author, associated episode, creation timestamp. Flat structure (no nesting).
- **Like**: A record of a user liking an episode. Uniquely constrained by the combination of user and episode.
- **Follow**: A record of a user following a creator. Uniquely constrained by the combination of follower and creator.
- **View**: A record of a user viewing an episode. Uniquely constrained by the combination of user and episode.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration (email/password or OAuth) and receive authentication tokens in under 5 seconds.
- **SC-002**: Creators can create a podcast and upload an episode (including a 50MB audio file) in under 30 seconds.
- **SC-003**: All followers of a creator receive push notifications within 60 seconds of a new episode being published.
- **SC-004**: The system correctly prevents 100% of duplicate likes, follows, and views per the uniqueness constraints.
- **SC-005**: All API endpoints return appropriate error responses (with descriptive messages) for invalid inputs, rather than generic server errors.
- **SC-006**: Admin users can retrieve a paginated list of all platform users within 3 seconds.
- **SC-007**: Episode like counts and view counts update atomically and remain consistent under concurrent access.
- **SC-008**: 100% of API endpoints are documented and accessible through the API documentation interface.
- **SC-009**: Authentication token refresh works seamlessly — users are never forced to re-login while holding a valid refresh token.
- **SC-010**: File uploads are validated before storage — oversized files are rejected immediately without consuming server resources.

## Assumptions

- **A-001**: The platform is a single-service monolith (not microservices) for the MVP.
- **A-002**: Audio files are stored on the local filesystem (no cloud storage in MVP). The `/uploads` directory is organized into `/uploads/audio` and `/uploads/images`.
- **A-003**: Firebase Admin SDK is used for push notifications. A Firebase project and service account credentials are available.
- **A-004**: Google and Facebook OAuth client credentials are available and configured.
- **A-005**: MongoDB is the sole database. No Redis, Elasticsearch, or other data stores are used in MVP.
- **A-006**: The system does not implement monetization, advertisements, live streaming, or content recommendations.
- **A-007**: Role elevation from USER to CREATOR is self-service (no admin approval required in MVP).
- **A-008**: Comments are flat only — no nested replies, no threading.
- **A-009**: Pagination defaults to 20 items per page unless specified otherwise.
- **A-010**: Audio file maximum size is 200MB; image file maximum size is 10MB.
- **A-011**: Environment variables are used for all secrets and configuration values (database URI, JWT secrets, OAuth credentials, Firebase config).
- **A-012**: The API follows RESTful conventions (not GraphQL).
- **A-013**: The first admin account is seeded from environment variables (admin email and password) on application startup if no admin exists.

## Out of Scope

- Monetization and payment processing
- Advertisements and ad insertion
- Live streaming / real-time audio
- Search engine (Elasticsearch)
- Caching layer (Redis)
- Content recommendation engine
- Microservices architecture
- Email verification flow (can be added post-MVP)
- Password reset flow (can be added post-MVP)
- Nested/threaded comments
- Content moderation AI
- Analytics dashboards
- Rate limiting (can be added post-MVP)
