# Quickstart: App Core Features

**Branch**: `003-app-core-features` | **Date**: 2026-03-08

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (`npx expo`)
- Backend running locally on port 3000 (`cd backend && npm run start:dev`)
- MongoDB running locally (or connection configured in `.env`)

## Setup

```bash
# 1. Ensure you're on the right branch
git checkout 003-app-core-features

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd rawy && npm install

# 4. Start backend
cd backend && npm run start:dev

# 5. Start frontend
cd rawy && npx expo start
```

## Key Files by Feature

### Explore Page (US1)
| Layer | File | Purpose |
|-------|------|---------|
| Backend Schema | `backend/src/podcasts/schemas/podcast.schema.ts` | Add `category` field + text index |
| Backend Controller | `backend/src/podcasts/podcasts.controller.ts` | Add `search` and `category` query params |
| Backend Service | `backend/src/podcasts/podcasts.service.ts` | Implement text search + category filter |
| Frontend Screen | `rawy/app/(tabs)/explore.tsx` | UI with images, search, categories |
| Frontend Service | `rawy/services/podcasts.service.ts` | Pass search/category to API |
| Frontend Hook | `rawy/hooks/queries/use-podcasts.ts` | React Query hook with params |

### Views System (US2)
| Layer | File | Purpose |
|-------|------|---------|
| Backend (existing) | `backend/src/views/` | Full module exists |
| Frontend Service | `rawy/services/views.service.ts` | **New** — API call wrapper |
| Frontend Hook | `rawy/hooks/queries/use-views.ts` | **New** — mutation hook |
| Frontend Integration | `rawy/context/player-context.tsx` | Add view recording on playEpisode |

### Library Following (US3)
| Layer | File | Purpose |
|-------|------|---------|
| Backend (existing) | `backend/src/follows/` | Full module exists |
| Frontend Screen | `rawy/app/(tabs)/library.tsx` | Enhance Following segment |
| Frontend Hook | `rawy/hooks/queries/use-follows.ts` | Already has useFollowing, useToggleFollow |

### Auth Modification (US4)
| Layer | File | Purpose |
|-------|------|---------|
| Frontend | `rawy/app/(auth)/onboarding.tsx` | Change navigation to login |
| Frontend | `rawy/app/(auth)/login.tsx` | Add password toggle + T&C link |
| Frontend | `rawy/app/(auth)/register.tsx` | Add password toggle + T&C link |

### Settings Enhancement (US5)
| Layer | File | Purpose |
|-------|------|---------|
| Backend Controller | `backend/src/auth/auth.controller.ts` | Add changePassword endpoint |
| Backend Service | `backend/src/auth/auth.service.ts` | Implement changePassword logic |
| Backend Controller | `backend/src/users/users.controller.ts` | Add deleteAccount endpoint |
| Backend Service | `backend/src/users/users.service.ts` | Implement cascade delete |
| Frontend Screen | `rawy/app/(profile)/settings.tsx` | Full settings UI |
| Frontend Screen | `rawy/app/(profile)/change-password.tsx` | **New** — change password form |

### Terms & Conditions (US6)
| Layer | File | Purpose |
|-------|------|---------|
| Frontend Screen | `rawy/app/(legal)/terms.tsx` | **New** — T&C page |
| Frontend Constants | `rawy/constants/terms.ts` | **New** — static T&C text |

## Testing Strategy

### Backend
- Unit test `changePassword` service method (correct password, wrong password, weak new password)
- Unit test `deleteAccount` service method (cascade order, password verification)
- Unit test `findAll` with search/category params

### Frontend
- Verify Explore page loads with images, search filters correctly, category chips work
- Verify playEpisode records view (mock API call)
- Verify Library Following shows creators with unfollow action
- Verify onboarding navigates to login (not register)
- Verify password toggle works on login/register
- Verify settings toggles persist, change password form validates, delete account shows confirmation

## Environment Variables

No new environment variables required. All features use existing backend configuration.
