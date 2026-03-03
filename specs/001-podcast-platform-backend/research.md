# Research: RAWY Podcast Platform – Backend (MVP)

**Branch**: `001-podcast-platform-backend`  
**Date**: 2026-03-03  
**Status**: Complete

## R-001: NestJS Authentication with JWT + OAuth

**Decision**: Use `@nestjs/passport` with `passport-jwt`, `passport-google-oauth20`, and `passport-facebook` strategies. Access tokens are stateless JWTs (15-minute TTL). Refresh tokens are opaque UUIDs stored in the User document in MongoDB (7-day TTL).

**Rationale**: Passport is the de facto standard for NestJS auth. Storing refresh tokens server-side enables revocation (per clarification Q2). Short-lived access tokens reduce window of compromise. UUID refresh tokens (not JWT) prevent token size bloat in the database and eliminate the need to validate JWT signatures on refresh.

**Alternatives considered**:
- Stateless JWT refresh tokens: Rejected — cannot be revoked without a blacklist (adds complexity)
- Redis session store: Out of scope per MVP constraints
- OAuth-only (no email/password): Rejected — spec requires both

## R-002: MongoDB Schema Design with Mongoose

**Decision**: Use `@nestjs/mongoose` with 8 Mongoose schemas: User, CreatorProfile, Podcast, Episode, Comment, Like, Follow, View. Use compound unique indexes for Like (userId+episodeId), Follow (followerId+creatorId), and View (userId+episodeId).

**Rationale**: Mongoose provides schema validation, indexing, and middleware hooks that align well with NestJS's decorator-based approach. Compound indexes enforce uniqueness at the database level, which is more reliable than application-level checks under concurrency.

**Alternatives considered**:
- TypeORM with MongoDB: Less mature MongoDB support than Mongoose
- Prisma with MongoDB: Still in preview for MongoDB; not production-ready
- Raw MongoDB driver: Loses schema validation and NestJS integration benefits

## R-003: File Upload Strategy

**Decision**: Use `@nestjs/platform-express` with Multer for multipart/form-data uploads. Store files in `./uploads/audio/` and `./uploads/images/` on the local filesystem. Use `diskStorage` with UUID-based filenames to prevent collisions. Serve uploaded files via a static assets middleware.

**Rationale**: Multer is the standard Node.js multipart handler, already integrated into NestJS. Local storage meets MVP requirements. UUID filenames prevent overwrite collisions and path traversal attacks.

**Alternatives considered**:
- AWS S3 / Cloud storage: Out of scope for MVP
- GridFS (MongoDB binary storage): Unnecessary complexity for MVP, limits future cloud migration
- Memory storage (Multer): Rejected — 200MB audio files would exhaust memory

**File size limits**:
- Audio: 200MB (`fileFilter` + `limits.fileSize` in Multer config)
- Images: 10MB
- Accepted audio formats: `.mp3`, `.m4a`, `.wav`, `.ogg`, `.aac`
- Accepted image formats: `.jpg`, `.jpeg`, `.png`, `.webp`

## R-004: Firebase Cloud Messaging (FCM) Integration

**Decision**: Use `firebase-admin` SDK for server-side push notifications. Initialize Firebase Admin with a service account JSON file referenced via environment variable. Send notifications using `messaging().sendEachForMulticast()` for batch delivery to multiple device tokens.

**Rationale**: Firebase Admin SDK is the official server-side approach. `sendEachForMulticast` handles up to 500 tokens per call, which is sufficient for MVP scale. Failed tokens are logged and can be cleaned up on `messaging/registration-token-not-registered` errors.

**Alternatives considered**:
- OneSignal: Adds external dependency unnecessary for MVP
- APNs / FCM directly: Firebase abstracts both platforms behind one API
- WebSockets for notifications: Different use case (real-time); FCM handles offline push

