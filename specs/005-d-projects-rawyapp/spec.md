# Feature Specification: Admin Dashboard

**Feature Branch**: `005-d-projects-rawyapp`  
**Created**: March 30, 2026  
**Status**: Draft  
**Input**: User description: "Implement an Admin Dashboard to provide complete control over the existing NestJS backend. The dashboard will interface with the existing admin module (/admin endpoints) which already provides user management, content moderation, and platform statistics capabilities."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard Overview (Priority: P1)

As an admin, I want to see a summary of platform statistics so that I can quickly understand the current state of the system.

**Why this priority**: The dashboard home is the entry point for all admin operations. Admins need immediate visibility into platform health before taking any action.

**Independent Test**: Can be tested by loading the dashboard page and verifying all stat cards display correct numbers.

**Acceptance Scenarios**:

1. **Given** the admin is authenticated, **When** they access the dashboard home, **Then** they should see total counts for users, creators, podcasts, and episodes
2. **Given** the admin is authenticated, **When** they access the dashboard home, **Then** they should see recent activity feed
3. **Given** the admin is authenticated, **When** they access the dashboard home, **Then** they should see quick action buttons for common tasks

---

### User Story 2 - User Management (Priority: P1)

As an admin, I want to view and manage user accounts so that I can maintain platform user base.

**Why this priority**: User management is a core admin responsibility. Admins must be able to view, edit, activate, deactivate, and delete user accounts.

**Independent Test**: Can be fully tested by creating test users and performing all management operations.

**Acceptance Scenarios**:

1. **Given** users exist in the system, **When** admin navigates to users page, **Then** they should see a paginated list of users with name, email, role, and status
2. **Given** admin searches for a user, **When** they enter search criteria, **Then** the results should filter accordingly
3. **Given** admin selects a user, **When** they choose to edit, **Then** they should be able to update name and avatar
4. **Given** admin selects an inactive user, **When** they choose to activate, **Then** the user status should change to active
5. **Given** admin selects an active user, **When** they choose to deactivate, **Then** the user status should change to inactive
6. **Given** admin selects a user, **When** they choose to promote, **Then** the user role should change to CREATOR or ADMIN
7. **Given** admin selects a user, **When** they choose to delete, **Then** the user and all related data should be removed

---

### User Story 3 - Creator Management (Priority: P1)

As an admin, I want to manage creator accounts so that I can oversee the creator ecosystem.

**Why this priority**: Creators are key stakeholders. Admins need ability to view creator profiles and remove creator status when needed.

**Independent Test**: Can be tested by accessing the creators page and performing management operations.

**Acceptance Scenarios**:

1. **Given** creators exist in the system, **When** admin navigates to creators page, **Then** they should see a paginated list with name, showName, podcast count, and follower count
2. **Given** admin clicks on a creator, **When** they view the profile, **Then** they should see full creator details
3. **Given** admin selects a creator, **When** they choose to edit, **Then** they should be able to update showName, bio, and avatar
4. **Given** admin selects a creator, **When** they choose to remove status, **Then** the user should be downgraded to regular user

---

### User Story 4 - Podcast Management (Priority: P2)

As an admin, I want to manage podcasts so that I can ensure content quality and organization.

**Why this priority**: Podcasts are the primary content unit. Admins need ability to view, edit, and remove podcasts.

**Independent Test**: Can be tested by accessing podcasts page and performing all operations.

**Acceptance Scenarios**:

1. **Given** podcasts exist in the system, **When** admin navigates to podcasts page, **Then** they should see a paginated list with title, creator, category, episode count
2. **Given** admin filters by category, **Then** only podcasts in that category should appear
3. **Given** admin selects a podcast, **When** they choose to edit, **Then** they should be able to update title, description, category, and cover
4. **Given** admin selects a podcast, **When** they choose to delete, **Then** the podcast and all episodes should be removed

---

### User Story 5 - Episode Management (Priority: P2)

As an admin, I want to manage episodes so that I can oversee content distribution.

**Why this priority**: Episodes are the core content items. Admins need ability to view, edit, and remove episodes.

**Independent Test**: Can be tested by accessing episodes page and performing operations.

**Acceptance Scenarios**:

