# Data Model

## Existing Entities

### Podcast
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| title | String | Podcast title |
| description | String | Podcast description |
| coverImage | String (URL) | Cover image URL |
| creatorId | ObjectId | Reference to User |
| episodes | Episode[] | Array of episodes |
| createdAt | Date | Creation timestamp |

### User
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| email | String | User email |
| name | String | Display name |
| role | Enum: 'user', 'creator', 'admin' | User role |
| avatar | String (URL) | Profile image URL |
| authProvider | Enum: 'email', 'google', 'facebook' | Authentication method |
| googleId | String | Google OAuth ID (if using Google auth) |

### Suggestion (Who to Follow)
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| userId | ObjectId | Reference to User |
| type | Enum: 'follow', 'podcast' | Suggestion type |

## Relationships

- Podcast belongs to User (creator)
- User has role (determines if admin)
- Suggestion references User

## State Transitions

- User role: user → creator (via becoming creator flow)
- User auth: email ↔ OAuth (if linking accounts)

## Bug Fix Scope

This feature addresses display and filtering issues without schema changes:
1. **Cover image display**: Frontend component rendering fix
2. **Explore/Library layout**: CSS/layout adjustments
3. **Google Auth**: Backend auth flow fix
4. **Admin filtering**: Query filter addition in suggestions service