**Token management**:
- Device tokens stored as array on User document (`deviceTokens: string[]`)
- Invalid tokens removed on send failure (`messaging/registration-token-not-registered`)
- No limit on device tokens per user in MVP

## R-005: Role-Based Access Control (RBAC)

**Decision**: Implement RBAC with a custom `@Roles()` decorator + `RolesGuard`. Three roles: `USER`, `CREATOR`, `ADMIN` (defined as TypeScript enum). Guard checks `user.role` from JWT payload against required roles. Add `@Public()` decorator to bypass auth for public browsing endpoints.

**Rationale**: NestJS custom guards + decorators provide clean, declarative access control. The `@Public()` decorator pattern is the recommended NestJS approach for mixed public/protected APIs (per clarification Q5).

**Role hierarchy**:
- CREATOR inherits all USER permissions
- ADMIN inherits all CREATOR + USER permissions
- Role stored in JWT payload to avoid DB lookup on every request
- Active status checked separately by `ActiveUserGuard` on protected routes

## R-006: Swagger/OpenAPI Documentation

**Decision**: Use `@nestjs/swagger` with the Swagger Plugin for automatic DTO introspection. Apply `@ApiTags()`, `@ApiBearerAuth()`, `@ApiOperation()`, and `@ApiResponse()` decorators on all controllers. Serve Swagger UI at `/api/docs`.

**Rationale**: NestJS Swagger plugin auto-generates schema definitions from DTOs/class-validator decorators, reducing manual documentation effort. Bearer auth annotation shows the lock icon in Swagger UI for protected endpoints.

**Alternatives considered**:
- Redoc: Can be added alongside Swagger UI; not needed for MVP
- Manual OpenAPI YAML: Error-prone and falls out of sync with code

## R-007: Admin Seeding Strategy

**Decision**: Create a `SeedService` that runs `onModuleInit()`. It checks if any admin user exists. If not, it creates one using `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables. Password is hashed with bcrypt (10 salt rounds).

**Rationale**: `onModuleInit()` runs once on application startup, which is the correct lifecycle hook. Checking for existing admins prevents duplicate seeding on restart. Environment variables keep credentials out of source code.

**Alternatives considered**:
- CLI seed command: Requires manual execution; easy to forget on first deploy
- Database migration script: Overkill for a single seed operation
- Hardcoded admin: Security risk — rejected

## R-008: Pagination Strategy

**Decision**: Use query-parameter-based pagination: `?page=1&limit=20`. Return paginated responses with shape: `{ data: T[], total: number, page: number, limit: number, totalPages: number }`. Default limit: 20, max limit: 100.

**Rationale**: Page-based pagination is simpler than cursor-based for MVP. The response shape gives clients enough metadata to build pagination UIs. Max limit prevents abuse.

**Alternatives considered**:
- Cursor-based pagination: Better for infinite scroll but more complex; can be added post-MVP
- Offset-based (skip/take): Functionally equivalent to page-based; page numbers are more intuitive

## R-009: Error Handling Strategy

**Decision**: Use NestJS global exception filter to catch all exceptions and return consistent error responses with shape: `{ statusCode: number, message: string, error: string, timestamp: string }`. Use class-validator for DTO validation (automatic 400 responses). Use custom exceptions for business logic errors (e.g., `DuplicateLikeException`).

**Rationale**: Global exception filter ensures uniform error responses. class-validator integration with NestJS's `ValidationPipe` provides declarative validation. Custom exceptions map cleanly to HTTP status codes.

## R-010: Token TTL Configuration

**Decision**: 
- Access token TTL: 15 minutes (env: `JWT_ACCESS_TTL=900`)
- Refresh token TTL: 7 days (env: `JWT_REFRESH_TTL=604800`)
- Refresh tokens stored with `expiresAt` field; expired tokens rejected and cleaned up

**Rationale**: 15-minute access tokens balance security with UX. 7-day refresh tokens avoid forcing daily re-logins. TTL values externalized to env vars for easy adjustment per deployment environment.
