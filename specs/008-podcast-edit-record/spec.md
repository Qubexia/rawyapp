# Feature Specification: Podcast Edit & Record

**Feature Branch**: `008-podcast-edit-record`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "I want to add to the admin dashboard the ability to edit published podcasts and add episodes to any podcast using the same functionality as the app, including the episode title from the uploaded file.I want the ability for the creator to record an episode within our app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin edits published podcast details (Priority: P1)

An admin navigates to the podcast management section, selects a published podcast, and edits its title, description, cover image, category, or status. Changes are saved and reflected immediately across the platform.

**Why this priority**: Admins need full control over published content to correct errors, update information, or manage content quality. This is foundational content management capability.

**Independent Test**: Can be fully tested by having an admin modify a published podcast's details and verifying the changes appear correctly on the platform without requiring any other new feature.

**Acceptance Scenarios**:

1. **Given** an admin is viewing the podcast list, **When** they select a published podcast and edit its title or description, **Then** the changes are saved and visible to all users
2. **Given** an admin is editing a published podcast, **When** they update the cover image, **Then** the new image replaces the old one across all views
3. **Given** an admin is editing a published podcast, **When** they change the category or status, **Then** the podcast is reclassified or its visibility changes accordingly
4. **Given** an admin edits a podcast that has episodes, **When** the edit is saved, **Then** all existing episodes remain intact and accessible

---

### User Story 2 - Admin adds episode to any podcast via file upload (Priority: P1)

An admin selects any podcast in the system and adds a new episode by uploading an audio file. The system automatically extracts the episode title from the uploaded filename, allows the admin to edit it, and optionally attach an episode cover image. The episode is published under the selected podcast.

**Why this priority**: Admins need to manage content for any creator, including adding episodes on behalf of creators or filling content gaps. This mirrors the mobile app's upload flow for consistency.

**Independent Test**: Can be fully tested by having an admin upload an audio file to any podcast, verify the title is auto-filled from the filename, edit the title if desired, and confirm the episode appears in the podcast's episode list.

**Acceptance Scenarios**:

1. **Given** an admin selects a podcast to add an episode to, **When** they upload an audio file, **Then** the episode title is automatically populated from the filename (cleaned of extensions and special characters)
2. **Given** an admin has uploaded an audio file, **When** they edit the auto-filled title, **Then** their custom title is used instead
3. **Given** an admin is creating an episode, **When** they optionally upload a cover image, **Then** the image is attached to the episode
4. **Given** an admin completes the episode creation form, **When** they submit, **Then** the episode is added to the selected podcast and visible to listeners
5. **Given** an admin uploads an unsupported file type, **When** they attempt to upload, **Then** they receive a clear error message indicating accepted formats

---

### User Story 3 - Creator records audio episode directly in the app (Priority: P2)

A creator opens the episode creation flow in the mobile app and chooses to record audio directly instead of uploading a file. They can start, pause, resume, and stop recording. After recording, they preview the audio, then proceed to fill in episode details (title, description, podcast selection, optional image) before publishing.

**Why this priority**: Enables creators to produce content without external recording tools, lowering the barrier to content creation and enabling spontaneous recording.

**Independent Test**: Can be fully tested by having a creator record audio in the app, preview it, fill in episode details, and submit — verifying the recorded audio is uploaded and the episode is created successfully.

**Acceptance Scenarios**:

1. **Given** a creator is on the episode creation screen, **When** they select the record option, **Then** the recording interface opens with start, pause, and stop controls
2. **Given** a creator is recording, **When** they pause and resume, **Then** the recording continues seamlessly with accurate duration tracking
3. **Given** a creator stops a recording, **When** they preview the audio, **Then** they can listen to the full recording before proceeding
4. **Given** a creator is satisfied with their recording, **When** they proceed to episode details, **Then** the title field is pre-filled with a default name (e.g., "Recording [date/time]") and they can edit all fields
5. **Given** a creator is not satisfied with their recording, **When** they choose to discard, **Then** they can re-record without creating an episode
6. **Given** a creator submits an episode with a recording, **When** the upload completes, **Then** the episode appears in their podcast's episode list

---

### User Story 4 - Creator edits their published podcast (Priority: P3)

A creator navigates to their published podcast and edits its details (title, description, cover image). Changes are saved and reflected across the platform.

**Why this priority**: Creators need to maintain and update their own podcasts. This may already exist partially but needs to be confirmed and ensured for published podcasts.

**Independent Test**: Can be fully tested by having a creator modify their published podcast's details and verifying changes propagate correctly.

**Acceptance Scenarios**:

