# API Contracts: RAWY Podcast Platform – Backend (MVP)

**Base URL**: `/api/v1`  
**Auth**: Bearer JWT token in `Authorization` header  
**Content-Type**: `application/json` (unless file upload — `multipart/form-data`)

## Common Response Formats

### Success (Single)
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

### Success (Paginated)
```json
{
  "statusCode": 200,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-03-03T20:42:00.000Z"
}
```

---

## 1. Authentication (`/api/v1/auth`)

### POST `/auth/register`
**Auth**: None  
**Body**: `{ name: string, email: string, password: string }`  
**Response 201**: `{ accessToken: string, refreshToken: string, user: UserDto }`  
**Errors**: 400 (validation), 409 (email exists)

### POST `/auth/login`
**Auth**: None  
**Body**: `{ email: string, password: string }`  
**Response 200**: `{ accessToken: string, refreshToken: string, user: UserDto }`  
**Errors**: 401 (invalid credentials)

### POST `/auth/refresh`
**Auth**: None  
**Body**: `{ refreshToken: string }`  
**Response 200**: `{ accessToken: string, refreshToken: string }`  
**Errors**: 401 (invalid/expired refresh token)

### POST `/auth/logout`
**Auth**: Bearer JWT  
**Response 200**: `{ message: "Logged out successfully" }`  
**Effect**: Removes stored refresh token

### GET `/auth/google`
**Auth**: None  
**Effect**: Redirects to Google OAuth consent screen

### GET `/auth/google/callback`
**Auth**: None (OAuth callback)  
**Response 200**: `{ accessToken: string, refreshToken: string, user: UserDto }`

### GET `/auth/facebook`
**Auth**: None  
**Effect**: Redirects to Facebook OAuth consent screen

### GET `/auth/facebook/callback`
**Auth**: None (OAuth callback)  
**Response 200**: `{ accessToken: string, refreshToken: string, user: UserDto }`

---

## 2. Users (`/api/v1/users`)

### GET `/users/me`
**Auth**: Bearer JWT  
**Response 200**: `UserDto`

### PATCH `/users/me`
**Auth**: Bearer JWT  
**Body**: `{ name?: string }`  
**Response 200**: `UserDto`

### POST `/users/me/device-token`
**Auth**: Bearer JWT  
**Body**: `{ token: string }`  
**Response 201**: `{ message: "Device token registered" }`

### DELETE `/users/me/device-token`
**Auth**: Bearer JWT  
**Body**: `{ token: string }`  
**Response 200**: `{ message: "Device token removed" }`

---

## 3. Creators (`/api/v1/creators`)

### POST `/creators/become`
**Auth**: Bearer JWT (role: USER)  
**Response 201**: `CreatorProfileDto`  
**Errors**: 400 (already a creator)

### GET `/creators/:id`
**Auth**: None (public)  
**Response 200**: `CreatorProfileDto` (includes follower count, podcast count)

### PATCH `/creators/me`
**Auth**: Bearer JWT (role: CREATOR)  
**Body**: `{ bio?: string, socialLinks?: { website?, twitter?, instagram?, youtube? } }`  
**Multipart**: Optional `avatar` file field  
**Response 200**: `CreatorProfileDto`

### GET `/creators`
**Auth**: None (public)  
**Query**: `?page=1&limit=20`  
**Response 200**: Paginated `CreatorProfileDto[]`

---

## 4. Podcasts (`/api/v1/podcasts`)

### POST `/podcasts`
**Auth**: Bearer JWT (role: CREATOR)  
**Multipart**: `title: string, description: string, coverImage: File`  
**Response 201**: `PodcastDto`

### GET `/podcasts`
**Auth**: None (public)  
**Query**: `?page=1&limit=20&creatorId?=ObjectId`  
**Response 200**: Paginated `PodcastDto[]`

### GET `/podcasts/:id`
**Auth**: None (public)  
**Response 200**: `PodcastDto`

### PATCH `/podcasts/:id`
**Auth**: Bearer JWT (role: CREATOR, owner only)  
**Multipart**: `title?: string, description?: string, coverImage?: File`  
**Response 200**: `PodcastDto`

### DELETE `/podcasts/:id`
**Auth**: Bearer JWT (role: CREATOR owner | ADMIN)  
**Response 200**: `{ message: "Podcast deleted" }`  
**Effect**: Cascade deletes all episodes, likes, comments, views

---

## 5. Episodes (`/api/v1/episodes`)

### POST `/episodes`
**Auth**: Bearer JWT (role: CREATOR)  
**Multipart**: `title: string, description: string, podcastId: ObjectId, audioFile: File, duration?: number`  
**Response 201**: `EpisodeDto`  
**Side Effect**: Push notification sent to all followers

### GET `/episodes`
**Auth**: None (public)  
**Query**: `?page=1&limit=20&podcastId?=ObjectId&creatorId?=ObjectId`  
**Response 200**: Paginated `EpisodeDto[]`

### GET `/episodes/:id`
**Auth**: None (public)  
**Response 200**: `EpisodeDto`

### PATCH `/episodes/:id`
**Auth**: Bearer JWT (role: CREATOR, owner only)  
**Body**: `{ title?: string, description?: string }`  
**Response 200**: `EpisodeDto`

