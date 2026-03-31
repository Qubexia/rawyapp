# Data Model: Admin Dashboard

**Feature**: Admin Dashboard  
**Branch**: 005-d-projects-rawyapp

## Entities

### User
- `id`: string (MongoDB ObjectId)
- `name`: string (optional)
- `email`: string (unique)
- `role`: enum (USER, CREATOR, ADMIN)
- `status`: enum (ACTIVE, INACTIVE)
- `avatar`: string (optional, URL)
- `location`: string (optional)
- `createdAt`: Date
- `updatedAt`: Date

### Creator (extends User)
- `showName`: string
- `bio`: string (optional)
- `followerCount`: number
- `podcastCount`: number

### Podcast
- `id`: string (MongoDB ObjectId)
- `title`: string
- `description`: string
- `category`: string
- `coverImage`: string (URL)
- `creatorId`: string (User reference)
- `episodeCount`: number
- `createdAt`: Date
- `updatedAt`: Date

### Episode
- `id`: string (MongoDB ObjectId)
- `title`: string
- `description`: string
- `image`: string (URL, optional)
- `podcastId`: string (Podcast reference)
- `viewsCount`: number
- `likesCount`: number
- `createdAt`: Date
- `updatedAt`: Date

### Comment
- `id`: string (MongoDB ObjectId)
- `text`: string
- `episodeId`: string (Episode reference)
- `userId`: string (User reference)
- `createdAt`: Date

### Notification
- `id`: string (MongoDB ObjectId)
- `title`: string
- `body`: string
- `targetRole`: enum (USER, CREATOR, ADMIN, ALL)
- `sentBy`: string (Admin user ID)
- `sentAt`: Date

### AuditLog
- `id`: string (MongoDB ObjectId)
- `adminId`: string (Admin user ID)
- `action`: string (CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, PROMOTE, etc.)
- `targetType`: string (User, Podcast, Episode, Comment, etc.)
- `targetId`: string
- `timestamp`: Date
- `details`: object (optional)

## Relationships

```
User (1) ───< Creator
User (1) ───< Podcast (as creator)
Podcast (1) ───< Episode
Episode (1) ───< Comment
User (1) ───< Notification (as recipient)
User (1) ───< AuditLog (as admin)
```

## State Transitions

### User Status
- ACTIVE → INACTIVE (deactivate)
- INACTIVE → ACTIVATE (activate)

### User Role
- USER → CREATOR (promote)
- USER → ADMIN (promote)
- CREATOR → USER (remove creator status)

### Podcast
- Active → Deleted (cascade deletes episodes)

### Episode
- Active → Deleted

### Comment
- Active → Deleted

## Validation Rules

- Email: valid format, unique
- Role: only USER, CREATOR, ADMIN
- Status: only ACTIVE, INACTIVE
- Podcast category: must be from predefined list
- Notification targetRole: USER, CREATOR, ADMIN, or ALL

## Pagination

All list endpoints support:
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `sortBy`: string (optional)
- `sortOrder`: asc | desc (default: desc)