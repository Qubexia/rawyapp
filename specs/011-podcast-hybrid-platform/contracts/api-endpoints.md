# API Contracts: Rawy Hybrid Podcast Platform

All responses are wrapped in a standard envelope:
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

---

## Authentication Endpoints

### POST /auth/register

Register new user account.

**Request**:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "name": "string (required)"
}
```

**Response** (201):
```json
{
  "statusCode": 201,
  "data": {
    "user": { "id": "string", "email": "string", "role": "USER" },
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

---

### POST /auth/login

Authenticate existing user.

**Request**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "user": { "id": "string", "email": "string", "role": "USER | CREATOR | ADMIN" },
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

---

### POST /auth/refresh

Refresh JWT tokens.

**Headers**: `Authorization: Bearer <refreshToken>`

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

---

## Podcast Endpoints

### GET /podcasts/discover

Fetch Top 100 podcasts from Apple API. **Public endpoint.**

**Response** (200):
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "feedUrl": "string",
      "artworkUrl": "string",
      "author": "string",
      "appleId": "string"
    }
  ]
}
```

---

### GET /podcasts/search?q=

Search external podcasts by keyword.

**Headers**: `Authorization: Bearer <token>`
**Query**: `?q=<search term>`

**Response** (200):
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "feedUrl": "string",
      "artworkUrl": "string",
      "author": "string",
      "appleId": "string"
    }
  ]
}
```

---

### GET /podcasts/creator

Get authenticated creator's owned podcasts.

**Headers**: `Authorization: Bearer <token>`
**Required Role**: CREATOR

**Query**: `?page=1&limit=20`

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "source": "external | internal",
        "feedUrl": "string",
        "coverImageUrl": "string",
        "autoSync": true,
        "episodeCount": 0,
        "creator": { "_id": "string", "name": "string", "avatarUrl": "string" }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### GET /podcasts

Get all podcasts (public, paginated).

**Query**: `?page=1&limit=20&creatorId=<id>&search=<keyword>&category=<category>`

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "data": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### GET /podcasts/:id

Get a podcast by ID (public).

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "source": "external | internal",
    "coverImageUrl": "string",
    "episodeCount": 0,
    "creator": { "_id": "string", "name": "string", "avatarUrl": "string" }
  }
}
```

---

### POST /podcasts

Create new internal podcast.

**Headers**: `Authorization: Bearer <token>`
**Required Role**: CREATOR
**Content-Type**: multipart/form-data

**Form Data**:
- `title`: string (required, 3–100 chars)
- `description`: string (required, 10–2000 chars)
- `coverImage`: file (optional, max 5MB, jpeg/png/webp)

**Response** (201):
```json
{
  "statusCode": 201,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "source": "internal",
    "creatorId": "string",
    "episodeCount": 0
  }
}
```

---

### PATCH /podcasts/:id

Update a podcast (owner or admin only).

**Headers**: `Authorization: Bearer <token>`
**Required Role**: CREATOR
**Content-Type**: multipart/form-data

**Form Data**:
- `title`: string (optional)
- `description`: string (optional)
- `coverImage`: file (optional)

**Response** (200):
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

---

### DELETE /podcasts/:id

Delete a podcast and all associated episodes (owner or admin only).

**Headers**: `Authorization: Bearer <token>`
**Required Role**: CREATOR

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Podcast deleted successfully"
}
```

---

### POST /podcasts/:id/subscribe

Subscribe to a podcast.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Subscribed successfully"
}
```

---

### DELETE /podcasts/:id/subscribe

Unsubscribe from a podcast.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Unsubscribed successfully"
}
```

---

### PATCH /podcasts/:id/sync

Trigger a manual sync for an external podcast.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Sync completed successfully"
}
```

**Error** (400): `"Cannot sync internal podcasts"` / `"Podcast has no feed URL"`

---

## Claim Endpoints

### POST /podcasts/claim

Request ownership claim for an external podcast.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "podcastId": "string (required)"
}
```

**Response** (202):
```json
{
  "statusCode": 202,
  "message": "Verification email sent",
  "claimId": "string"
}
```

---

### GET /claims/verify/:token

