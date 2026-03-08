# API Endpoints: App Engagement Features

**Branch**: `004-app-engagement-features`  
**Date**: 2026-03-08  
**Base URL**: `{API_URL}` (e.g., `http://localhost:3000`)  
**Auth**: All endpoints require JWT Bearer token unless marked `[Public]`

---

## 1. Notifications

### GET /notifications

List the authenticated user's notifications (paginated, reverse chronological by `updatedAt`).

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response** `200 OK`:
```json
{
  "data": [
    {
      "_id": "664abc...",
      "type": "comment_like",
      "lastActor": { "_id": "user1", "name": "Ahmed", "avatarUrl": "/uploads/..." },
      "actorCount": 13,
      "targetId": "comment123",
      "targetModel": "Comment",
      "episodeId": "ep456",
      "previewText": "Great episode!",
      "isRead": false,
      "createdAt": "2026-03-08T01:00:00Z",
      "updatedAt": "2026-03-08T02:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### GET /notifications/unread-count

Get the count of unread notifications for the badge.

**Response** `200 OK`:
```json
{ "count": 7 }
```

### PATCH /notifications/:id/read

Mark a single notification as read.

**Response** `200 OK`:
```json
{ "message": "Notification marked as read" }
```

### PATCH /notifications/read-all

Mark all notifications as read for the authenticated user.

**Response** `200 OK`:
```json
{ "message": "All notifications marked as read" }
```

---

## 2. Comment Likes

### POST /comment-likes/comments/:commentId

Like a comment. Idempotent — returns current state if already liked.

**Response** `201 Created`:
```json
{
  "message": "Comment liked",
  "isLiked": true,
  "likesCount": 16
}
```

### DELETE /comment-likes/comments/:commentId

Unlike a comment.

**Response** `200 OK`:
```json
{
  "message": "Comment unliked",
  "isLiked": false,
  "likesCount": 15
}
```

### GET /comment-likes/comments/:commentId/status

Check if the authenticated user has liked a comment.

**Response** `200 OK`:
```json
{
  "isLiked": true,
  "likesCount": 16
}
```

---

## 3. Comments (Extended)

### POST /comments/episodes/:episodeId

Create a comment or reply. **Extended** with optional `parentCommentId`.

**Request Body**:
```json
{
  "text": "I agree with this point!",
  "parentCommentId": "comment123"
}
```
- `parentCommentId` is optional. If omitted, creates a top-level comment.
- If the parent is itself a reply, the server flattens to the root (one-level nesting).

**Response** `201 Created`:
```json
{
  "_id": "newComment789",
  "text": "I agree with this point!",
  "user": { "_id": "user1", "name": "Ahmed" },
  "episodeId": "ep456",
  "parentCommentId": "comment123",
  "likesCount": 0,
  "createdAt": "2026-03-08T02:00:00Z"
}
```

### GET /comments/episodes/:episodeId

Get top-level comments for an episode. **Extended** — now excludes replies (only returns `parentCommentId: null`).

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response** `200 OK`:
```json
{
  "data": [
    {
      "_id": "comment123",
      "text": "Great episode!",
      "user": { "_id": "user1", "name": "Ahmed" },
      "episodeId": "ep456",
      "parentCommentId": null,
      "likesCount": 5,
      "replyCount": 3,
      "createdAt": "2026-03-08T01:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### GET /comments/:commentId/replies

Get replies for a specific comment (paginated).

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response** `200 OK`:
```json
{
  "data": [
    {
      "_id": "reply001",
      "text": "I agree with this point!",
      "user": { "_id": "user2", "name": "Sara" },
      "episodeId": "ep456",
      "parentCommentId": "comment123",
      "likesCount": 2,
      "createdAt": "2026-03-08T02:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 4. Feed

### GET /feed

Get the personalized home feed for the authenticated user.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response** `200 OK`:
```json
{
  "following": [
    {
      "_id": "ep789",
      "title": "AI in 2026",
      "description": "...",
      "podcast": { "_id": "pod1", "title": "Tech Talk", "coverImageUrl": "/uploads/..." },
      "creator": { "_id": "user5", "name": "Ali" },
      "viewsCount": 1200,
      "likesCount": 85,
      "commentsCount": 12,
      "duration": 1800,
      "createdAt": "2026-03-07T10:00:00Z"
    }
  ],
  "recommended": [
    {
      "_id": "ep999",
      "title": "Intro to Design",
      "description": "...",
      "podcast": { "_id": "pod2", "title": "Design Weekly", "coverImageUrl": "/uploads/..." },
      "creator": { "_id": "user8", "name": "Nora" },
      "viewsCount": 5000,
      "likesCount": 320,
      "commentsCount": 42,
      "duration": 2400,
      "createdAt": "2026-03-06T08:00:00Z"
    }
  ],
  "followingTotal": 15,
  "recommendedTotal": 50
}
```

**Logic**:
- `following`: Recent episodes from creators the user follows, sorted by `createdAt DESC`
- `recommended`: Popular episodes from categories the user has listened to, excluding followed creators and already-viewed episodes, sorted by `viewsCount DESC`
- If user follows no one: `following` is empty, `recommended` contains trending episodes

### GET /feed [Public — Unauthenticated]

Returns trending/popular content only (no personalization).

---

## 5. Suggestions

### GET /suggestions/users

Get suggested users/creators for the authenticated user.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 10 | Max suggestions |
| `lat` | number | — | Latitude (optional, from device) |
| `lng` | number | — | Longitude (optional, from device) |

**Response** `200 OK`:
```json
{
  "data": [
    {
      "_id": "user10",
      "name": "Youssef",
      "avatarUrl": "/uploads/...",
      "role": "CREATOR",
      "showName": "Youssef's Podcast",
      "followerCount": 250,
      "location": { "city": "Cairo" },
      "isFollowing": false
    }
  ]
}
```

**Logic**:
- If `lat`/`lng` provided: prioritize users/creators within ~50km (city-level), then by follower count
- If no location: suggest by category overlap (based on user's listened/followed categories), then by popularity
- Exclude already-followed users

---

## 6. User Location

### PATCH /users/me/location

Update the authenticated user's city-level location.

**Request Body**:
```json
{
  "city": "Cairo",
  "coordinates": [31.2357, 30.0444]
}
```

**Validation**:
- `city`: optional string, max 100 chars
- `coordinates`: optional `[longitude, latitude]` array, values rounded to ~2 decimal places (~1km)

**Response** `200 OK`:
```json
{ "message": "Location updated" }
```

---

## 7. Device Token Registration

### POST /users/me/device-token

Register or update a device's FCM token.

**Request Body**:
```json
{
  "token": "fcm-token-string-here"
}
```

**Logic**: Adds token to user's `deviceTokens[]` array if not already present.

**Response** `200 OK`:
```json
{ "message": "Device token registered" }
```

### DELETE /users/me/device-token

Remove a device token (e.g., on logout).

**Request Body**:
```json
{
  "token": "fcm-token-string-here"
}
```

**Response** `200 OK`:
```json
{ "message": "Device token removed" }
```

---

## 8. Push Notification Preference

### PATCH /users/me/push-preference

Toggle push notification preference.

**Request Body**:
```json
{
  "pushEnabled": false
}
```

**Response** `200 OK`:
```json
{ "message": "Push preference updated", "pushEnabled": false }
```

---

## Existing Endpoints (No Changes)

| Method | Path | Module | Notes |
|--------|------|--------|-------|
| GET | /episodes/:id | Episodes | No change — already returns viewsCount |
| POST | /views/episodes/:episodeId | Views | No change — idempotent view recording |
| POST | /follows/users/:targetId | Follows | No change — already supports following |
| DELETE | /follows/users/:targetId | Follows | No change — already supports unfollowing |
| GET | /follows/users/:targetId/status | Follows | No change |
| GET | /follows/me/following | Follows | No change |
| GET | /follows/users/:targetId/followers | Follows | No change |
| POST | /likes/episodes/:episodeId | Likes | No change — episode likes |
| DELETE | /likes/episodes/:episodeId | Likes | No change |
| GET | /likes/episodes/:episodeId/status | Likes | No change |
