# API Contracts: App Core Features

**Branch**: `003-app-core-features` | **Date**: 2026-03-08

## Modified Endpoints

### GET `/podcasts` (Modified)

**Current behavior**: Returns paginated podcasts, optional `creatorId` filter.

**New query parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | `string` | No | Keyword search across title and description (uses MongoDB `$text` index) |
| `category` | `string` | No | Filter by category. One of: `Technology`, `Business`, `Comedy`, `Education`, `Health`, `Science`, `Culture`, `Sports` |

**Example request**: `GET /podcasts?page=1&limit=20&search=tech&category=Technology`

**Response** (unchanged structure):
```json
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "_id": "abc123",
        "title": "Tech Talk Daily",
        "description": "A daily podcast about technology trends",
        "coverImageUrl": "uploads/podcasts/cover.jpg",
        "category": "Technology",
        "creator": { "_id": "user123", "name": "John", "avatarUrl": "..." },
        "episodeCount": 12
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

## New Endpoints

### PATCH `/auth/change-password` (New)

**Description**: Change the authenticated user's password after verifying the current password.

**Auth**: Bearer token required

**Request body**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Validation rules**:
- `currentPassword`: required, string
- `newPassword`: required, string, min 8 characters

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Password changed successfully | `{ "message": "Password changed successfully" }` |
| 400 | Validation error (e.g., password too short) | `{ "message": "...", "error": "Bad Request" }` |
| 401 | Current password is incorrect | `{ "message": "Current password is incorrect" }` |

---

### DELETE `/users/me` (New)

**Description**: Permanently delete the authenticated user's account and all associated data. Requires password re-entry for security.

**Auth**: Bearer token required

**Request body**:
```json
{
  "password": "CurrentPassword123!"
}
```

**Cascade deletion order**:
1. Verify password
2. Find all user's podcasts → for each, cascade delete episodes (audio files, views, likes, comments)
3. Delete podcasts (and cover images)
4. Delete creator profile (if role = CREATOR)
5. Delete all follow relationships (both following and followers)
6. Delete user record

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Account deleted successfully | `{ "message": "Account deleted successfully" }` |
| 401 | Password verification failed | `{ "message": "Password is incorrect" }` |
| 404 | User not found | `{ "message": "User not found" }` |

---

## Existing Endpoints (No Changes Required)

### POST `/views/episodes/:episodeId` (Existing)

Already implemented in `ViewsController`. Records an idempotent view.

**Behavior**:
- First call for a user+episode pair: records view, increments `Episode.viewsCount`, returns `201`
- Subsequent calls: returns `200` without incrementing

**Response**:
```json
{
  "statusCode": 201,
  "data": {
    "message": "View recorded",
    "viewsCount": 42,
    "isNewView": true
  }
}
```

### POST `/follows/users/:targetId` (Existing)

Already implemented. Used by Library Following unfollow action.

### DELETE `/follows/users/:targetId` (Existing)

Already implemented. Used by Library Following unfollow action.

### GET `/follows/me/following` (Existing)

Already implemented. Returns paginated list of followed creators. Used by Library Following section.