1. **Given** episodes exist in the system, **When** admin navigates to episodes page, **Then** they should see a paginated list with title, podcast, creator, views, likes
2. **Given** admin filters by podcast, **Then** only episodes from that podcast should appear
3. **Given** admin selects an episode, **When** they choose to edit, **Then** they should be able to update title, description, and image
4. **Given** admin selects an episode, **When** they choose to delete, **Then** the episode should be removed

---

### User Story 6 - Comment Moderation (Priority: P2)

As an admin, I want to moderate comments so that I can maintain community standards.

**Why this priority**: Comments require oversight to prevent abuse. Admins need ability to view and remove inappropriate comments.

**Independent Test**: Can be tested by accessing comments page and performing delete operations.

**Acceptance Scenarios**:

1. **Given** comments exist in the system, **When** admin navigates to comments page, **Then** they should see a paginated list with text preview, episode, user, date
2. **Given** admin clicks on a comment, **Then** they should see the full text
3. **Given** admin selects a comment, **When** they choose to delete, **Then** the comment should be removed

---

### User Story 7 - Analytics View (Priority: P2)

As an admin, I want to view platform analytics so that I can understand content performance.

**Why this priority**: Analytics help admins understand platform trends and make informed decisions.

**Independent Test**: Can be tested by accessing analytics page and verifying data displays.

**Acceptance Scenarios**:

1. **Given** admin navigates to analytics, **When** they view the overview tab, **Then** they should see platform statistics and growth trends
2. **Given** admin views the episodes tab, **Then** they should see top episodes by views and likes
3. **Given** admin views the creators tab, **Then** they should see top creators by followers

---

### User Story 8 - Notification Broadcast (Priority: P3)

As an admin, I want to send broadcast notifications so that I can communicate with users.

**Why this priority**: Admins need a way to send announcements to all users or specific roles.

**Independent Test**: Can be tested by composing and sending a broadcast notification.

**Acceptance Scenarios**:

1. **Given** admin navigates to notifications, **When** they compose a message, **Then** they should be able to enter title and body
2. **Given** admin sends a broadcast, **When** they select target audience (all or specific role), **Then** the notification should be sent to all matching users
3. **Given** admin has sent broadcasts, **When** they view the history, **Then** they should see a list of past broadcasts

---

### User Story 9 - System Health (Priority: P3)

As an admin, I want to view system health so that I can monitor backend status.

**Why this priority**: Admins need visibility into system status to troubleshoot issues.

**Independent Test**: Can be tested by accessing system page and verifying health data displays.

**Acceptance Scenarios**:

1. **Given** admin navigates to system settings, **When** they view health status, **Then** they should see backend health indicator
2. **Given** admin views configuration, **Then** they should see non-sensitive system configuration

---

### Edge Cases

