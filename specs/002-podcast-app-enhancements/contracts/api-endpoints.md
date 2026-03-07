# API Contracts: Podcast App Enhancements

**Branch**: `002-podcast-app-enhancements` | **Date**: 2026-03-07

## Modified Endpoints

### POST `/auth/google/mobile` (Modified)

**Current behavior**: Validates Google ID token, auto-links or creates user, returns tokens.

**New behavior**: When the Google email matches an existing email/password user, returns a `409 Conflict` instead of auto-linking.

**Request**: (unchanged)
```json
{
  "idToken": "string (Google ID token from mobile client)"
}
```

**Response 200 OK** (Google ID already linked, or new user created):
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "user | creator | admin",
    "isActive": true,
    "googleId": "string",
    "avatarUrl": "string | null",
    "deviceTokens": ["string"],
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
}
```

**Response 409 Conflict** (email matches existing email/password user):
```json
{
  "statusCode": 409,
  "message": "An account with this email already exists. Please verify your password to link your Google account.",
  "error": "Conflict",
  "code": "ACCOUNT_EXISTS_NEEDS_LINK",
  "email": "user@example.com"
}
```

**Response 401 Unauthorized** (invalid Google token):
```json
{
  "statusCode": 401,
  "message": "Invalid Google token",
  "error": "Unauthorized"
}
```

---

## New Endpoints

### POST `/auth/google/link`

**Purpose**: Links a Google account to an existing email/password user after password verification.

**Authentication**: None (public — password serves as authentication)

**Request**:
```json
{
  "idToken": "string (Google ID token from mobile client)",
  "password": "string (existing account password)"
}
```

**Response 200 OK** (password verified, accounts linked):
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "user | creator | admin",
    "isActive": true,
    "googleId": "string",
    "avatarUrl": "string | null",
    "deviceTokens": ["string"],
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
}
```

**Response 401 Unauthorized** (password invalid):
```json
{
  "statusCode": 401,
  "message": "Invalid password. Please try again.",
  "error": "Unauthorized"
}
```

**Response 401 Unauthorized** (invalid Google token):
```json
{
  "statusCode": 401,
  "message": "Invalid Google token",
  "error": "Unauthorized"
}
```

**Response 404 Not Found** (no user with matching email):
```json
{
  "statusCode": 404,
  "message": "No account found with this email address",
  "error": "Not Found"
}
```

---

## Unchanged Endpoints (Referenced by Feature)

### GET `/episodes?podcastId={id}&page={n}&limit={n}`

Used to fetch all episodes for a podcast to build the playback queue. No changes needed.

**Response 200 OK**:
```json
{
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "audioFileUrl": "string",
      "duration": 0,
      "podcast": { "_id": "string", "title": "string", "coverImageUrl": "string | null" },
      "creator": { "_id": "string", "name": "string" },
      "likesCount": 0,
      "viewsCount": 0,
      "commentsCount": 0,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### POST `/episodes` (multipart/form-data)

Used for episode upload. No endpoint changes needed — the `duration` field is already accepted as an optional number.

**Form fields**: `title`, `description`, `podcastId`, `duration` (optional), `audioFile` (binary), `imageFile` (optional binary)
