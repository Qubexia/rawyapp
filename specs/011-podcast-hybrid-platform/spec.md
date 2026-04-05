# Feature Specification: Rawy Hybrid Podcast Platform

**Feature Branch**: `011-podcast-hybrid-platform`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Hybrid podcast platform supporting both external RSS feeds and internal hosted content with role-based access control for creators"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standard Listener Sign Up and Podcast Discovery (Priority: P1)

As a new user, I want to sign up through a single onboarding screen and start discovering podcasts immediately, so that I can begin listening to content within minutes of downloading the app.

**Why this priority**: This is the foundational flow - without it, no users can access the platform. Every user starts as a listener.

**Independent Test**: Can be fully tested by creating a new account, logging in, and browsing the podcast discovery feed without any additional setup.

**Acceptance Scenarios**:

1. **Given** I am a new user with no account, **When** I complete the signup flow with email/password, **Then** I am logged in as a USER role and can access the Listener Dashboard.
2. **Given** I am logged in as a USER, **When** I browse the Discover section, **Then** I see the Top 100 podcasts fetched from Apple Podcasts.
3. **Given** I am logged in as a USER, **When** I subscribe to an external podcast, **Then** it appears in my Subscriptions list with auto-synced episodes.

---

### User Story 2 - Claim Your Podcast Flow (Priority: P2)

As a podcaster who already has an existing show on Apple Podcasts, I want to claim ownership of my podcast within Rawy, so that I can manage my show's presence and eventually upload exclusive content.

**Why this priority**: This is the key differentiator that enables creators to join the platform. Without this, creators cannot access creator tools.

**Independent Test**: Can be tested by searching for a podcast, requesting ownership, and verifying via email link.

**Acceptance Scenarios**:

1. **Given** I am logged in as a USER, **When** I navigate to "Claim Your Podcast" and search for my show, **Then** I see matching results from external feeds.
2. **Given** I select my podcast to claim, **When** I submit the ownership request, **Then** a verification email is sent to the registered email in the podcast RSS feed.
3. **Given** I have claimed a podcast, **When** I complete email verification, **Then** my role upgrades to CREATOR and I receive a refreshed JWT token with creator permissions.

---

### User Story 3 - Creator Dashboard Access (Priority: P2)

As a CREATOR, I want to access a dedicated dashboard to manage my podcasts and upload exclusive episodes, so that I can build my audience on the Rawy platform.

**Why this priority**: Creators need tools to upload and manage their content - this is the value proposition for content creators.

**Independent Test**: Can be tested by logging in as a CREATOR and accessing the Creator Dashboard without errors.

**Acceptance Scenarios**:

1. **Given** I am logged in with CREATOR role, **When** I access the Creator Dashboard, **Then** I see only podcasts I own (either claimed external or created internal).
2. **Given** I am a CREATOR, **When** I attempt to upload an episode to my podcast, **Then** the upload succeeds and the episode appears in the episode list.
3. **Given** I am a CREATOR, **When** I try to upload to a podcast I do not own, **Then** the system denies access with an error message.

---

### User Story 4 - External Podcast Auto-Sync (Priority: P2)

As a listener, I want my subscribed podcasts to automatically update with new episodes, so that I never miss new content from shows I follow.

**Why this priority**: This is core podcatcher functionality - listeners expect automatic episode updates.

**Independent Test**: Can be tested by subscribing to an external podcast and verifying new episodes appear in the feed after the sync job runs.

**Acceptance Scenarios**:

1. **Given** I am subscribed to an external podcast with autoSync enabled, **When** new episodes are published in the RSS feed, **Then** they appear in my subscription feed within the sync cycle.
2. **Given** I am subscribed to an external podcast, **When** I toggle autoSync to OFF, **Then** no new external episodes are fetched for my subscription.
3. **Given** a new external episode exists, **When** the sync job runs, **Then** it does NOT create a duplicate if a similar internal episode was uploaded by the creator in the same week.

---

### User Story 5 - Internal Podcast Hosting (Priority: P3)

As a CREATOR, I want to create internally-hosted podcasts that live exclusively on Rawy, so that I can offer exclusive content that can't be found elsewhere.

**Why this priority**: Internal hosting is the "hosting platform" half of the hybrid model - differentiates Rawy from other podcatchers.

**Independent Test**: Can be tested by creating a new internal podcast and uploading an episode that doesn't exist in any external RSS feed.

**Acceptance Scenarios**:

