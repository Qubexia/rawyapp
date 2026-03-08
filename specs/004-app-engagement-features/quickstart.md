# Quickstart: App Engagement Features

**Branch**: `004-app-engagement-features`  
**Date**: 2026-03-08

## Prerequisites

- Node.js 18+
- MongoDB instance running (local or Atlas)
- Firebase project with service account JSON (for push notifications)
- Expo CLI (`npx expo`)
- Android/iOS emulator or physical device

## Environment Setup

### Backend (`backend/`)

```bash
cd backend
npm install

# .env (ensure these are set)
MONGODB_URI=mongodb://localhost:27017/rawy
JWT_SECRET=your-jwt-secret
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
APP_URL=http://localhost:3000
```

### Frontend (`rawy/`)

```bash
cd rawy
npm install

# Ensure expo-notifications and expo-location are installed
npx expo install expo-notifications expo-location
```

## New Dependencies to Install

### Backend
No new npm packages required — all features use existing dependencies (`@nestjs/mongoose`, `firebase-admin`, etc.).

### Frontend
```bash
cd rawy
npx expo install expo-notifications expo-location
```

## Implementation Order

Follow this order — each feature builds on the previous:

| Phase | Feature | Backend | Frontend | Depends On |
|-------|---------|---------|----------|------------|
| 1 | Comment Threading (Replies) | Extend Comment schema + controller | Reply UI in episode screen | — |
| 2 | Comment Likes | New CommentLike module | Like button on comments | Phase 1 |
| 3 | Following System Improvements | Minor service updates | Profile UI updates | — |
| 4 | In-App Notifications | New Notification schema + controller | Notifications tab (5th tab) | Phases 1–3 |
| 5 | Firebase Push Notifications | Extend NotificationsService | expo-notifications setup | Phase 4 |
| 6 | Personalized Feed | New Feed module | Home tab redesign | Phase 3 |
| 7 | User Suggestions | Suggestions endpoint + geo queries | Horizontal suggestion list | Phase 3 |
| 8 | Deep Linking | Domain config files | Expo Router config | — |
| 9 | View Count Fix | — (backend is correct) | Fix duplicate `recordView` calls | — |
| 10 | Episode Screen UX | — | Layout/design polish | Phases 1–2 |
| 11 | General UX | — | Spacing, transitions, feedback | All above |

## Key Files to Create/Modify

### Backend — New Files
```
backend/src/notifications/schemas/notification.schema.ts
backend/src/notifications/notifications.controller.ts
backend/src/notifications/dto/
backend/src/comment-likes/comment-likes.module.ts
backend/src/comment-likes/comment-likes.controller.ts
backend/src/comment-likes/comment-likes.service.ts
backend/src/comment-likes/schemas/comment-like.schema.ts
backend/src/feed/feed.module.ts
backend/src/feed/feed.controller.ts
backend/src/feed/feed.service.ts
backend/src/suggestions/suggestions.module.ts
backend/src/suggestions/suggestions.controller.ts
backend/src/suggestions/suggestions.service.ts
```

### Backend — Modified Files
```
backend/src/notifications/notifications.module.ts  (add MongooseModule, controller)
backend/src/notifications/notifications.service.ts (add notification CRUD + push expansion)
backend/src/comments/schemas/comment.schema.ts      (add parentCommentId, likesCount)
backend/src/comments/comments.service.ts            (replies logic, cascade delete)
backend/src/comments/comments.controller.ts         (replies endpoint)
backend/src/users/schemas/user.schema.ts            (add location, pushEnabled)
backend/src/users/users.controller.ts               (location + device-token + push-pref endpoints)
backend/src/users/users.service.ts                  (location + push methods)
backend/src/app.module.ts                           (register new modules)
```

### Frontend — New Files
```
rawy/app/(tabs)/notifications.tsx
rawy/services/notifications.service.ts
rawy/services/comment-likes.service.ts
rawy/services/feed.service.ts
rawy/hooks/queries/use-notifications.ts
rawy/hooks/queries/use-comment-likes.ts
rawy/hooks/queries/use-feed.ts
rawy/components/NotificationItem.tsx
rawy/components/CommentItem.tsx
rawy/components/SuggestionCard.tsx
rawy/utils/deep-link.ts
rawy/utils/push-notifications.ts
```

### Frontend — Modified Files
```
rawy/app/(tabs)/_layout.tsx         (add 5th tab)
rawy/app/(tabs)/index.tsx           (personalized feed)
rawy/app/(tabs)/explore.tsx         (suggestions section)
rawy/app/episode/[id].tsx           (UX improvements, comments upgrade)
rawy/app/_layout.tsx                (deep link config, notification handlers)
rawy/services/comments.service.ts   (reply support)
rawy/hooks/queries/use-comments.ts  (replies queries)
```

## Verification Steps

After each phase, verify:

1. **Backend**: `cd backend && npm run start:dev` — server starts without errors
2. **Swagger**: Visit `http://localhost:3000/api` — new endpoints visible
3. **Frontend**: `cd rawy && npx expo start` — app launches
4. **Test flow**: Follow each acceptance scenario from the spec

## Key Patterns Reference

- **Backend modules**: Follow NestJS pattern: `module.ts` → `controller.ts` → `service.ts` → `schemas/` → `dto/`
- **Frontend services**: Follow existing pattern in `rawy/services/*.service.ts` — axios-based API calls
- **React Query hooks**: Follow existing pattern in `rawy/hooks/queries/` — `useQuery` + `useMutation`
- **Optimistic updates**: Use `queryClient.setQueryData` for immediate UI feedback, `onError` rollback
- **Pagination**: Use `PaginatedResponseDto` pattern (backend) and infinite scroll queries (frontend)
