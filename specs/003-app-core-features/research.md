# Research: App Core Features

**Branch**: `003-app-core-features` | **Date**: 2026-03-08

## R-001: Podcast Category & Search — Backend Support

### Decision
Add a `category` field to the Podcast schema and extend `GET /podcasts` with `search` and `category` query parameters. Use MongoDB `$text` index on `title` + `description` for keyword search, and simple match on `category` field.

### Rationale
- The current `Podcast` schema has no `category` field — it must be added.
- The current `PodcastsController.findAll` only supports `creatorId` filter — `search` and `category` must be added.
- MongoDB `$text` index provides built-in stemming and relevance scoring, is simpler than regex, and scales well for keyword search.
- Alternative: Elasticsearch — rejected as overkill for the current data volume. MongoDB text search is sufficient.

### Alternatives Considered
1. **Regex search** (`$regex` on title/description): Simple but slow on large collections, no relevance scoring.
2. **Elasticsearch**: Powerful full-text search but requires separate infrastructure, overkill for MVP.
3. **Atlas Search**: Good option but ties to MongoDB Atlas, not currently confirmed as the hosting platform.

### Implementation Impact
- **Backend**: Add `category` field to `podcast.schema.ts`, add `$text` index, update `PodcastsService.findAll()` and `PodcastsController.findAll()` to accept `search` and `category` query params.
- **Frontend**: Update `podcasts.service.ts` and `use-podcasts.ts` hooks to pass search/category params.

---

## R-002: Views Frontend Integration

### Decision
Create a `views.service.ts` frontend service and a `use-views.ts` React Query hook. Integrate view recording into `PlayerContext.playEpisode()`. The view API call is fire-and-forget (no error shown to user).

### Rationale
- The backend already has a fully functional views module (`POST /views/episodes/:episodeId`) that handles idempotency.
- The best place to trigger view recording is in `PlayerContext.playEpisode()` — this is the single entry point for all playback actions.
- The call should be fire-and-forget: the user should never see an error if view recording fails (network issue, etc.).
- `viewsCount` is already part of the `Episode` schema on the backend — it just needs to be displayed on the frontend.

### Alternatives Considered
1. **Record view on episode card tap** (before playback): Would record views for users who tap but don't actually listen.
2. **Record view after duration threshold**: More accurate engagement metric but adds complexity and was explicitly rejected in clarification.

---

## R-003: Change Password Backend Endpoint

### Decision
Add `PATCH /auth/change-password` endpoint to `AuthController`. Requires `currentPassword` and `newPassword`. Validates current password with bcrypt comparison before updating.

### Rationale
- No change-password endpoint exists in the current backend.
- `PATCH` method is appropriate as it partially updates the user resource.
- Placing it in `AuthController` (not `UsersController`) keeps authentication-related logic together with existing register/login/logout methods.
- Minimum password length: 8 characters (matching existing `RegisterDto` validation).

### Alternatives Considered
1. **PUT /users/me/password**: Would work but mixes concerns — password management is an auth concern.
2. **OTP-based verification instead of current password**: More complex, better suited for "forgot password" flow which is outside scope.

---

## R-004: Delete Account Backend Endpoint

### Decision
Add `DELETE /users/me` endpoint to `UsersController`. Requires password re-entry in the request body. Performs cascade delete of all user data: creator profile, podcasts, episodes (with their audio files, views, likes, comments), follows, and the user record itself.

### Rationale
- Cascade deletion is consistent with the existing `PodcastsService.delete()` pattern which already cascades to episodes.
- Password re-entry was confirmed as a security requirement during clarification.
- Placing in `UsersController` (not `AuthController`) is appropriate since it's a user account lifecycle operation, not an auth flow.
- The cascade order matters: episodes → podcasts → creator profile → follows → user to avoid foreign key reference issues.

### Alternatives Considered
1. **Soft delete (deactivate)**: `UsersService.deactivateUser()` already exists, but the user explicitly requested permanent deletion.
2. **Background job for cascade delete**: Better for performance but adds infrastructure complexity. Synchronous cascade is acceptable for MVP given the expected data volume per user.

---

## R-005: Push Notification Preference Storage

### Decision
Store push notification preference locally using AsyncStorage. The backend already supports device token registration (`POST /users/me/device-token`), so the frontend toggle will register/unregister the device token and persist the preference state.

### Rationale
- The backend already has `addDeviceToken` and `removeDeviceToken` methods.
- AsyncStorage is the simplest persistence mechanism for a boolean preference that only affects the local device.
- When toggled ON: register the FCM token. When toggled OFF: unregister the token.

### Alternatives Considered
1. **Store preference on backend only**: Would require a new endpoint and schema field. Overengineered for a device-local setting.
2. **Store in user schema**: Would work but notification preference is per-device, not per-account.

---

## R-006: Terms & Conditions Content Strategy

### Decision
Embed Terms & Conditions as a static string constant within the app. Create a reusable `TermsScreen` component that renders the text in a scrollable `ScrollView` with proper heading hierarchy.

### Rationale
- The spec confirms T&C is static content that rarely changes.
- Embedding as a constant avoids network requests and ensures the content is always available (works offline).
- A future migration to a CMS or API-fetched content is trivial — just replace the static import with an API call.

### Alternatives Considered
1. **Fetch from backend API**: Adds a network dependency for rarely-changing content. Better suited for a future phase.
2. **WebView loading an HTML page**: Introduces WebView dependency and loses control over styling. Rejected.
3. **Markdown file bundled as asset**: More flexible for long documents but adds a markdown renderer dependency.