- What happens when the admin tries to delete a user with active podcasts? (cascade delete)
- How does the system handle a user who is both a creator and has followers? (preserve follower data on demotion)
- What happens when the admin tries to edit a podcast that no longer exists? (show error)
- How does the system handle very large datasets in tables? (pagination with reasonable page size)
- What happens when the admin loses session during an operation? (session timeout handling)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST provide an overview page showing platform statistics including total users, creators, podcasts, and episodes
- **FR-002**: The dashboard MUST allow admins to list, search, filter, and paginate users
- **FR-003**: The dashboard MUST allow admins to view user details and edit basic information (name, avatar, location)
- **FR-004**: The dashboard MUST allow admins to activate and deactivate user accounts
- **FR-005**: The dashboard MUST allow admins to promote users to CREATOR or ADMIN roles
- **FR-006**: The dashboard MUST allow admins to delete user accounts with cascade deletion of related data
- **FR-007**: The dashboard MUST allow admins to list, search, and paginate creators
- **FR-008**: The dashboard MUST allow admins to view creator profiles and edit showName, bio, avatar
- **FR-009**: The dashboard MUST allow admins to remove creator status from users
- **FR-010**: The dashboard MUST allow admins to list, search, filter by category, and paginate podcasts
- **FR-011**: The dashboard MUST allow admins to view podcast details including episode count
- **FR-012**: The dashboard MUST allow admins to edit podcast title, description, category, and cover
- **FR-013**: The dashboard MUST allow admins to delete podcasts with cascade deletion of episodes
- **FR-014**: The dashboard MUST allow admins to list, filter by podcast/creator, and paginate episodes
- **FR-015**: The dashboard MUST allow admins to view episode details
- **FR-016**: The dashboard MUST allow admins to edit episode title, description, and image
- **FR-017**: The dashboard MUST allow admins to delete episodes
- **FR-018**: The dashboard MUST allow admins to list, filter by episode, and paginate comments
- **FR-019**: The dashboard MUST allow admins to view full comment text
- **FR-020**: The dashboard MUST allow admins to delete comments
- **FR-021**: The dashboard MUST allow admins to view platform analytics overview with statistics
- **FR-022**: The dashboard MUST allow admins to view top episodes by views and likes
- **FR-023**: The dashboard MUST allow admins to view top creators by followers
- **FR-024**: The dashboard MUST allow admins to broadcast notifications to all users
- **FR-025**: The dashboard MUST allow admins to broadcast notifications to specific roles
- **FR-026**: The dashboard MUST allow admins to view broadcast notification history
- **FR-027**: The dashboard MUST display system health status
- **FR-028**: The dashboard MUST display non-sensitive system configuration
- **FR-029**: The dashboard MUST require ADMIN role for access to all pages
- **FR-030**: The dashboard MUST provide search functionality across user, podcast, and episode listings
- **FR-031**: The dashboard MUST provide filtering capabilities on list pages
- **FR-032**: The dashboard MUST display appropriate loading states (skeleton loaders) while fetching data
- **FR-033**: The dashboard MUST display contextual empty state messages when no data is available
- **FR-034**: The dashboard MUST display error notifications with retry options when data fetch fails
- **FR-035**: The dashboard MUST allow admins to select multiple items in list pages
- **FR-036**: The dashboard MUST allow admins to perform bulk operations (deactivate, delete) on selected items
- **FR-037**: Broadcast notifications MUST be delivered as in-app notifications visible in user's notification center
- **FR-038**: The dashboard MUST require confirmation dialog with warning message before executing any delete operation
- **FR-039**: The dashboard MUST provide undo capability for accidental actions within a 5-minute window
- **FR-040**: All admin actions MUST be logged with admin ID, action type, target identifier, and timestamp

### Key Entities

- **User**: Platform user account with attributes for name, email, role, status, avatar, location
- **Creator**: Extended user with showName, bio, and creator-specific metrics
- **Podcast**: Audio show with title, description, category, cover image, creator association
- **Episode**: Audio episode with title, description, image, podcast association, view counts
- **Comment**: User-generated comment on episodes with text, author, timestamp
- **Notification**: System notification with title, body, target audience, sent timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can view dashboard overview within 2 seconds of page load
- **SC-002**: Admin can complete a user search and receive results within 1 second
- **SC-003**: All management operations (activate, deactivate, promote, delete) complete successfully with appropriate feedback
- **SC-004**: Analytics data loads and displays correctly for all three tabs (overview, episodes, creators)
- **SC-005**: Broadcast notifications are delivered to all intended recipients
- **SC-006**: System health status accurately reflects backend state
- **SC-007**: All list pages support pagination through at least 1000 records
- **SC-008**: 95% of admin actions result in successful completion with user feedback

## Assumptions

- Existing NestJS admin module endpoints will be extended rather than rebuilt
- Authentication will reuse existing JWT-based auth system
- Role-based access control already exists in the backend
- The dashboard will be accessed primarily via desktop and tablet browsers
- Mobile support is out of scope for version 1
- Audit logging for admin actions will be implemented in backend
- Data export capabilities are not required for version 1

## Clarifications

### Session 2026-03-30

- Q: How should the dashboard handle error, empty, and loading states for data tables? → A: Show skeleton loaders during loading, empty state with contextual message, error toast with retry option
- Q: Should the dashboard support bulk operations (multiple select, bulk delete, bulk deactivate)? → A: Yes, support bulk select and bulk actions on users, podcasts, and episodes list pages
- Q: How should broadcast notifications be delivered to users? → A: In-app notifications only (show in user's notification center)
- Q: Should destructive actions (delete operations) require confirmation before execution? → A: Yes, require confirmation dialog with clear warning before any delete action
- Q: Should all admin actions be logged for audit purposes? → A: Yes, log all admin actions with admin ID, action type, target, and timestamp