# Research: App Engagement Features

**Branch**: `004-app-engagement-features`  
**Date**: 2026-03-08  
**Status**: Complete

## R-001: In-App Notification Storage & Aggregation Pattern

**Decision**: Store notifications in a dedicated MongoDB `Notification` collection with a TTL index for 90-day auto-deletion. Aggregation is handled at the application layer — when a new event arrives for the same (type + targetId + recipientId) combination, the existing notification is updated (increment `actorCount`, update `lastActorId`, reset `isRead` to false, bump `updatedAt`) rather than creating a new document.

**Rationale**: MongoDB TTL indexes natively support automatic document expiration — setting `expireAfterSeconds: 7776000` (90 days) on the `createdAt` field eliminates the need for a scheduled cleanup job. Application-level aggregation (upsert pattern) keeps the query model simple — one notification per (type + target + recipient) — which means the unread count query is a simple `countDocuments({ recipientId, isRead: false })` without GROUP BY.

**Alternatives Considered**:
- **Separate aggregation collection**: Would require syncing two collections and add complexity without benefit at current scale.
- **Redis for unread counts**: Adds infrastructure dependency. MongoDB can handle the count queries efficiently with proper indexes at this scale.
- **MongoDB Change Streams for real-time**: Overkill for MVP; polling via React Query's `refetchInterval` (30s) is sufficient initially.

---

## R-002: Firebase Push Notification Expansion

**Decision**: Extend the existing `NotificationsService` to support 4 notification types (new_episode, comment_reply, comment_like, new_follower). Each type has a dedicated method that: (1) creates/updates the in-app notification document, and (2) sends FCM push if the recipient has `pushEnabled: true` and valid device tokens.

**Rationale**: The backend already has `firebase-admin` 13.7 configured, a working `sendNewEpisodeNotification` method, and token cleanup logic. Extending is lower-risk than refactoring. The `sendEachForMulticast` API handles batch delivery and per-token error handling.

**Alternatives Considered**:
- **Separate push service**: Would duplicate token management logic already in NotificationsService.
- **FCM Topic-based messaging**: Not suitable for personalized notifications (comment replies, likes). Topics work for broadcast-style notifications only.
- **OneSignal or other push service**: Additional dependency and vendor lock-in when firebase-admin is already integrated.

---

## R-003: Comment Threading (Replies) Pattern

**Decision**: Add an optional `parentCommentId` field to the existing `Comment` schema. Replies are comments with `parentCommentId` set. Only one level of nesting is enforced at the application layer — if a reply's `parentCommentId` points to a comment that itself has a `parentCommentId`, the reply is reassigned to the root comment.

**Rationale**: Single-field extension to the existing schema is the simplest approach. One-level nesting avoids deep recursion in UI rendering and keeps the query pattern simple: fetch top-level comments (`parentCommentId: null`), then fetch replies per comment (`parentCommentId: <commentId>`). This matches the pattern used by YouTube, Instagram, and similar platforms.

**Alternatives Considered**:
- **Separate Reply collection**: Adds schema and module duplication. Comments and replies share identical fields.
- **Nested document arrays**: MongoDB 16MB document limit and atomic update complexity make this unsuitable for comments with many replies.
- **Materialized path pattern**: Enables arbitrary nesting depth but adds query complexity. One-level is the spec requirement.

---

## R-004: Comment Likes Module

**Decision**: Create a new `CommentLike` schema (`userId` + `commentId`, compound unique index) and a new `comment-likes` NestJS module. This mirrors the existing `Like` module (episode likes) but targets comments. The `Comment` schema gets a denormalized `likesCount` field that is atomically incremented/decremented.

**Rationale**: Separating comment likes from episode likes keeps each module focused and avoids discriminator-based polymorphism which complicates queries. The existing Like schema has `episodeId: required`, so adding comment likes to it would require making `episodeId` optional and adding `commentId` — a breaking change.

**Alternatives Considered**:
- **Polymorphic Like model**: Single `likes` collection with `targetType` (episode/comment) and `targetId`. More flexible but complicates existing episode like queries and requires migration.
- **Extend existing Like schema**: Would break the `episodeId: required` constraint and existing indexes.

---

## R-005: Deep Linking with Expo Universal Links / App Links

**Decision**: Use Expo Router's built-in deep linking with Universal Links (iOS) and App Links (Android). The deep link URL format will be `https://<domain>/episode/<episodeId>`. The domain requires hosting two files: `/.well-known/apple-app-site-association` (iOS) and `/.well-known/assetlinks.json` (Android). Expo's `app.json` is configured with the `intentFilters` (Android) and `associatedDomains` (iOS) entries.

