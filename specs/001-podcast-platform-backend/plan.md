# Implementation Plan: RAWY Podcast Platform – Backend (MVP)

**Branch**: `001-podcast-platform-backend` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-podcast-platform-backend/spec.md`

## Summary

Build a production-ready MVP REST API backend for the Rawy podcast platform using NestJS with MongoDB/Mongoose. The system supports three user roles (User, Creator, Admin), JWT authentication with OAuth (Google/Facebook), podcast and episode management with local file uploads (Multer), engagement features (likes, comments, views), a follow/notification system (Firebase Cloud Messaging), and admin management. The API is fully documented via Swagger.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS  
**Framework**: NestJS 10.x  
**Primary Dependencies**: @nestjs/mongoose, @nestjs/passport, @nestjs/jwt, @nestjs/swagger, passport-jwt, passport-google-oauth20, passport-facebook, class-validator, class-transformer, bcrypt, firebase-admin, multer  
**Storage**: MongoDB 7.x (via Mongoose ODM), local filesystem for file uploads  
**Testing**: Jest (built into NestJS), Supertest for e2e  
**Target Platform**: Node.js server (Linux/Windows), single-process monolith  
**Project Type**: web-service (REST API)  
**Performance Goals**: <500ms p95 for standard endpoints, <5s for file uploads up to 50MB  
**Constraints**: No Redis, no Elasticsearch, no microservices, no GraphQL. Local file storage only. MVP scope.  
**Scale/Scope**: MVP — targeting hundreds of concurrent users, not thousands. ~50 API endpoints across 11 modules.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is uninitialized (template placeholders only). No gates to enforce. Proceeding with standard best practices:
- ✅ Modular architecture (NestJS module system)
- ✅ Testing included (Jest + Supertest)
- ✅ Clear separation of concerns (Controller → Service → Schema)
- ✅ Environment-based configuration
- ✅ No unnecessary complexity for MVP

## Project Structure

### Documentation (this feature)

```text
specs/001-podcast-platform-backend/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.ts                    # Application bootstrap, Swagger setup, global pipes
├── app.module.ts              # Root module importing all feature modules
├── common/                    # Shared utilities
│   ├── decorators/            # Custom decorators (CurrentUser, Roles, Public)
│   ├── guards/                # JwtAuthGuard, RolesGuard, ActiveUserGuard
│   ├── filters/               # Global exception filters
│   ├── interceptors/          # Response transformation interceptors
│   ├── pipes/                 # Custom validation pipes
│   ├── dto/                   # Shared DTOs (pagination)
│   └── constants/             # Role enums, config keys
├── config/                    # Configuration module (env validation)
│   └── config.module.ts
├── auth/                      # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/                   # RegisterDto, LoginDto, TokenDto
│   ├── strategies/            # JwtStrategy, GoogleStrategy, FacebookStrategy
│   └── guards/                # LocalAuthGuard, GoogleAuthGuard, FacebookAuthGuard
├── users/                     # User management module
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── schemas/               # user.schema.ts
│   └── dto/                   # UpdateUserDto
├── creators/                  # Creator profile module
│   ├── creators.module.ts
│   ├── creators.controller.ts
│   ├── creators.service.ts
│   ├── schemas/               # creator-profile.schema.ts
│   └── dto/                   # CreateCreatorDto, UpdateCreatorDto
├── podcasts/                  # Podcast module
│   ├── podcasts.module.ts
│   ├── podcasts.controller.ts
│   ├── podcasts.service.ts
│   ├── schemas/               # podcast.schema.ts
│   └── dto/                   # CreatePodcastDto, UpdatePodcastDto
├── episodes/                  # Episode module
│   ├── episodes.module.ts
│   ├── episodes.controller.ts
│   ├── episodes.service.ts
│   ├── schemas/               # episode.schema.ts
│   └── dto/                   # CreateEpisodeDto, UpdateEpisodeDto
├── comments/                  # Comments module
│   ├── comments.module.ts
│   ├── comments.controller.ts
│   ├── comments.service.ts
│   ├── schemas/               # comment.schema.ts
│   └── dto/                   # CreateCommentDto
├── likes/                     # Likes module
│   ├── likes.module.ts
│   ├── likes.controller.ts
│   ├── likes.service.ts
│   └── schemas/               # like.schema.ts
├── follows/                   # Follow system module
│   ├── follows.module.ts
│   ├── follows.controller.ts
│   ├── follows.service.ts
│   └── schemas/               # follow.schema.ts
├── views/                     # View tracking module
│   ├── views.module.ts
│   ├── views.controller.ts
│   ├── views.service.ts
│   └── schemas/               # view.schema.ts
├── notifications/             # Push notification module
│   ├── notifications.module.ts
│   ├── notifications.service.ts
│   └── firebase.config.ts     # Firebase Admin SDK initialization
├── admin/                     # Admin management module
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   └── dto/                   # AdminQueryDto
└── seed/                      # Database seeding
    ├── seed.module.ts
    └── seed.service.ts        # Admin seed on startup

uploads/                       # File upload storage (gitignored)
├── audio/
└── images/

test/
├── e2e/                       # End-to-end tests
│   ├── auth.e2e-spec.ts
│   ├── podcasts.e2e-spec.ts
│   └── episodes.e2e-spec.ts
└── jest-e2e.json
```

**Structure Decision**: Single NestJS monolith with modular feature-based organization. Each domain entity gets its own NestJS module containing controller, service, schema, and DTOs. Shared cross-cutting concerns live in `src/common/`. This follows NestJS best practices and maps 1:1 to the spec's module requirements.

## Complexity Tracking

No constitution violations to justify — constitution is uninitialized.
