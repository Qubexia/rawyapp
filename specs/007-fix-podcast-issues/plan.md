# Implementation Plan: Fix Podcast Cover Image, Google Auth, and Admin Display Issues

**Branch**: `007-fix-podcast-issues` | **Date**: 2026-04-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix four issues in the podcast platform: (1) podcast cover images not displaying in cards, (2) Explore page and Library layout improvements, (3) Google Auth integration issues, (4) admin accounts appearing in "Who to Follow" section.

## Technical Context

**Language/Version**: TypeScript 5.7.3  
**Primary Dependencies**: Next.js 14 (frontend), NestJS 11.x (backend), React 18, TanStack Query, Axios  
**Storage**: MongoDB with Mongoose ODM  
**Testing**: Jest with ts-jest transformer (per constitution)  
**Target Platform**: Web application (Next.js frontend + NestJS backend)  
**Project Type**: Web service with frontend  
**Performance Goals**: Cover images load within 3 seconds; Google Auth 95% success rate  
**Constraints**: N/A for bug fixes  
**Scale/Scope**: 4 independent bug fixes across frontend and backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Test-First Development | ✅ PASS | Bug fix tests required before implementation |
| Modular Library-First | ✅ PASS | Each bug fix is independent module |
| Role-Based Access Control | ✅ PASS | Admin filtering addresses role-based display |
| API-First Design | ✅ PASS | Google Auth uses existing OAuth contract |
| Observability | ✅ PASS | Auth failures logged in service |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

**Structure Decision**: Web application with separate frontend/backend - Next.js 14 frontend in `frontend/`, NestJS 11.x backend in `backend/`

```text
frontend/
├── src/
│   ├── components/     # UI components (podcast cards, etc.)
│   ├── pages/         # Next.js pages (Explore, Library)
│   └── services/     # API services (auth, podcasts)
└── tests/

backend/
├── src/
│   ├── models/        # Mongoose models (Podcast, User)
│   ├── services/     # Business logic
│   └── api/          # REST controllers
└── tests/
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