**Rationale**: Expo Router natively handles URL-to-route mapping. The file-based routing pattern `app/episode/[id].tsx` already matches the deep link structure. No third-party SDK is needed — this is purely configuration. Firebase Dynamic Links was deprecated in August 2025.

**Alternatives Considered**:
- **Firebase Dynamic Links**: Deprecated since August 2025. Not recommended for new implementations.
- **Branch.io**: Third-party dependency with ongoing cost. Overkill for a simple episode link.
- **Expo Linking (manual)**: Lower-level API that requires manual parsing. Expo Router's built-in support is preferred.

---

## R-006: Personalized Feed Algorithm

**Decision**: Implement a simple priority-based feed with two sections: (1) "From Your Following" — recent episodes from followed creators, sorted by `createdAt DESC`, and (2) "Recommended for You" — popular episodes the user hasn't seen, from categories matching the user's listening history. A new backend endpoint `GET /feed` handles the logic.

**Rationale**: A simple two-section feed is sufficient for MVP. It provides clear value (followed content first) without requiring ML infrastructure. The query pattern is: fetch followed creator IDs → fetch their recent episodes → fetch trending episodes from other creators, excluding duplicates. All achievable with MongoDB aggregation pipelines.

**Alternatives Considered**:
- **ML-based recommendation engine**: Requires training data, model serving infrastructure, and ongoing tuning. Overkill for MVP.
- **Client-side feed construction**: Multiple API calls from the client to assemble the feed. Higher latency, more complex frontend logic.
- **Collaborative filtering**: Requires significant user interaction data. Not viable at early stage.

---

## R-007: Location-Based Suggestions

**Decision**: Add a `location` embedded document to the User schema with `city` (string) and `coordinates` (coarse lat/lng rounded to ~10km). Use MongoDB's `$geoNear` aggregation with a `2dsphere` index on the coordinates field to find nearby users/creators. Fall back to interest-based (category overlap) suggestions when location is not available.

**Rationale**: MongoDB has native geospatial query support with `2dsphere` indexes. City-level coordinates (~10km precision) provide sufficient granularity for "nearby" without storing exact GPS data. The front end uses `expo-location` to get device coordinates, rounds them, and sends to a `PATCH /users/me/location` endpoint.

**Alternatives Considered**:
- **External geolocation service (Google Maps API)**: Adds dependency and cost. MongoDB native geo queries are sufficient.
- **Store exact GPS coordinates**: Privacy concern and unnecessary precision for this use case.
- **IP-based geolocation**: Server-side IP lookup is less accurate than device GPS, especially on mobile networks.

---

## R-008: View Count Fix — Root Cause Analysis

**Decision**: The likely issues on the frontend are: (1) `recordView` is called in the `PlayerContext` but may fire multiple times if the component re-renders or if `playEpisode` is called redundantly, and (2) the cached episode data in React Query may show stale view counts because the query isn't invalidated after a view is recorded. Fix: add a `Set<string>` of viewed episode IDs in the PlayerContext to prevent duplicate `recordView` calls within the same session, and invalidate the episode query cache after a successful view recording.

**Rationale**: The backend already handles idempotency (compound unique index on `userId + episodeId`). The fix is purely frontend: prevent redundant API calls and ensure UI reflects updated counts. This is a low-risk, high-confidence fix.

**Alternatives Considered**:
- **Backend fix**: Backend is already correct (idempotent). No changes needed.
- **AsyncStorage tracking**: Persisting viewed IDs across sessions is unnecessary since the backend enforces uniqueness.

---

## R-009: Expo Notifications (Frontend FCM Integration)

**Decision**: Use `expo-notifications` package for handling push notifications on the frontend. It provides: (1) token registration via `getExpoPushTokenAsync` or `getDevicePushTokenAsync`, (2) foreground notification handlers, (3) notification tap response handlers for deep navigation, and (4) permission request utilities.

**Rationale**: `expo-notifications` is the official Expo package for push notifications and integrates seamlessly with FCM (Android) and APNs (iOS). The app already has `@react-native-community/push-notification-ios` as a dependency, but `expo-notifications` provides a unified API for both platforms and integrates better with Expo Router for navigation on notification tap.

**Alternatives Considered**:
- **react-native-firebase/messaging**: Works but requires ejecting from Expo managed workflow or using Expo config plugins. `expo-notifications` is simpler.
- **@react-native-community/push-notification-ios**: Already installed but iOS-only. Not a cross-platform solution.
