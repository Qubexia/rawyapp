# Data Model: App Core Features

**Branch**: `003-app-core-features` | **Date**: 2026-03-08

## Existing Entities (Modifications)

### Podcast (backend: `podcasts/schemas/podcast.schema.ts`)

**Current fields**: `title`, `description`, `coverImageUrl`, `creatorId`, `episodeCount`, `timestamps`

**New field**:
- `category?: string` — optional, one of: `Technology`, `Business`, `Comedy`, `Education`, `Health`, `Science`, `Culture`, `Sports`. Default: none. Used by Explore page category filter.

**New indexes**:
- Text index on `{ title: 'text', description: 'text' }` — for keyword search on Explore page.
- Index on `{ category: 1 }` — for category filtering.

### Episode (backend: `episodes/schemas/episode.schema.ts`)

No schema changes. The `viewsCount` field already exists.

### View (backend: `views/schemas/view.schema.ts`)

No schema changes. Already has compound unique index on `{ userId, episodeId }`.

### User (backend: `users/schemas/user.schema.ts`)

No schema changes. The `passwordHash`, `deviceTokens`, `isActive` fields already exist and support change-password, notification toggle, and account deletion flows.

### Follow (backend: `follows/schemas/follow.schema.ts`)

No schema changes.

---

## New Entities

### None

No new database entities are required. All features build on existing schemas with minor field additions.

---

## Client-Side State (Frontend Only)

### Notification Preference (AsyncStorage)

| Key | Type | Description |
|-----|------|-------------|
| `@rawy:push_notifications_enabled` | `boolean` | Whether push notifications are enabled. Default: `true`. |

### Search & Filter State (Explore Page — in-memory React state)

| Field | Type | Description |
|-------|------|-------------|
| `searchQuery` | `string` | Current search keyword, debounced before API call |
| `activeCategory` | `string` | Currently selected category chip, default `'All'` |

---

## Data Flow Diagrams

### Explore Page Search + Category Flow

```
User types keyword → (debounce 500ms) → GET /podcasts?search=keyword&category=Technology
                                         ↓
                                  Backend builds filter:
                                    - $text: { $search: keyword }
                                    - category: 'Technology' (if not 'All')
                                         ↓
                                  Returns PaginatedResponse<Podcast>
                                         ↓
                                  Frontend displays podcast cards with images
```

### Views Recording Flow

```
User taps play → PlayerContext.playEpisode(episode)
                     ↓
              Check: isAuthenticated?
                  YES → POST /views/episodes/:episodeId (fire-and-forget)
                  NO  → skip (no view recorded)
                     ↓
              Audio starts playing (regardless of view outcome)
```

### Account Deletion Cascade Flow

```
User taps "Delete Account" → Enter password → POST DELETE /users/me { password }
                                                ↓
                                        Backend cascade:
                                          1. Find all user's podcasts
                                          2. For each podcast: delete episodes (audio files, views, likes, comments)
                                          3. Delete podcasts (cover images)
                                          4. Delete creator profile (if exists)
                                          5. Delete all follows (following + followers)
                                          6. Delete user record
                                                ↓
                                        Response: 200 OK
                                                ↓
                                        Frontend: clear tokens, navigate to login
```

### Change Password Flow

```
User taps "Change Password" → Navigate to ChangePasswordScreen
                                ↓
                        Fill: currentPassword + newPassword + confirmNewPassword
                                ↓
                        Validate: newPassword === confirmNewPassword (client-side)
                        Validate: newPassword.length >= 8 (client-side)
                                ↓
                        PATCH /auth/change-password { currentPassword, newPassword }
                                ↓
                        Backend: verify currentPassword with bcrypt.compare
                          MATCH    → hash newPassword, update user, return 200
                          NO MATCH → return 401 "Current password is incorrect"
                                ↓
                        Frontend: show success toast / error message
```

## Relationships

```
User ──[1:1]──> CreatorProfile (if role=CREATOR)
User ──[1:N]──> Podcast (via creatorId)
Podcast ──[1:N]──> Episode
Episode ──[1:N]──> View (one per user, compound unique)
User ──[N:M]──> User (via Follow: followerId ↔ followingId)
User ──[1:N]──> View (userId)
```
