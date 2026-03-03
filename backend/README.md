# RAWY Podcast Platform – Backend (MVP)

REST API backend for the RAWY podcast platform: auth (JWT + OAuth), podcasts & episodes, creator profiles, follows, likes, comments, views, push notifications (FCM), and admin management.

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS 10.x
- **Database**: MongoDB 7.x (Mongoose)
- **Auth**: JWT, Passport (local, Google, Facebook)
- **Docs**: Swagger at `/api/docs`
- **Storage**: Local filesystem for uploads (audio, images)

## Setup

1. **Prerequisites**: Node.js 20+, npm, MongoDB 7.x, Firebase project (FCM), Google & Facebook OAuth apps.
2. **Install**: `npm install`
3. **Environment**: Copy env template and set variables. See [quickstart](../specs/001-podcast-platform-backend/quickstart.md) for full list (MONGODB_URI, JWT secrets, OAuth, Firebase, ADMIN_EMAIL, ADMIN_PASSWORD, upload limits).
4. **Firebase**: Place service account JSON at path set in `FIREBASE_SERVICE_ACCOUNT_PATH`.
5. **Upload dirs**: `uploads/audio/`, `uploads/images/` (created automatically or manually).
6. **Run**: `npm run start:dev`

On first start, an admin user is seeded from `ADMIN_EMAIL` and `ADMIN_PASSWORD` if no admin exists.

## API Documentation

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs) (when server is running)
- **Base URL**: `/api/v1`
- **Auth**: Bearer token for protected routes. Public: GET podcasts, episodes, creators, comments.

## Project Structure

- `src/` – application code
  - `auth/` – registration, login, refresh, OAuth
  - `users/` – profile, device tokens
  - `creators/` – creator profiles, become creator
  - `podcasts/`, `episodes/` – content CRUD, file uploads
  - `follows/`, `likes/`, `comments/`, `views/` – engagement
  - `notifications/` – Firebase push (new episode)
  - `admin/` – user/content management (ADMIN only)
  - `seed/` – first-admin seed on startup
  - `common/` – guards, decorators, filters, interceptors, DTOs
  - `config/` – env validation (Joi)

## Verification

- **Env validation**: Missing or invalid required env vars (per Joi in `config.module.ts`) cause startup failure.
- **Cascade delete**: Deleting a podcast removes its episodes and related likes, comments, views; counters are decremented.
- **Smoke test**: Start server → open `/api/docs` → register → login → create podcast → upload episode → like/comment/view → follow creator → admin: list users, get stats.

## Commands

- `npm run start:dev` – watch mode
- `npm run build` – production build
- `npm run start:prod` – run production build
- `npm run test` – unit tests
- `npm run test:e2e` – e2e tests
- `npm run lint` – lint
