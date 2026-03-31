# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Admin Dashboard web application providing complete control over existing NestJS backend. Frontend built with Next.js 14 using App Router, React 18, and TanStack Query for data fetching. Backend extends existing admin module with new endpoints for creators, podcasts, episodes, comments, analytics, notifications, and system health. Role-based access control (ADMIN role required) with JWT authentication reused from existing system.

## Complexity Tracking

No Constitution violations requiring justification. All five principles satisfied.

---

# Phase 0: Research

## Technical Context

**Language/Version**: TypeScript 5.7.3  
**Primary Dependencies**: Next.js 14 (frontend), NestJS 11.x (backend), React 18, TanStack Query, Axios  
**Storage**: MongoDB with Mongoose ODM (existing)  
**Testing**: Jest with ts-jest transformer  
**Target Platform**: Web (desktop and tablet browsers)  
**Project Type**: Web application (frontend + backend API)  
**Performance Goals**: Dashboard overview load under 2 seconds; search results within 1 second; support 1000+ records pagination  
**Constraints**: Mobile support out of scope for v1; Must reuse existing JWT auth and RBAC from backend  
**Scale**: Admin dashboard for platform with users, creators, podcasts, episodes, comments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | Admin dashboard feature will follow TDD with Jest tests before implementation |
| II. Modular Library-First | PASS | Dashboard components modularized by feature (users, creators, podcasts, etc.) |
| III. Role-Based Access Control | PASS | All dashboard pages require ADMIN role per FR-029 |
| IV. API-First Design | PASS | Backend admin API contracts defined in Phase 1 |
| V. Observability | PASS | Admin action logging required per FR-040; structured logging for all service operations |

**Post-Phase 1 Re-evaluation**: All principles still satisfied after design completion.

## Project Structure

### Documentation (this feature)

```text
specs/005-d-projects-rawyapp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── admin-api.md     # Admin API contract documentation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application with frontend + backend API
admin-dashboard/                    # New Next.js frontend
├── app/                           # Next.js App Router pages
│   ├── (auth)/login/             # Admin login
│   └── (dashboard)/              # Protected admin routes
│       ├── page.tsx              # Dashboard overview
│       ├── users/                # User management
│       ├── creators/             # Creator management
│       ├── podcasts/             # Podcast management
│       ├── episodes/             # Episode management
│       ├── comments/             # Comment moderation
│       ├── analytics/            # Analytics view
│       ├── notifications/         # Broadcast notifications
│       └── system/               # System health
├── components/                    # React components
│   ├── ui/                       # UI primitives
│   ├── layout/                   # Sidebar, header
│   └── features/                 # Feature-specific components
├── lib/                          # Utilities, API client
├── hooks/                        # React hooks
└── types/                        # TypeScript types

backend/                          # Existing NestJS (extends admin module)
├── src/
│   └── admin/                   # Existing admin module (extended)
│       ├── admin.controller.ts  # Extended with new endpoints
│       ├── admin.service.ts    # Extended with new operations
│       └── dto/                 # New DTOs
└── tests/
    └── admin/                   # Admin module tests

tests/
├── unit/                        # Jest unit tests
├── integration/                 # API integration tests
└── contract/                    # API contract tests
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