1. **Given** a creator views their published podcast, **When** they edit the title or description, **Then** changes are saved and visible to listeners
2. **Given** a creator edits their podcast cover image, **When** they save, **Then** the new image appears across all views

---

### Edge Cases

- What happens when an admin uploads an audio file larger than the maximum allowed size (500MB)?
- How does the system handle recording interruptions (incoming call, app backgrounded, low storage) during creator recording?
- What happens when a creator discards a recording after spending significant time on it — is there a confirmation prompt?
- How does the system handle filename extraction when the filename is empty, contains only special characters, or is in a non-Latin script?
- What happens if the admin tries to add an episode to a podcast that has been deleted or is in draft status?
- How does the recording interface handle devices without a microphone or with microphone permission denied?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to edit all editable fields (title, description, cover image, category, status) of any published podcast
- **FR-002**: System MUST allow admins to add episodes to any podcast in the system, regardless of the podcast's original creator
- **FR-003**: System MUST auto-populate the episode title from the uploaded audio filename, cleaned of file extensions and common special characters
- **FR-004**: System MUST allow admins to edit the auto-populated episode title before submission
- **FR-005**: System MUST support audio file uploads for episode creation in the admin dashboard with the same file type validation as the mobile app (MP3, M4A, WAV, AAC, OGG, FLAC)
- **FR-006**: System MUST allow admins to optionally upload a cover image when creating an episode
- **FR-007**: System MUST provide creators with an in-app audio recording interface within the episode creation flow
- **FR-008**: System MUST support start, pause, resume, and stop controls during audio recording
- **FR-009**: System MUST allow creators to preview their recording before proceeding to episode details
- **FR-010**: System MUST allow creators to discard a recording and re-record without creating an episode
- **FR-011**: System MUST pre-fill the episode title with a default value (e.g., "Recording [date/time]") after recording completes
- **FR-012**: System MUST allow creators to edit all episode details (title, description, podcast selection, cover image) after recording
- **FR-013**: System MUST upload the recorded audio file to the server and create the episode with the same data structure as file-based uploads
- **FR-014**: System MUST display recording duration in real-time during the recording session
- **FR-015**: System MUST handle recording interruptions gracefully (app backgrounded, phone call, low storage) by either auto-saving or prompting the user
- **FR-016**: System MUST validate audio file size limits (max 500MB) for both uploaded and recorded files
- **FR-017**: System MUST request and handle microphone permissions before starting recording, with clear messaging if permission is denied
- **FR-018**: System MUST preserve all existing episodes when a podcast is edited by an admin
- **FR-019**: System MUST show upload progress indicators for both file uploads and recorded audio uploads
- **FR-020**: System MUST allow creators to edit their own published podcasts (title, description, cover image)

### Key Entities

- **Podcast**: Existing entity. Admin edit capability extends to all fields including status and category for published podcasts.
- **Episode**: Existing entity. New creation paths added: admin file upload and creator in-app recording. Both produce the same episode data structure.
- **Audio Recording**: New transient entity representing an in-progress or completed recording session before episode submission. Contains: audio data blob, duration, recording state (recording/paused/stopped), timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can edit a published podcast's details and see changes reflected within 5 seconds of saving
- **SC-002**: Admins can add an episode to any podcast via file upload in under 2 minutes (from file selection to published episode)
- **SC-003**: Episode title auto-population from filename is accurate for 95% of standard filenames
- **SC-004**: Creators can record, preview, and publish an episode entirely within the app in under 5 minutes for recordings up to 30 minutes
- **SC-005**: 90% of creators successfully complete an in-app recording and episode creation on their first attempt
- **SC-006**: Recording interruptions (app backgrounded, calls) result in data loss for less than 5% of affected sessions
- **SC-007**: Audio file uploads (both uploaded and recorded) succeed 99% of the time for files under 100MB

## Assumptions

- Existing admin authentication and role-based access control will be reused; no new auth flows are needed
- The existing backend episode creation endpoint already supports multipart file uploads and will be reused for admin uploads
- The existing podcast edit endpoint supports all necessary fields (title, description, cover image, category, status)
- Mobile app already has permission handling infrastructure that can be extended for microphone access
- Recorded audio will be saved in the same format and quality as uploaded audio files (MP3 or equivalent)
- Target platforms for recording are iOS and Android via the existing React Native/Expo app
- Admin dashboard runs in a web browser and does not need recording capability — only file upload
- Creators can only record episodes for podcasts they own
- No real-time collaboration or multi-track recording is needed — single-track mono/stereo recording is sufficient
- Existing file storage infrastructure (local disk uploads) will be used for recorded audio files
