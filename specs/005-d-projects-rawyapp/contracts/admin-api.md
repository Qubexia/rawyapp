# Admin API Contract

**Feature**: Admin Dashboard  
**Branch**: 005-d-projects-rawyapp

## Overview

The Admin API provides endpoints for managing platform resources. All endpoints require ADMIN role authentication via JWT token.

## Base URL

```
/admin
```

## Authentication

All admin endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/users | List users with pagination, search, filter |
| GET | /admin/users/:userId | Get user details |
| PATCH | /admin/users/:userId | Update user (name, avatar, location) |
| PATCH | /admin/users/:userId/activate | Activate user |
| PATCH | /admin/users/:userId/deactivate | Deactivate user |
| PATCH | /admin/users/:userId/promote | Promote user to CREATOR or ADMIN |
| DELETE | /admin/users/:userId | Delete user (cascade) |

### Creators

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/creators | List creators with pagination |
| GET | /admin/creators/:creatorId | Get creator profile |
| PATCH | /admin/creators/:creatorId | Update creator (showName, bio, avatar) |
| DELETE | /admin/creators/:creatorId | Remove creator status |

### Podcasts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/podcasts | List podcasts with pagination, search, category filter |
| GET | /admin/podcasts/:podcastId | Get podcast details |
| PATCH | /admin/podcasts/:podcastId | Update podcast |
| DELETE | /admin/podcasts/:podcastId | Delete podcast (cascade episodes) |

### Episodes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/episodes | List episodes with pagination, podcast/creator filter |
| GET | /admin/episodes/:episodeId | Get episode details |
| PATCH | /admin/episodes/:episodeId | Update episode |
| DELETE | /admin/episodes/:episodeId | Delete episode |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/comments | List comments with pagination, episode filter |
| GET | /admin/comments/:commentId | Get comment details |
| DELETE | /admin/comments/:commentId | Delete comment |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/analytics/overview | Dashboard overview stats |
| GET | /admin/analytics/top-episodes | Top episodes by views/likes |
| GET | /admin/analytics/top-creators | Top creators by followers |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/notifications | List broadcast history |
| POST | /admin/notifications/broadcast | Send to all users |
| POST | /admin/notifications/broadcast-by-role | Send to specific role |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/system/health | Backend health status |
| GET | /admin/system/config | Non-sensitive config |

## Common Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| search | string | Search term |
| sortBy | string | Sort field |
| sortOrder | asc\|desc | Sort direction |

## Response Formats

### List Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Rate Limiting

Admin endpoints are rate-limited to prevent abuse:
- 100 requests per minute per admin session

## Audit Logging

All admin actions are logged with:
- adminId
- action
- targetType
- targetId
- timestamp
- details (optional)