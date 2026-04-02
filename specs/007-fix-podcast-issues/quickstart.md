# Quickstart Guide

## Bug Fixes Overview

This feature fixes 4 issues in the podcast platform.

## Prerequisites

- Node.js 18+
- MongoDB instance running
- Google OAuth credentials (for auth fixes)

## Running the Application

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Bug Fix Areas

### 1. Podcast Cover Images
- Location: `frontend/src/components/` - podcast card component
- Check: Image URL is properly passed and rendered in `img` tag

### 2. Explore/Library Pages
- Location: `frontend/src/pages/explore.tsx`, `frontend/src/pages/library.tsx`
- Check: Layout styles and responsive CSS

### 3. Google Auth
- Location: `backend/src/auth/` - auth service and controller
- Check: OAuth flow, token handling, callback processing

### 4. Admin Filtering (Who to Follow)
- Location: `backend/src/suggestions/suggestions.service.ts`
- Check: Query filter excludes role='admin'

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Verification

1. Visit Explore page - podcast covers should display
2. Visit Library - subscriptions display correctly
3. Test Google Sign-In flow
4. Check Who to Follow - no admin accounts should appear
