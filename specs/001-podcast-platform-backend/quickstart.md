# Quickstart: RAWY Podcast Platform – Backend (MVP)

**Branch**: `001-podcast-platform-backend`  
**Date**: 2026-03-03

## Prerequisites

- **Node.js** 20 LTS or later
- **npm** 10.x or later
- **MongoDB** 7.x (local instance or MongoDB Atlas)
- **Firebase project** with Cloud Messaging enabled
- **Google OAuth** credentials (Client ID + Secret)
- **Facebook OAuth** credentials (App ID + Secret)

## Step 1: Initialize NestJS Project

```bash
npx -y @nestjs/cli new rawy-backend --package-manager npm --skip-git
cd rawy-backend
```

## Step 2: Install Dependencies

```bash
# Core
npm install @nestjs/mongoose mongoose
npm install @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/jwt
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer

# Auth
npm install bcrypt
npm install passport-google-oauth20 passport-facebook
npm install @types/passport-jwt @types/passport-local @types/passport-google-oauth20 @types/passport-facebook --save-dev
npm install @types/bcrypt --save-dev

# Firebase
npm install firebase-admin

# File Upload
npm install @types/multer --save-dev

# Config
npm install @nestjs/config
npm install joi
```

## Step 3: Environment Setup

Create `.env` in project root:

```env
# App
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rawy

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/v1/auth/facebook/callback

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Admin Seed
ADMIN_EMAIL=admin@rawy.com
ADMIN_PASSWORD=AdminPassword123!

# Upload
UPLOAD_DIR=./uploads
MAX_AUDIO_SIZE=209715200
MAX_IMAGE_SIZE=10485760
```

## Step 4: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Navigate to **Project Settings > Service Accounts**
4. Click **Generate new private key**
5. Save the JSON file as `firebase-service-account.json` in project root
6. Add to `.gitignore`:

```gitignore
firebase-service-account.json
.env
uploads/
```

## Step 5: Create Upload Directories

```bash
mkdir -p uploads/audio uploads/images
```

## Step 6: Run the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Step 7: Access Swagger Documentation

Open browser to: **http://localhost:3000/api/docs**

## Step 8: Verify Admin Seed

On first startup, the system automatically creates an admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. Verify by logging in:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rawy.com","password":"AdminPassword123!"}'
```

## Development Commands

```bash
# Run in watch mode
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint
npm run lint

# Format
npm run format
```

## API Base URL

All API endpoints are prefixed with `/api/v1/`. Full API contract available in [contracts/api-endpoints.md](./contracts/api-endpoints.md).

## Key Notes

- **Public endpoints** (no auth): GET podcasts, episodes, creator profiles, comments
- **Protected endpoints** (JWT required): All POST/PATCH/DELETE operations, likes, follows, views, admin
- **File uploads**: Use `multipart/form-data` for podcasts (cover image), episodes (audio file), and creator avatar
- **Pagination**: All list endpoints support `?page=1&limit=20` (default 20, max 100)
