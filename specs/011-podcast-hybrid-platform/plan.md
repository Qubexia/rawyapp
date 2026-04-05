# Implementation Plan: Rawy Hybrid Podcast Platform

**Branch**: `011-podcast-hybrid-platform` | **Date**: 2026-04-04 | **Spec**: `spec.md`

**Input**: Feature specification from `/specs/011-podcast-hybrid-platform/spec.md`

**Note**: This feature EXTENDS the existing NestJS backend at `backend/src/`

## Summary

Hybrid podcast platform supporting both external RSS feeds (podcatcher functionality) and internal hosted content (creator hosting). Implements dynamic role-based access control where users start as listeners (USER role) and can upgrade to CREATOR via podcast claiming. Features automated RSS sync with deduplication and data fencing for internal content.

## Technical Context

**Language/Version**: TypeScript 5.7.3  
**Primary Dependencies**: NestJS 11.x, Mongoose 9.2, Jest  
**Storage**: MongoDB with Mongoose ODM (existing)  
**Testing**: Jest with ts-jest transformer (existing)  
**Target Platform**: NestJS Backend API (existing)  
**Performance Goals**: 3s page load, 99.9% uptime, 10,000 concurrent users  
**Constraints**: 100MB max audio file size, external RSS feeds require no authentication  
**Scale/Scope**: 5 user stories, 14 functional requirements, 4 key entities  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ REQUIRED | All services/episodes must have tests written before implementation |
| II. Modular Library-First | ✅ REQUIRED | Auth, Podcast, Episode services as independent modules |
| III. Role-Based Access Control | ✅ REQUIRED | USER/CREATOR/ADMIN roles enforced at service layer |
| IV. API-First Design | ✅ REQUIRED | REST APIs with contracts in contracts/ directory |
| V. Observability | ✅ REQUIRED | Structured logging for auth, sync, role changes |

**GATE RESULT**: ✅ All gates pass - proceed with implementation

## Project Structure

### Documentation (this feature)

```text
specs/011-podcast-hybrid-platform/
├── plan.md              # This file
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-endpoints.md # API contract definitions
└── tasks.md             # Generated via /speckit.tasks
```

### Source Code (EXISTING BACKEND - EXTEND, NOT CREATE)

```text
backend/
├── src/
│   ├── auth/                 # EXISTING - JWT, strategies, guards
│   ├── users/                # EXISTING - User schema, service, controller
│   ├── podcasts/             # EXISTING - Podcast schema, service, controller (ENHANCE)
│   ├── common/               # EXISTING - Guards, decorators, utilities
│   │   ├── guards/          # RolesGuard, JwtAuthGuard
│   │   ├── decorators/      # @Roles, @CurrentUser
│   │   └── constants/       # Role enum (EXISTING)
│   └── [NEW MODULES TO ADD]
│       ├── episodes/        # Episode schema, service, controller
│       ├── sync/            # RSS sync Cron job service
│       └── claims/          # Podcast claim request service

tests/
├── unit/                    # Existing + new unit tests
├── integration/             # Existing + new integration tests
└── contract/                # Existing + new contract tests
```

**Structure Decision**: Extend existing NestJS backend at `backend/src/`. Add new modules (episodes, sync, claims) following existing patterns. Existing modules (auth, users, podcasts) will be enhanced with new functionality.

## Complexity Tracking

No violations requiring justification - architecture follows standard NestJS + existing backend pattern.

## Phase 0: Research

Research resolved via clarification:
- **Non-functional targets**: Web app standard (3s, 99.9%, 10k users)
- **Deduplication rules**: Title similarity (80%) + same week pubDate

No additional research needed - all unknowns resolved in clarification phase.

## Phase 1: Design Artifacts

- `data-model.md` - Entity definitions for User, Podcast, Episode, ClaimRequest (updated for existing schema)
- `contracts/api-endpoints.md` - REST API contract definitions
- `quickstart.md` - Development setup guide (updated for existing backend)

---

**STOP**: Phase 1 complete. Awaiting Phase 2 (tasks generation via `/speckit.tasks`).

**Branch**: `011-podcast-hybrid-platform`  
**Plan File**: `D:\projects\rawyapp\specs\011-podcast-hybrid-platform\plan.md`  
**Artifacts to generate**: data-model.md, contracts/api-endpoints.md, quickstart.md