Verify claim request via email link. Automatically upgrades user role to CREATOR.

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Podcast claimed successfully",
  "role": "CREATOR"
}
```

---

## Episode Endpoints

### GET /episodes

Get all episodes (public, paginated).

**Query**: `?page=1&limit=20&podcastId=<id>&creatorId=<id>`

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "audioFileUrl": "string",
        "source": "external | internal",
        "duration": 1800,
        "pubDate": "2026-01-01T00:00:00.000Z",
        "viewsCount": 0,
        "likesCount": 0,
        "commentsCount": 0
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET /episodes/:id

Get an episode by ID (public).

**Response** (200):
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

---

### POST /episodes

Upload new internal episode.

**Headers**: `Authorization: Bearer <token>`
**Required Role**: CREATOR
**Content-Type**: multipart/form-data

**Form Data**:
- `title`: string (required)
- `description`: string (required)
- `podcastId`: string (required, must own the podcast)
- `duration`: number (optional, seconds)
- `audioFile`: file (required, max 100MB)
- `imageFile`: file (optional, max 5MB)

**Response** (201):
```json
{
  "statusCode": 201,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "audioFileUrl": "string",
    "source": "internal",
    "podcastId": "string",
    "creatorId": "string"
  }
}
```

---

### PATCH /episodes/:id

Update an episode (owner or admin only).

**Headers**: `Authorization: Bearer <token>`
**Required Role**: CREATOR

**Response** (200):
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

---

### DELETE /episodes/:id

Delete an episode (owner or admin only).

**Headers**: `Authorization: Bearer <token>`
**Required Role**: CREATOR

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Episode deleted successfully"
}
```

---

## Error Responses

All errors follow the same structure from the global `HttpExceptionFilter`:

```json
{
  "statusCode": 400,
  "message": "Validation error description",
  "error": "Bad Request",
  "timestamp": "2026-04-05T00:00:00.000Z",
  "path": "/api/v1/podcasts"
}
```

| Code | Meaning |
|------|---------|
| 400 | Validation error / bad input |
| 401 | Missing or invalid JWT |
| 403 | Insufficient role / not resource owner |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Authorization Matrix

| Endpoint | Public | USER | CREATOR | ADMIN |
|----------|--------|------|---------|-------|
| POST /auth/register | ✅ | – | – | – |
| POST /auth/login | ✅ | – | – | – |
| GET /podcasts/discover | ✅ | ✅ | ✅ | ✅ |
| GET /podcasts | ✅ | ✅ | ✅ | ✅ |
| GET /podcasts/:id | ✅ | ✅ | ✅ | ✅ |
| GET /episodes | ✅ | ✅ | ✅ | ✅ |
| GET /episodes/:id | ✅ | ✅ | ✅ | ✅ |
| GET /podcasts/search | ❌ | ✅ | ✅ | ✅ |
| POST /podcasts/:id/subscribe | ❌ | ✅ | ✅ | ✅ |
| DELETE /podcasts/:id/subscribe | ❌ | ✅ | ✅ | ✅ |
| POST /podcasts/claim | ❌ | ✅ | ✅ | ✅ |
| GET /claims/verify/:token | ✅ | ✅ | ✅ | ✅ |
| PATCH /podcasts/:id/sync | ❌ | ✅ | ✅ | ✅ |
| GET /podcasts/creator | ❌ | ❌ | ✅ | ✅ |
| POST /podcasts | ❌ | ❌ | ✅ | ✅ |
| PATCH /podcasts/:id | ❌ | ❌ | ✅* | ✅ |
| DELETE /podcasts/:id | ❌ | ❌ | ✅* | ✅ |
| POST /episodes | ❌ | ❌ | ✅* | ✅ |
| PATCH /episodes/:id | ❌ | ❌ | ✅* | ✅ |
| DELETE /episodes/:id | ❌ | ❌ | ✅* | ✅ |

*CREATOR can only modify resources they own (resource-based authorization via OwnershipGuard)

---

## Database Indexes

### Podcast
| Index | Type | Purpose |
|-------|------|---------|
| `{ creatorId: 1 }` | Standard | Filter by creator |
| `{ creatorId: 1, source: 1 }` | Compound | Creator + source filter |
| `{ createdAt: -1 }` | Descending | Recent podcasts first |
| `{ category: 1 }` | Standard | Category filter |
| `{ title: 'text', description: 'text' }` | Text | Full-text search |
| `{ status: 1 }` | Standard | Status filter |
| `{ feedUrl: 1 }` | Unique, Sparse | Prevent duplicate feeds |

### Episode
| Index | Type | Purpose |
|-------|------|---------|
| `{ podcastId: 1, createdAt: -1 }` | Compound | Episodes by podcast, newest first |
| `{ creatorId: 1 }` | Standard | Filter by creator |
| `{ createdAt: -1 }` | Descending | Recent episodes first |
| `{ podcastId: 1, pubDate: -1 }` | Compound | Episodes by publish date |
| `{ podcastId: 1, guid: 1 }` | Unique, Sparse | Deduplication for synced episodes |

### ClaimRequest
| Index | Type | Purpose |
|-------|------|---------|
| `{ verificationToken: 1 }` | Unique | Fast token lookup |
| `{ userId: 1, podcastId: 1 }` | Unique | One claim per user per podcast |
| `{ expiresAt: 1 }` | TTL-ready | Auto-cleanup of expired claims |
