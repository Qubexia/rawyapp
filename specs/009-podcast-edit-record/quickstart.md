# Quickstart: Podcast Edit, Episode Management & In-App Recording

**Date**: 2026-04-03
**Feature**: 009-podcast-edit-record

## Prerequisites

- Backend running: `cd backend && npm run start:dev`
- Admin dashboard running: `cd admin-dashboard && npm run dev`
- Mobile app running: `cd rawy && npx expo start`
- MongoDB instance available
- Admin user account for testing admin features
- Creator user account for testing recording features

## Testing Admin Features

### 1. Edit a Published Podcast

1. Log in to the admin dashboard as an admin user
2. Navigate to `/podcasts`
3. Select a published podcast from the list
4. Click "Edit" to open the edit modal
5. Modify title, description, category, or upload a new cover image
6. Save and verify changes appear on the public podcast view

### 2. Create an Episode via Admin Dashboard

1. Navigate to a podcast's detail page or `/episodes`
2. Click "Add Episode"
3. Upload an audio file (MP3, M4A, WAV, OGG, FLAC)
4. Verify the title is auto-filled from the filename
5. Add description and optional cover image
6. Submit and verify:
   - Episode appears in the podcast's episode list
   - Podcast episode count is incremented
   - Podcast followers receive a notification
   - Episode is attributed to the podcast's original creator

### 3. Edit Episode Metadata via Admin Dashboard

1. Navigate to `/episodes`
2. Select an existing episode
3. Click "Edit" to open the edit modal
4. Modify title, description, or upload a new cover image
5. Save and verify changes (audio file should remain unchanged)

## Testing Creator Recording Features

### 1. Record an Episode In-App

1. Log in to the mobile app as a creator user
2. Navigate to the episode creation screen
3. Select "Record" option
4. Grant microphone permission if prompted
5. Press "Record" to start recording
6. Test pause/resume functionality
7. Press "Stop" when finished
8. Preview the recording
9. Fill in title, description, select target podcast
10. Publish the episode

### 2. Save Recording as Draft

1. Follow steps 1-7 above
2. Instead of publishing, select "Save as Draft"
3. Verify the recording is saved locally or as a server draft
4. Resume the draft later to complete and publish

### 3. Test Recording Interruption

1. Start a recording session
2. Background the app or simulate an incoming call
3. Return to the app
4. Verify recording is paused and can be resumed
5. Continue recording and complete the episode

## API Testing (cURL)

### Admin Create Episode

```bash
curl -X POST http://localhost:3000/admin/episodes \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -F "audioFile=@/path/to/episode.m4a" \
  -F "podcastId=<PODCAST_ID>" \
  -F "title=My Episode" \
  -F "description=Episode description"
```

### Admin Edit Episode Metadata

```bash
curl -X PATCH http://localhost:3000/admin/episodes/<EPISODE_ID> \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -F "title=Updated Title" \
  -F "description=Updated description"
```

### Admin Edit Published Podcast

```bash
curl -X PATCH http://localhost:3000/admin/podcasts/<PODCAST_ID> \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -F "title=Updated Podcast Title" \
  -F "description=Updated description"
```

## Key Files Modified

| Component | Files |
|-----------|-------|
| Backend | `backend/src/admin/admin.controller.ts`, `backend/src/admin/admin.service.ts`, `backend/src/episodes/dto/update-episode.dto.ts` |
| Admin Dashboard | `admin-dashboard/src/app/(dashboard)/podcasts/page.tsx`, `admin-dashboard/src/app/(dashboard)/episodes/page.tsx`, `admin-dashboard/src/components/episode/CreateEpisodeForm.tsx`, `admin-dashboard/src/components/episode/EditEpisodeModal.tsx`, `admin-dashboard/src/services/adminEpisodeService.ts` |
| Mobile App | `rawy/app/(creator)/upload-episode.tsx`, `rawy/app/(creator)/record-episode.tsx` (new), `rawy/components/ui/RecordingControls.tsx` (new), `rawy/utils/audio-recording.ts` (new), `rawy/services/episodes.service.ts` |
