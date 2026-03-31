# Implementation Plan: Podcast and Episode Management with Admin Dashboard

**Branch**: `006-podcast-episode-management` | **Date**: 2026-03-30 | **Spec**: [link](spec.md)
**Input**: Feature specification from `/specs/006-podcast-episode-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature adds podcast and episode management capabilities to the platform, allowing creators to create podcasts and add episodes, while providing admins with a dashboard to view and manage all content. It also includes backend connectivity verification.

## Technical Context

**Language/Version**: TypeScript 5.7.3  
**Primary Dependencies**: NestJS 11.x (backend), Next.js 14 (frontend), React 18, TanStack Query, Axios  
**Storage**: MongoDB with Mongoose ODM  
**Testing**: Jest with ts-jest transformer  
**Target Platform**: Web (desktop and mobile browsers)  
**Project Type**: Full-stack web application (frontend + backend)  
**Performance Goals**: Admin dashboard loads in under 3 seconds, podcast creation in under 30 seconds  
**Constraints**: 95% API success rate target  
**Scale/Scope**: Platform for podcast content with creators, episodes, and admin moderation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Test-First Development | PASS | Feature requires unit/integration tests before implementation |
| II. Modular Library-First | PASS | Podcast and episode modules already exist in backend |
| III. Role-Based Access Control | PASS | Three roles enforced - User, Creator, Admin |
| IV. API-First Design | PASS | Existing REST APIs for podcasts/episodes/admins |
| V. Observability | PASS | Backend already has structured logging |

## Project Structure

### Documentation (this feature)

```text
specs/006-podcast-episode-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Full-stack web application
backend/
├── src/
│   ├── podcasts/        # Podcast management (existing)
│   ├── episodes/       # Episode management (existing)
│   ├── admin/          # Admin controllers (existing)
│   └── [new services]
└── tests/              # Jest tests

frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Next.js pages
│   ├── services/       # API services
│   └── hooks/          # Custom hooks
└── tests/
```

**Structure Decision**: Full-stack web application with separate frontend and backend directories. Backend uses NestJS with modular architecture. Frontend uses Next.js with React components.

## Phase 0: Research

**Research Status**: Complete (clarifications already resolved during `/speckit.clarify`)

Key decisions from clarifications:
- Podcast lifecycle: Draft + Published states
- Audio file handling: Direct URL reference
- Admin dashboard: Summary statistics only

## Phase 1: Design & Contracts

**Status**: Ready to generate

### Entities from Spec

1. **Podcast**: title, description, coverImageUrl, creatorId, episodeCount, category, status (draft/published)
2. **Episode**: title, description, audioFileUrl, duration, podcastId, creatorId, viewsCount, likesCount, commentsCount, imageUrl
3. **User roles**: User, Creator, Admin

### Interface Contracts

Existing backend APIs (from NestJS controllers):
- `POST /podcasts` - Create podcast
- `GET /podcasts` - List podcasts
- `GET /podcasts/:id` - Get podcast
- `PATCH /podcasts/:id` - Update podcast
- `DELETE /podcasts/:id` - Delete podcast
- `POST /episodes` - Create episode
- `GET /episodes` - List episodes
- `GET /episodes/:id` - Get episode
- `PATCH /episodes/:id` - Update episode
- `DELETE /episodes/:id` - Delete episode
- `GET /admin/podcasts` - Admin list podcasts
- `GET /admin/episodes` - Admin list episodes
- `GET /admin/stats` - Admin stats

Frontend needs to:
- Create service layer to consume these APIs
- Build UI components for podcast/episode management
- Implement admin dashboard views
- Add backend connectivity check on app load
