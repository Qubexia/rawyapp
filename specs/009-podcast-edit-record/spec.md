# Feature Specification: Podcast Edit, Episode Management & In-App Recording

**Feature Branch**: `009-podcast-edit-record`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "I want to add to the admin dashboard the ability to edit published podcasts and add episodes to any podcast using the same functionality as the app, including the episode title from the uploaded file.I want the ability for the creator to record an episode within our app."

## Clarifications

### Session 2026-04-03

- Q: When an admin creates an episode for a podcast, whose creatorId should the episode be attributed to? → A: Attribute to the podcast's original creator
- Q: What audio format should in-app recordings be saved and uploaded as? → A: M4A (AAC)
- Q: When an admin creates an episode for a podcast, whose creatorId should the episode be attributed to? → A: Attribute to the podcast's original creator
- Q: What audio format should in-app recordings be saved and uploaded as? → A: M4A (AAC)
- Q: After recording, must the creator publish immediately, or can they save the recording as a draft to edit and publish later? → A: Allow saving recording as draft to finish and publish later
- Q: When an admin creates an episode for a podcast, whose creatorId should the episode be attributed to? → A: Attribute to the podcast's original creator
- Q: What audio format should in-app recordings be saved and uploaded as? → A: M4A (AAC)
- Q: After recording, must the creator publish immediately, or can they save the recording as a draft to edit and publish later? → A: Allow saving recording as draft to finish and publish later
- Q: Should admins be able to replace the audio file of an existing episode via the admin dashboard, or only edit metadata (title, description)? → A: Metadata only (title, description, cover image), no audio replacement
- Q: What should be the maximum allowed recording duration per session? → A: 3 hours maximum per recording session

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Edits Published Podcasts (Priority: P1)

An admin navigates to the admin dashboard podcast management section, selects a published podcast, and edits its details (title, description, category, cover image) without unpublishing it first. The changes are saved and immediately reflected for all users viewing the podcast.

**Why this priority**: Admins need the ability to correct or update podcast information after publication without requiring a complex unpublish-republish workflow. This is a core administrative capability.

**Independent Test**: Can be fully tested by logging in as an admin, selecting a published podcast, modifying its fields, saving, and verifying the changes appear on both the admin dashboard and public-facing views.

**Acceptance Scenarios**:

1. **Given** an admin is viewing the podcast list in the admin dashboard, **When** they select a published podcast and edit its title, description, or category, **Then** the changes are saved and the podcast remains published
2. **Given** an admin is editing a published podcast, **When** they upload a new cover image, **Then** the old cover image is replaced and the new one is displayed across the platform
3. **Given** an admin has made edits to a published podcast, **When** they save changes, **Then** all users viewing the podcast see the updated information without needing to refresh

---

### User Story 2 - Admin Adds Episodes to Any Podcast (Priority: P1)

An admin navigates to a specific podcast in the admin dashboard and adds a new episode by uploading an audio file. The system automatically extracts the episode title from the uploaded filename, just as the mobile app does. The admin can also add a description, set duration, and optionally upload a cover image for the episode.

**Why this priority**: Admins need parity with the creator app's episode upload functionality to manage content directly, including the convenience of auto-filling titles from filenames.

**Independent Test**: Can be fully tested by logging in as an admin, navigating to any podcast, uploading an audio file, verifying the title is auto-filled from the filename, adding optional details, and confirming the episode appears in the podcast's episode list.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a podcast's detail page, **When** they upload an audio file for a new episode, **Then** the episode title is automatically populated from the filename
2. **Given** an admin is creating an episode via the admin dashboard, **When** they submit the form with an audio file and podcast selection, **Then** the episode is created attributed to the podcast's original creator, the podcast's episode count is incremented, and followers are notified
3. **Given** an admin uploads an audio file, **When** the file format is unsupported or exceeds the size limit, **Then** a clear error message is displayed and the episode is not created

---

### User Story 3 - Creator Records Episode In-App (Priority: P2)

A creator opens the episode creation flow in the app and chooses to record audio directly instead of uploading a pre-recorded file. They can start, pause, resume, and stop recording. After stopping, they can preview the recording, edit the episode title and description, and then publish the episode to a selected podcast.

**Why this priority**: Enables creators to produce content directly within the app without needing external recording tools, reducing friction in the content creation workflow.

**Independent Test**: Can be fully tested by opening the episode creation screen, selecting "Record," recording a short audio clip, stopping, previewing playback, filling in episode details, selecting a podcast, and publishing.

**Acceptance Scenarios**:

1. **Given** a creator is on the episode creation screen, **When** they select the record option, **Then** the app requests microphone permission and displays recording controls (start, pause, stop)
2. **Given** a creator is recording an episode, **When** they pause and resume, **Then** the recording continues as a single audio file with accurate total duration
3. **Given** a creator has finished recording, **When** they stop the recording, **Then** they can preview the audio, edit the title and description, select a target podcast, and publish the episode
4. **Given** a creator is recording, **When** the app is interrupted (incoming call, backgrounding), **Then** the recording is paused automatically and can be resumed when the app returns to foreground