### DELETE `/episodes/:id`
**Auth**: Bearer JWT (role: CREATOR owner | ADMIN)  
**Response 200**: `{ message: "Episode deleted" }`  
**Effect**: Cascade deletes likes, comments, views

---

## 6. Likes (`/api/v1/likes`)

### POST `/likes/episodes/:episodeId`
**Auth**: Bearer JWT  
**Response 201**: `{ message: "Episode liked", likesCount: number }`  
**Errors**: 409 (already liked)

### DELETE `/likes/episodes/:episodeId`
**Auth**: Bearer JWT  
**Response 200**: `{ message: "Episode unliked", likesCount: number }`  
**Errors**: 404 (not liked)

### GET `/likes/episodes/:episodeId/status`
**Auth**: Bearer JWT  
**Response 200**: `{ isLiked: boolean, likesCount: number }`

---

## 7. Comments (`/api/v1/comments`)

### POST `/comments/episodes/:episodeId`
**Auth**: Bearer JWT  
**Body**: `{ text: string }` (min: 1, max: 1000)  
**Response 201**: `CommentDto`

### GET `/comments/episodes/:episodeId`
**Auth**: None (public)  
**Query**: `?page=1&limit=20`  
**Response 200**: Paginated `CommentDto[]` (ordered by createdAt ASC)

### DELETE `/comments/:commentId`
**Auth**: Bearer JWT (author only | ADMIN)  
**Response 200**: `{ message: "Comment deleted" }`

---

## 8. Follows (`/api/v1/follows`)

### POST `/follows/creators/:creatorId`
**Auth**: Bearer JWT  
**Response 201**: `{ message: "Now following", followerCount: number }`  
**Errors**: 409 (already following), 400 (self-follow)

### DELETE `/follows/creators/:creatorId`
**Auth**: Bearer JWT  
**Response 200**: `{ message: "Unfollowed", followerCount: number }`  
**Errors**: 404 (not following)

### GET `/follows/creators/:creatorId/status`
**Auth**: Bearer JWT  
**Response 200**: `{ isFollowing: boolean, followerCount: number }`

### GET `/follows/me/following`
**Auth**: Bearer JWT  
**Query**: `?page=1&limit=20`  
**Response 200**: Paginated `CreatorProfileDto[]`

### GET `/follows/creators/:creatorId/followers`
**Auth**: None (public)  
**Query**: `?page=1&limit=20`  
**Response 200**: Paginated `UserSummaryDto[]`

---

## 9. Views (`/api/v1/views`)

### POST `/views/episodes/:episodeId`
**Auth**: Bearer JWT  
**Response 201**: `{ message: "View recorded", viewsCount: number }`  
**Note**: Returns 200 with current count if already viewed (idempotent)

---

## 10. Admin (`/api/v1/admin`)

### GET `/admin/users`
**Auth**: Bearer JWT (role: ADMIN)  
**Query**: `?page=1&limit=20&role?=USER|CREATOR|ADMIN&isActive?=true|false`  
**Response 200**: Paginated `UserDto[]`

### PATCH `/admin/users/:userId/deactivate`
**Auth**: Bearer JWT (role: ADMIN)  
**Response 200**: `{ message: "User deactivated" }`

### PATCH `/admin/users/:userId/activate`
**Auth**: Bearer JWT (role: ADMIN)  
**Response 200**: `{ message: "User activated" }`

### PATCH `/admin/users/:userId/promote`
**Auth**: Bearer JWT (role: ADMIN)  
**Body**: `{ role: "CREATOR" | "ADMIN" }`  
**Response 200**: `UserDto`

### DELETE `/admin/podcasts/:podcastId`
**Auth**: Bearer JWT (role: ADMIN)  
**Response 200**: `{ message: "Podcast removed by admin" }`

### DELETE `/admin/episodes/:episodeId`
**Auth**: Bearer JWT (role: ADMIN)  
**Response 200**: `{ message: "Episode removed by admin" }`

### DELETE `/admin/comments/:commentId`
**Auth**: Bearer JWT (role: ADMIN)  
**Response 200**: `{ message: "Comment removed by admin" }`

### GET `/admin/stats`
**Auth**: Bearer JWT (role: ADMIN)  
**Response 200**: `{ totalUsers: number, totalCreators: number, totalPodcasts: number, totalEpisodes: number }`

---

## DTO Reference

### UserDto
```json
{ "id", "name", "email", "role", "isActive", "createdAt" }
```

### UserSummaryDto
```json
{ "id", "name", "avatarUrl" }
```

### CreatorProfileDto
```json
{ "id", "userId", "name", "bio", "avatarUrl", "socialLinks", "followerCount", "podcastCount", "createdAt" }
```

### PodcastDto
```json
{ "id", "title", "description", "coverImageUrl", "creatorId", "creator": "UserSummaryDto", "episodeCount", "createdAt" }
```

### EpisodeDto
```json
{ "id", "title", "description", "audioFileUrl", "duration", "podcastId", "creatorId", "creator": "UserSummaryDto", "viewsCount", "likesCount", "commentsCount", "createdAt" }
```

### CommentDto
```json
{ "id", "text", "userId", "user": "UserSummaryDto", "episodeId", "createdAt" }
```