1. **Given** I am a CREATOR, **When** I create a new internal podcast, **Then** it is created with source='internal' and ownerId pointing to my user account.
2. **Given** I have an internal podcast, **When** I upload an episode with audio file, **Then** the audio is stored locally and the episode appears with audioStoragePath set.
3. **Given** I have an internal podcast, **When** the external sync job runs, **Then** it ignores my internal podcast entirely (data fencing).

---

### Edge Cases

- What happens when a user tries to claim a podcast that is already claimed by another user?
- How does the system handle RSS feeds that are unavailable or return errors during sync?
- What occurs when a creator deletes their account - do their podcasts get transferred or deleted?
- How does the system handle duplicate episode detection when episode titles have minor variations?
- What happens if the Apple Podcasts API is unavailable during the Top 100 fetch?
- How does the system handle users who lose email access after claiming a podcast?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow all users to sign up through a single unified onboarding screen, assigning the USER role by default.
- **FR-002**: System MUST provide a "Claim Your Podcast" search interface that queries external podcast feeds.
- **FR-003**: System MUST send a verification email to the address found in the podcast RSS feed when a claim is requested.
- **FR-004**: System MUST upgrade a user's role from USER to CREATOR upon successful podcast claim verification.
- **FR-005**: System MUST issue a refreshed JWT token with updated role claims after successful role upgrade.
- **FR-006**: System MUST allow CREATOR role users to access the Creator Dashboard with podcast management capabilities.
- **FR-007**: System MUST enforce resource-based authorization ensuring users can only modify podcasts they own.
- **FR-008**: System MUST automatically sync external podcast episodes on a scheduled interval.
- **FR-009**: System MUST support two podcast sources: 'external' (RSS-fed) and 'internal' (Rawy-hosted).
- **FR-010**: System MUST allow users to toggle autoSync on/off for their external podcast subscriptions.
- **FR-011**: System MUST implement deduplication logic using title similarity (80% fuzzy match) + same week pubDate to prevent duplicate episodes when internal and external episodes have similar titles within the same week.
- **FR-012**: System MUST fetch the Top 100 podcasts from the Apple Podcasts API for the Discover section.
- **FR-013**: System MUST parse RSS XML feeds to extract episode metadata for external podcasts.
- **FR-014**: System MUST NOT sync or update internal podcasts during external sync jobs (data fencing).

### Key Entities *(include if data involved)*

- **User**: Platform user with dynamic role (USER, CREATOR, ADMIN). Contains authentication credentials, role enum, and timestamps.
- **Podcast**: Podcast show entity with source type, owner reference, RSS feed URL, and sync preferences.
- **Episode**: Individual audio content item with source type, publishing date, GUID for external tracking, and storage path for internal content.
- **ClaimRequest**: Pending ownership verification requests linking users to podcasts awaiting email confirmation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account creation in under 2 minutes and be browsing podcasts immediately after.
- **SC-002**: Podcast claim requests are verified via email within 24 hours of submission.
- **SC-003**: 95% of external podcast subscriptions show new episodes within 24 hours of the RSS feed being updated.
- **SC-004**: Zero duplicate episodes appear in creator's podcast when internal and external episodes share similar titles in the same week.
- **SC-005**: Internal podcasts remain unaffected by external sync jobs - no data from internal podcasts is ever modified by external sync processes.
- **SC-006**: Creators can successfully upload and publish internal episodes that are playable within the app.
- **SC-007**: Users attempting to modify podcasts they do not own receive immediate authorization errors.
- **SC-008**: Page loads complete in under 3 seconds for 95% of user requests.
- **SC-009**: System maintains 99.9% uptime availability.
- **SC-010**: System supports 10,000 concurrent users without performance degradation.

## Assumptions

- Users have valid email addresses for account creation and verification.
- External RSS feeds are publicly accessible without authentication.
- Apple Podcasts API remains available and returns consistent JSON structure.
- Mobile app can handle JWT token refresh without forcing re-login.
- Audio file storage has sufficient capacity for internal podcast hosting.
- Users understand the difference between external (synced) and internal (exclusive) podcasts.
- Email delivery infrastructure is configured and functional for verification emails.

## Clarifications

### Session 2026-04-04

- Q: Non-functional requirements (performance, scalability, availability targets) → A: Web app standard: 3s page load, 99.9% uptime, 10k concurrent users
- Q: Episode deduplication identity rules → A: Title similarity (80% fuzzy match) + same week pubDate
