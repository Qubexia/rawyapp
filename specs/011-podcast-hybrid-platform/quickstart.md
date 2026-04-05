# Quickstart: Rawy Hybrid Podcast Platform

**Note**: This feature EXTENDS the existing backend at `backend/src/`. Do NOT create a new backend project.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Setup

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Environment Variables

Create `.env` in `backend/`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/rawy

# JWT (values must be ≥32 characters)
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars-long
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Admin seeding
ADMIN_EMAIL=admin@rawy.app
ADMIN_PASSWORD=Admin1234!

# Server
PORT=3000
NODE_ENV=development
```

### 3. Database

```bash
# Start local MongoDB or use Atlas connection
# Ensure MONGODB_URI is configured
```

### 4. Run Backend

```bash
cd backend
npm run start:dev
```

API available at `http://localhost:3000`

## Development Workflow

### Running Tests

```bash
# Backend tests
npm test

# With coverage
npm run test:cov
```

### Linting

```bash
npm run lint
```

## Key Modules

| Module | Path | Purpose |
|--------|------|---------|
| Auth | `backend/src/auth/` | JWT authentication, guards |
| Users | `backend/src/users/` | User entity, service |
| Podcasts | `backend/src/podcasts/` | Podcast CRUD, sync |
| Episodes | `backend/src/episodes/` | Episode management |
| Sync | `backend/src/sync/` | RSS sync Cron job |
| Claims | `backend/src/claims/` | Podcast ownership claims |

## API Testing

### Register User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Discover Podcasts

```bash
curl http://localhost:3000/podcasts/discover \
  -H "Authorization: Bearer <token>"
```

## Architecture Notes

- Role-based access enforced at service layer
- External sync uses Cron job (default: every 6 hours)
- Internal podcasts fenced from external sync (data fencing)
- Deduplication: 80% title similarity + same week detection
