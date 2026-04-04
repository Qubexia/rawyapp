# API Contracts: Podcast Edit, Episode Management & In-App Recording

**Date**: 2026-04-03
**Feature**: 009-podcast-edit-record

## New Endpoints

### POST /admin/episodes

**Auth**: Required (ADMIN role)

Creates a new episode for any podcast, attributed to the podcast's original creator.

**Request**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audioFile` | File | Yes | Audio file (MP3, M4A, WAV, OGG, FLAC), max 100MB |
| `podcastId` | string | Yes | MongoDB ObjectId of the target podcast |
| `title` | string | No | Episode title (3-200 chars). Auto-filled from filename if not provided |
| `description` | string | No | Episode description (10-5000 chars) |
| `duration` | number | No | Duration in seconds |
| `imageFile` | File | No | Episode cover image (JPEG, JPG, PNG, WebP), max 100MB |

**Response** (201):

```json
{
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Episode Title",
    "description": "Episode description text",
    "audioFileUrl": "/uploads/audio/uuid-filename.m4a",
    "duration": 3600,
    "podcast": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Podcast Title",
      "coverImageUrl": "/uploads/images/uuid-cover.jpg"
    },
    "creator": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Original Creator",
      "avatarUrl": "/uploads/images/uuid-avatar.jpg"
    },
    "likesCount": 0,
    "viewsCount": 0,
    "commentsCount": 0,
    "imageUrl": null,
    "createdAt": "2026-04-03T12:00:00.000Z",
    "updatedAt": "2026-04-03T12:00:00.000Z"
  }
}
```

**Response** (400):

```json
{
  "statusCode": 400,
  "message": "Audio file is required"
}
```

**Response** (404):

```json
{
  "statusCode": 404,
  "message": "Podcast not found"
}
```

### PATCH /admin/episodes/:id

**Auth**: Required (ADMIN role)

Updates episode metadata (title, description, cover image). Does NOT allow audio file replacement.

**Request Body**: `multipart/form-data` or `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Updated episode title (3-200 chars) |
| `description` | string | No | Updated episode description (10-5000 chars) |
| `imageFile` | File | No | New episode cover image (JPEG, JPG, PNG, WebP), max 100MB |

**Response** (200):

```json
{
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "description": "Updated description",
    "audioFileUrl": "/uploads/audio/original-uuid.m4a",
    "imageUrl": "/uploads/images/new-uuid-image.jpg",
    "duration": 3600,
    "podcast": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Podcast Title",
      "coverImageUrl": "/uploads/images/uuid-cover.jpg"
    },
    "creator": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Original Creator",
      "avatarUrl": "/uploads/images/uuid-avatar.jpg"
    },
    "likesCount": 5,
    "viewsCount": 120,
    "commentsCount": 3,
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-03T12:00:00.000Z"
  }
}
```

**Response** (404):

```json
{
  "statusCode": 404,
  "message": "Episode not found"
}
```

## Modified Endpoints

### POST /episodes (Mobile — Creator Recording Upload)

**Auth**: Required (CREATOR role)

**No changes to contract**. The existing endpoint already accepts `multipart/form-data` with `audioFile` and optional `imageFile`. The mobile app will use this same endpoint to upload recordings — the only difference is the audio file source (recorded M4A instead of picked file).

**Request**: `multipart/form-data` (unchanged)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audioFile` | File | Yes | Audio file (MP3, M4A, WAV, OGG, FLAC), max 100MB |
| `podcastId` | string | Yes | MongoDB ObjectId of the target podcast |
| `title` | string | No | Episode title (3-200 chars) |
| `description` | string | No | Episode description (10-5000 chars) |
| `duration` | number | No | Duration in seconds |
| `imageFile` | File | No | Episode cover image (JPEG, JPG, PNG, WebP), max 100MB |

**Response**: Same as existing (201 with episode object).
