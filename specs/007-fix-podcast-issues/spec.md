# Feature Specification: Fix Podcast Cover Image, Google Auth, and Admin Display Issues

**Feature Branch**: `007-fix-podcast-issues`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "I need you to fix these issues: The podcast cover image isn't showing up in its card; the Explore page and library are being improved; Google Auth integration issues are being fixed; and admin accounts are being removed from the "Who to Follow" section."

## User Scenarios & Testing

### User Story 1 - Podcast Cover Images Display Correctly (Priority: P1)

As a user browsing podcasts, I want to see podcast cover images in their cards so that I can visually identify podcasts.

**Why this priority**: Visual identification of podcasts is critical for user experience. Missing images make the interface unusable and confusing.

**Independent Test**: Can be tested by viewing podcast cards in any section (Home, Explore, Library) and verifying cover images load and display.

**Acceptance Scenarios**:

1. **Given** a podcast has a cover image assigned, **When** the podcast card is rendered, **Then** the cover image displays correctly without broken image icons
2. **Given** a podcast card is displayed, **When** the page loads, **Then** the cover image loads within 3 seconds on standard connection
3. **Given** multiple podcasts are displayed in a grid, **When** scrolling through them, **Then** each podcast shows its own unique cover image

---

### User Story 2 - Explore Page and Library Display Properly (Priority: P2)

As a user, I want the Explore page and Library to display content properly with good layout and navigation so that I can discover and access podcasts easily.

**Why this priority**: Explore and Library are primary discovery and access points. Poor display directly impacts user engagement and podcast consumption.

**Independent Test**: Can be tested by navigating to Explore and Library pages and verifying content displays correctly across different screen sizes.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Explore page, **When** content loads, **Then** podcasts display in a clean, scannable layout with proper spacing
2. **Given** the user navigates to their Library, **When** content loads, **Then** subscribed podcasts display with correct information and images
3. **Given** the user browses Explore or Library on mobile, **When** viewing, **Then** content adapts properly to mobile screen sizes

---

### User Story 3 - Google Auth Login Works Correctly (Priority: P2)

As a user, I want to log in with my Google account so that I can access the application quickly without creating a new password.

**Why this priority**: Google Auth is a primary authentication method. Issues with this prevent users from accessing their accounts.

**Independent Test**: Can be tested by attempting Google Sign-In and verifying successful authentication flow.

**Acceptance Scenarios**:

1. **Given** a user clicks "Sign in with Google", **When** they complete the Google authentication flow, **Then** they are redirected to the app as an authenticated user
2. **Given** an authenticated Google user returns to the app, **When** they log in again, **Then** they are recognized and authenticated without re-entering credentials
3. **Given** a user experiences an error during Google Auth, **When** the error occurs, **Then** they see a clear error message with option to retry

---

### User Story 4 - Admin Accounts Excluded from "Who to Follow" (Priority: P1)

As a user, I want to see only regular user accounts in the "Who to Follow" section so that I can follow actual community members rather than administrators.

**Why this priority**: Following administrators adds no value and could be confusing. Administrators should not appear in recommendation sections.

**Independent Test**: Can be tested by checking the "Who to Follow" section and verifying no admin accounts appear in the recommendations.

**Acceptance Scenarios**:

1. **Given** the "Who to Follow" section is displayed, **When** it loads, **Then** no accounts with admin privileges are included in recommendations
2. **Given** a user follows an admin account, **When** they view Who to Follow, **Then** that admin is not re-recommended
3. **Given** an admin account exists in the system, **When** recommendations are generated, **Then** they are filtered out before display

---

### Edge Cases

- What happens when a podcast has no cover image assigned?
- How does the system handle Google Auth token expiration during a session?
- What display when all potential "Who to Follow" recommendations are admin accounts?
- How does the Explore page handle empty content states?

## Requirements

### Functional Requirements

- **FR-001**: System MUST display podcast cover images correctly in all podcast cards across the application
- **FR-002**: System MUST load podcast cover images within 3 seconds on standard network connections
- **FR-003**: System MUST render Explore page with proper layout, spacing, and content organization
- **FR-004**: System MUST render Library page with proper layout displaying subscribed podcasts
- **FR-005**: System MUST support responsive display of Explore and Library on mobile devices
- **FR-006**: System MUST complete Google Auth sign-in flow without errors
- **FR-007**: System MUST recognize returning Google-authenticated users without re-authentication
- **FR-008**: System MUST display clear error messages when Google Auth fails
- **FR-009**: System MUST exclude admin accounts from "Who to Follow" recommendations
- **FR-010**: System MUST handle edge cases gracefully (missing images, empty states, auth failures)

### Key Entities

- **Podcast**: Represents a podcast show with title, description, cover image, and episodes
- **User Account**: Represents user profile with authentication method and role (admin vs regular)
- **Cover Image**: Visual representation associated with podcasts
- **Who to Follow**: Recommendation section showing suggested users to follow

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of podcast cards display their cover images correctly without broken image icons
- **SC-002**: Users can view Explore and Library pages with proper content layout and no visual glitches
- **SC-003**: Google Auth login succeeds for 95% of attempted sign-ins under normal conditions
- **SC-004**: Zero admin accounts appear in the "Who to Follow" section
- **SC-005**: 90% of users successfully complete their primary task (browsing, logging in, following users) on first attempt

## Assumptions

- Podcast cover images are uploaded and stored correctly in the system
- The existing Google Auth integration uses standard OAuth2 flow
- User roles (admin vs regular) are properly distinguished in the system
- Explore and Library pages exist and have baseline functionality that can be improved
- The "Who to Follow" section uses a recommendation algorithm that can filter by role
