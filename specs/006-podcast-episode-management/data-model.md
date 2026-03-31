# Data Model: Podcast and Episode Management

## Entities

### Podcast

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ObjectId | Auto | Unique identifier |
| title | string | Yes | Podcast title (3-100 chars) |
| description | string | Yes | Podcast description (10-2000 chars) |
| coverImageUrl | string | No | URL to cover image |
| creatorId | ObjectId | Yes | Reference to creator (User) |
| episodeCount | number | Auto | Count of episodes (default: 0) |
| category | enum | No | Category: Technology, Business, Comedy, Education, Health, Science, Culture, Sports |
| status | enum | Yes | Lifecycle state: draft, published |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

**Relationships**:
- One Creator (User) can have many Podcasts
- One Podcast has many Episodes

### Episode

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ObjectId | Auto | Unique identifier |
| title | string | Yes | Episode title (3-200 chars) |
| description | string | Yes | Episode description (10-5000 chars) |
| audioFileUrl | string | Yes | URL to audio file |
| duration | number | No | Duration in seconds |
| podcastId | ObjectId | Yes | Reference to Podcast |
| creatorId | ObjectId | Yes | Reference to creator (User) |
| viewsCount | number | Auto | View count (default: 0) |
| likesCount | number | Auto | Like count (default: 0) |
| commentsCount | number | Auto | Comment count (default: 0) |
| imageUrl | string | No | URL to episode image |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

**Relationships**:
- One Podcast has many Episodes
- One Creator (User) can have many Episodes

### User (Role-based)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | enum | Yes | user, creator, admin |

## State Transitions

### Podcast Lifecycle

```
draft → published (creator publishes)
published → draft (creator unpublishes)
draft/published → deleted (creator or admin)
```

### Episode Lifecycle

```
new → active (upon creation)
active → deleted (creator or admin)
```

## Validation Rules

### Podcast

- title: 3-100 characters
- description: 10-2000 characters
- category: must be one of defined enum values
- status: must be 'draft' or 'published'
- creatorId: must reference valid User with creator role

### Episode

- title: 3-200 characters
- description: 10-5000 characters
- audioFileUrl: required, valid URL format
- duration: optional, non-negative number
- podcastId: must reference existing Podcast
- creatorId: must reference valid User; must match Podcast.creatorId

## Indexes

### Podcast
- creatorId (for creator's podcasts)
- createdAt (sorting)
- category (filtering)
- title + description (text search)
- status (filtering)

### Episode
- podcastId + createdAt (episode list per podcast)
- creatorId (creator's episodes)
- createdAt (sorting)
