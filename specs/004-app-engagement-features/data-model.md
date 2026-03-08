# Data Model: App Engagement Features

**Branch**: `004-app-engagement-features`  
**Date**: 2026-03-08  
**Database**: MongoDB (via Mongoose ODM)

## Entity Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│    User      │────▶│CreatorProfile│     │  Podcast  │
│              │     │              │     │           │
│ +location    │     └──────────────┘     └─────┬─────┘
│ +pushEnabled │                                │
└──────┬───────┘                          ┌─────▼─────┐
       │                                  │  Episode   │
       │     ┌──────────────┐             │           │
       ├────▶│ Notification │             └─────┬─────┘
       │     │   (NEW)      │                   │
       │     └──────────────┘             ┌─────▼─────┐
       │                                  │  Comment   │
       ├────▶│    Follow    │◀────┐       │ +parentId  │
       │     └──────────────┘     │       └─────┬─────┘
       │                          │             │
       ├────▶│    View      │     │       ┌─────▼───────┐
       │     └──────────────┘     │       │ CommentLike │
       │                          │       │   (NEW)     │
       └────▶│    Like      │     │       └─────────────┘
             └──────────────┘     │
                                  │
                            (can follow
                             users too)
```

---

## NEW Entities

### Notification (NEW)

Stores in-app notifications with aggregation support. Auto-deleted after 90 days via TTL index.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `ObjectId` | auto | Primary key |
| `recipientId` | `ObjectId` (ref: User) | ✅ | User who receives the notification |
| `type` | `String` (enum) | ✅ | One of: `new_episode`, `comment_reply`, `comment_like`, `new_follower` |
| `lastActorId` | `ObjectId` (ref: User) | ✅ | Most recent user who triggered the notification |
| `actorCount` | `Number` | ✅ (default: 1) | Number of aggregated actors (e.g., "Ahmed and 12 others") |
| `targetId` | `ObjectId` | ✅ | Reference to the target entity (episode, comment, or user depending on type) |
| `targetModel` | `String` (enum) | ✅ | One of: `Episode`, `Comment`, `User` — discriminator for targetId |
| `episodeId` | `ObjectId` (ref: Episode) | ❌ | Episode context (for comment_reply and comment_like types) |
| `previewText` | `String` | ❌ | Short preview (e.g., reply text, max 100 chars) |
| `isRead` | `Boolean` | ✅ (default: false) | Whether the user has read this notification |
| `createdAt` | `Date` | auto | Mongoose timestamp — TTL index base |
| `updatedAt` | `Date` | auto | Mongoose timestamp |

**Indexes**:
- `{ recipientId: 1, isRead: 1, updatedAt: -1 }` — for listing unread-first, reverse chronological
- `{ recipientId: 1, type: 1, targetId: 1 }` — compound unique for aggregation upsert
- `{ createdAt: 1 }` — TTL index with `expireAfterSeconds: 7776000` (90 days)

**Aggregation Rule**: When a new event matches an existing `(recipientId + type + targetId)` combination, the existing document is updated: `lastActorId` replaced, `actorCount` incremented, `isRead` reset to `false`, `updatedAt` bumped.

**Validation**:
- `type` must be one of the enum values
- `recipientId` must reference a valid active user
- `lastActorId` must NOT equal `recipientId` (no self-notifications)
- `previewText` max length: 100 characters

---

### CommentLike (NEW)

Tracks unique user-comment like events. One entry per user-comment pair.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `ObjectId` | auto | Primary key |
| `userId` | `ObjectId` (ref: User) | ✅ | User who liked |
| `commentId` | `ObjectId` (ref: Comment) | ✅ | Comment that was liked |
| `createdAt` | `Date` | auto | Mongoose timestamp |
| `updatedAt` | `Date` | auto | Mongoose timestamp |

**Indexes**:
- `{ userId: 1, commentId: 1 }` — compound unique (prevents duplicate likes)
- `{ commentId: 1 }` — for counting likes on a comment

**Validation**:
- `userId` + `commentId` must be unique (enforced by compound unique index)
- Both must reference valid existing documents

---

## MODIFIED Entities

### User (MODIFIED)

Add location and push notification preference fields.

| New Field | Type | Required | Description |
|-----------|------|----------|-------------|
| `location` | `Object` (embedded) | ❌ | City-level location |
| `location.city` | `String` | ❌ | City name (e.g., "Cairo") |
| `location.coordinates` | `[Number, Number]` | ❌ | `[longitude, latitude]` rounded to ~10km |
| `pushEnabled` | `Boolean` | ✅ (default: true) | Whether push notifications are enabled |

**New Indexes**:
- `{ 'location.coordinates': '2dsphere' }` — geospatial index for nearby queries (sparse, only indexes docs with coordinates)

**Existing Fields (unchanged)**: `name`, `email`, `passwordHash`, `role`, `isActive`, `googleId`, `facebookId`, `deviceTokens[]`, `refreshToken`, `avatarUrl`, `followerCount`, `followingCount`

---

### Comment (MODIFIED)

Add threading support and comment-level like count.

| New Field | Type | Required | Description |
|-----------|------|----------|-------------|
| `parentCommentId` | `ObjectId` (ref: Comment) | ❌ | If set, this comment is a reply to the referenced comment. `null` = top-level comment |
| `likesCount` | `Number` | ✅ (default: 0) | Denormalized count of likes on this comment |

**New Indexes**:
- `{ parentCommentId: 1, createdAt: 1 }` — for fetching replies to a comment in chronological order

**Nesting Rule**: If a comment being replied to has its own `parentCommentId` (i.e., it's already a reply), the new reply's `parentCommentId` is set to the root comment's `_id` instead. This enforces one-level nesting.

**Existing Fields (unchanged)**: `text`, `userId`, `episodeId`, `createdAt`, `updatedAt`

**Cascade**: When a parent comment is deleted, all replies (`parentCommentId = parentId`) are also deleted. The episode's `commentsCount` is decremented by `1 + replyCount`.

---

### Follow (MODIFIED — conceptual only)

The existing Follow schema already uses `followerId` and `creatorId` as generic ObjectId refs to User. The follow service already supports following any user (despite the field name). **No schema change needed** — the field is named `creatorId` but references the User collection, so it works for both user-following and creator-following. The service logic already handles both cases.

**Existing Fields (unchanged)**: `followerId`, `creatorId`, `createdAt`, `updatedAt`
**Existing Indexes (unchanged)**: `{ followerId: 1, creatorId: 1 }` (unique), `{ creatorId: 1 }`, `{ followerId: 1 }`

---

## UNCHANGED Entities

### Episode
No schema changes. Fields: `title`, `description`, `audioFileUrl`, `duration`, `podcastId`, `creatorId`, `viewsCount`, `likesCount`, `commentsCount`, `imageUrl`

### Podcast
No schema changes. Fields: `title`, `description`, `coverImageUrl`, `creatorId`, `episodeCount`, `category`

### CreatorProfile
No schema changes. Fields: `userId`, `bio`, `avatarUrl`, `showName`, `socialLinks`, `followerCount`, `podcastCount`

### Like (Episode Likes)
No schema changes. Fields: `userId`, `episodeId`

### View
No schema changes. Fields: `userId`, `episodeId`. (View count fix is frontend-only.)

---

## State Transitions

### Notification Lifecycle

```
[Event Occurs] → Check if (recipientId + type + targetId) exists
    ├── No  → CREATE new notification (isRead: false, actorCount: 1)
    └── Yes → UPDATE existing (actorCount++, lastActorId, isRead: false)

[User taps notification] → isRead = true, navigate to target

[User taps "Mark all as read"] → Bulk update: isRead = true (for recipientId)

[90 days pass] → TTL index auto-deletes the document
```

### Comment Like Lifecycle

```
[User taps like] → Check CommentLike exists (userId + commentId)
    ├── No  → CREATE CommentLike, INCREMENT comment.likesCount
    └── Yes → (already liked, this is an unlike)
              DELETE CommentLike, DECREMENT comment.likesCount
```
