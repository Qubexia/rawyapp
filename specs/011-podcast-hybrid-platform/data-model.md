# Data Model: Rawy Hybrid Podcast Platform

**Note**: This feature EXTENDS the existing backend schemas at `backend/src/`. Existing User, Podcast schemas will be enhanced with new fields.

## Existing Schema Extensions

### User Schema (existing at `backend/src/users/schemas/user.schema.ts`)

**New fields to add**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subscriptions | ObjectId[] | No | Array of subscribed Podcast IDs |

### Podcast Schema (existing at `backend/src/podcasts/schemas/podcast.schema.ts`)

**New fields to add**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | enum | Yes | 'external' or 'internal' (NEW - hybrid model) |
| feedUrl | string | No* | RSS feed URL (*for external) |
| autoSync | boolean | Yes | Enable auto-sync (default: true) |
| appleId | string | No | Apple Podcasts ID (for external) |

## Entities

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ObjectId | Yes | Unique MongoDB document ID |
| email | string | Yes | User email (unique) |
| passwordHash | string | Yes | Bcrypt hashed password |
| role | enum | Yes | USER, CREATOR, ADMIN (default: USER) |
| createdAt | Date | Yes | Account creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

**Relationships**:
- One-to-Many with Podcast (ownerId): User can own multiple podcasts
- One-to-Many with ClaimRequest: User can have multiple claim requests

---

### Podcast

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ObjectId | Yes | Unique MongoDB document ID |
| title | string | Yes | Podcast title |
| description | string | No | Podcast description |
| source | enum | Yes | 'external' or 'internal' |
| feedUrl | string | No* | RSS feed URL (*required for external) |
| ownerId | ObjectId | No* | Reference to User (*required for internal/claimed) |
| autoSync | boolean | Yes | Enable auto-sync (default: true) |
| appleId | string | No | Apple Podcasts ID (for external) |
| artworkUrl | string | No | Podcast artwork URL |
| author | string | No | Podcast author |
| createdAt | Date | Yes | Creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

**Relationships**:
- Many-to-One with User (ownerId): Each podcast owned by one user
- One-to-Many with Episode: Podcast contains multiple episodes

---

### Episode

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ObjectId | Yes | Unique MongoDB document ID |
| podcastId | ObjectId | Yes | Reference to Podcast |
| title | string | Yes | Episode title |
| description | string | No | Episode description |
| source | enum | Yes | 'external' or 'internal' |
| audioUrl | string | No* | External audio URL (*required for external) |
| audioStoragePath | string | No* | Local file path (*required for internal) |
| guid | string | No | RSS GUID for external episodes |
| pubDate | Date | Yes | Publication date |
| duration | number | No | Duration in seconds |
| artworkUrl | string | No | Episode artwork |
| createdAt | Date | Yes | Creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

**Relationships**:
- Many-to-One with Podcast: Each episode belongs to one podcast

---

### ClaimRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ObjectId | Yes | Unique MongoDB document ID |
| userId | ObjectId | Yes | Reference to User requesting claim |
| podcastId | ObjectId | Yes | Reference to Podcast being claimed |
| verificationToken | string | Yes | Email verification token |
| status | enum | Yes | 'pending', 'verified', 'expired' (default: pending) |
| requestedAt | Date | Yes | Request timestamp |
| verifiedAt | Date | No | Verification timestamp |
| expiresAt | Date | Yes | Token expiration (24h from request) |

**Relationships**:
- Many-to-One with User: Each claim request belongs to one user
- Many-to-One with Podcast: Each claim request targets one podcast

---

## Validation Rules

| Entity | Rule |
|--------|------|
| User.email | Must be valid email format, unique |
| User.passwordHash | Must be bcrypt hash, min 8 chars raw input |
| Podcast.title | Required, max 200 chars |
| Podcast.source | Required, must be 'external' or 'internal' |
| Podcast.feedUrl | Required if source='external', valid URL format |
| Podcast.ownerId | Required if source='internal' |
| Episode.title | Required, max 500 chars |
| Episode.source | Required, must match parent Podcast.source |
| Episode.pubDate | Required, cannot be future date |
| ClaimRequest.verificationToken | Required, unique, 32-char random string |

---

## State Transitions

### User Role

```
USER → (claim verified) → CREATOR
CREATOR → (admin action) → ADMIN
```

### ClaimRequest Status

```
pending → (verified) → verified
pending → (expired) → expired
```

---

## Indexes

| Collection | Index | Fields | Purpose |
|------------|-------|--------|---------|
| users | unique | email | Login lookups |
| podcasts | compound | { ownerId, source } | Creator's podcasts |
| podcasts | unique | feedUrl | External feed deduplication |
| episodes | compound | { podcastId, pubDate } | Episode queries |
| episodes | compound | { podcastId, guid } | External GUID dedup |
| claims | unique | verificationToken | Token verification |
| claims | compound | { userId, podcastId } | Unique claim per podcast |
