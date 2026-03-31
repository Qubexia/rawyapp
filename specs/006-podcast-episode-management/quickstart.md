# Quickstart: Podcast and Episode Management

## Prerequisites

- Node.js 18+
- MongoDB instance running
- Backend server running on port 3000
- Frontend server running on port 3001 (or as configured)

## Backend Setup

```bash
cd backend
npm install
# Configure .env with MongoDB connection and APP_URL
npm run start:dev
```

## Frontend Setup

```bash
cd frontend
npm install
# Configure API base URL if needed
npm run dev
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Run specific test suites
npm test -- podcasts.spec.ts
npm test -- episodes.spec.ts
```

## Key Flows

### 1. Create a Podcast

1. Authenticate as a user with Creator role
2. POST `/podcasts` with title, description, category
3. Podcast created in draft status
4. (Optional) POST `/podcasts/:id/publish` to publish

### 2. Add an Episode

1. Authenticate as the podcast owner (Creator)
2. POST `/episodes` with title, description, audioFileUrl, podcastId
3. Episode created and linked to podcast
4. Podcast's episodeCount increments

### 3. Admin Dashboard

1. Authenticate as Admin
2. GET `/admin/stats` for summary
3. GET `/admin/podcasts` for podcast list
4. GET `/admin/episodes` for episode list
5. PATCH/DELETE endpoints for management

### 4. Backend Connectivity Check

1. Frontend app loads
2. Call GET `/health` or `/admin/system/health`
3. Display connection status to user

## Environment Variables

### Backend (.env)

```
MONGODB_URI=mongodb://localhost:27017/rawyapp
APP_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```