---

### User Story 4 - Creator Edits Episode Metadata After Recording (Priority: P3)

After recording an episode, a creator can edit the episode's title, description, and optionally attach a cover image before or after publishing. The recorded audio file is preserved during metadata edits.

**Why this priority**: Provides flexibility for creators to refine episode details after the initial recording session.

**Independent Test**: Can be fully tested by recording an episode, publishing it, then editing its title and description and confirming changes are saved without affecting the audio file.

**Acceptance Scenarios**:

1. **Given** a creator has recorded and published an episode, **When** they edit the episode's title or description, **Then** the changes are saved and the audio file remains unchanged
2. **Given** a creator is editing a recorded episode, **When** they choose to replace the audio file, **Then** they can either upload a new file or re-record

---

### Edge Cases

- What happens when an admin tries to edit a podcast that has been deleted or is in an invalid state?
- How does the system handle audio file uploads that fail midway through (network interruption, server error)?
- What happens when a creator's device runs out of storage during an in-app recording session?
- How does the system handle recordings that reach the 3-hour maximum duration limit?
- What happens if microphone permission is denied when a creator attempts to record?
- How does the system handle concurrent edits to the same podcast by multiple admins?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to edit all editable fields (title, description, category, cover image) of published podcasts without changing their published status
- **FR-002**: System MUST allow admins to create new episodes for any podcast via the admin dashboard with audio file upload
- **FR-018**: System MUST allow admins to edit existing episode metadata (title, description, cover image) but NOT replace the audio file
- **FR-003**: System MUST automatically extract and populate the episode title from the uploaded audio file's filename (excluding file extension)
- **FR-004**: System MUST support the same audio file formats for admin episode uploads as the mobile app (MP3, M4A, WAV, OGG, FLAC)
- **FR-005**: System MUST enforce the same file size limits for admin episode uploads as configured for the platform
- **FR-006**: System MUST allow creators to record audio directly within the app using device microphone and save recordings in M4A (AAC) format
- **FR-007**: System MUST provide recording controls including start, pause, resume, and stop, with a maximum recording duration of 3 hours per session
- **FR-008**: System MUST allow creators to preview their recording before publishing
- **FR-009**: System MUST allow creators to set episode title, description, and select a target podcast after recording, or save the recording as a draft to complete and publish later
- **FR-010**: System MUST handle app interruptions during recording (incoming calls, backgrounding) by pausing and allowing resume
- **FR-011**: System MUST request and handle microphone permissions gracefully, showing appropriate messaging when permission is denied
- **FR-012**: System MUST save recorded audio to the platform's storage and create the episode record with correct metadata upon publish
- **FR-013**: System MUST increment the podcast's episode count when a new episode is added (via admin or creator)
- **FR-014**: System MUST notify podcast followers when a new episode is added
- **FR-015**: System MUST allow creators to edit episode metadata (title, description, cover image) after publishing without affecting the audio file
- **FR-016**: System MUST provide visual feedback during audio file upload progress and recording duration
- **FR-017**: System MUST validate audio file format and size before accepting uploads, displaying clear error messages for invalid files

### Key Entities

- **Podcast**: Existing entity. Admin editing does not change the entity structure; only the ability to edit published-status podcasts is extended.
- **Episode**: Existing entity. New capability includes creation from in-app recorded audio in addition to uploaded files.
- **Audio Recording**: New transient entity representing an in-progress or completed in-app recording session. Contains: recording state (idle, recording, paused), duration, temporary file path, associated podcast ID (selected before or after recording).
- **Recording Session Metadata**: Data captured during recording including start time, total duration, pause/resume events, and final audio file reference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can edit a published podcast's details and see changes reflected across the platform within 5 seconds of saving
- **SC-002**: Admins can upload and create a new episode for any podcast in under 2 minutes (from file selection to confirmation)
- **SC-003**: Episode title is correctly auto-filled from filename in 100% of valid file uploads
- **SC-004**: Creators can record, preview, and publish an episode entirely within the app without switching to external tools
- **SC-005**: In-app recordings of up to 2 hours complete successfully without data loss in 99% of attempts
- **SC-006**: Recording sessions survive app interruptions (backgrounding, incoming calls) and can be resumed in 95% of cases
- **SC-007**: Audio file upload errors display actionable messages that enable users to resolve the issue on their first attempt in 90% of cases

## Assumptions

- Admins already have the necessary permissions to edit podcasts and create episodes; this feature extends UI/UX capabilities, not permission structures
- The existing file storage infrastructure (cloud storage for audio files) supports the additional recordings without capacity changes
- Creators using the in-app recording feature have devices with functioning microphones and sufficient storage space
- The existing podcast follower notification system will be reused for episodes created via admin dashboard or in-app recording
- Audio quality from in-app recording is acceptable for podcast publishing without post-processing (standard device microphone quality)
- The admin dashboard and mobile app share the same backend API endpoints for podcast and episode operations
- File size limits for recorded episodes match the existing upload limits (100MB)
- Creators can select an existing podcast to attach their recorded episode to, or the episode can be saved as a draft without a podcast assignment
