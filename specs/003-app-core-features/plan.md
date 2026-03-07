# Implementation Plan: App Core Features

**Branch**: `003-app-core-features` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-app-core-features/spec.md`

## Summary

This plan covers 6 user stories enhancing the Rawy podcast app: (1) Explore page with cover images, server-side search, and category filtering; (2) Episode views tracking (frontend integration with existing backend); (3) Library following section with rich creator cards and unfollow actions; (4) Auth flow modifications (onboarding→login, password toggle, T&C link); (5) Settings page with change password, delete account, and notification preferences; (6) Terms & Conditions static page. Backend work includes adding `category` field to Podcast schema, search/filter support, `PATCH /auth/change-password`, and `DELETE /users/me` with cascade deletion.

## Technical Context

**Language/Version**: TypeScript / Node.js 18+ (backend), TypeScript / React Native (frontend)
**Primary Dependencies**: NestJS, Mongoose (backend); Expo, React Native Paper, React Query (frontend)
**Storage**: MongoDB (via Mongoose); AsyncStorage (client-side preferences)
**Testing**: Backend unit tests (Jest); Frontend manual testing (Expo)
**Target Platform**: Android + iOS (Expo managed workflow)
**Project Type**: Mobile app + REST API backend
**Performance Goals**: Explore page loads in <3s, search results in <5s
**Constraints**: All views API calls fire-and-forget, no errors shown to user
**Scale/Scope**: ~6 new/modified screens, 2 new backend endpoints, 1 schema update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is using default template (no custom principles defined). No gates to check — proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/003-app-core-features/
├── plan.md                    # This file
├── spec.md                    # Feature specification (with clarifications)
├── research.md                # Phase 0 — 6 research decisions
├── data-model.md              # Phase 1 — entity modifications, data flows
├── quickstart.md              # Phase 1 — setup guide, key files
├── contracts/
│   └── api-endpoints.md       # Phase 1 — API contracts (modified + new)
├── checklists/
│   └── requirements.md        # Spec quality checklist
└── tasks.md                   # Phase 2 — task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts      # MODIFY: add changePassword endpoint
│   │   ├── auth.service.ts         # MODIFY: add changePassword method
│   │   └── dto/
│   │       └── change-password.dto.ts  # NEW: DTO for change password
│   ├── users/
│   │   ├── users.controller.ts     # MODIFY: add deleteAccount endpoint
│   │   └── users.service.ts        # MODIFY: add deleteAccount cascade method
│   ├── podcasts/
│   │   ├── schemas/
│   │   │   └── podcast.schema.ts   # MODIFY: add category field + text index
│   │   ├── podcasts.controller.ts  # MODIFY: add search + category params
│   │   └── podcasts.service.ts     # MODIFY: implement text search + category filter
│   └── views/                      # EXISTING: no changes needed
│
rawy/
├── app/
│   ├── (tabs)/
│   │   ├── explore.tsx             # MODIFY: add images, search integration, categories
│   │   └── library.tsx             # MODIFY: enhance Following segment
│   ├── (auth)/
│   │   ├── onboarding.tsx          # MODIFY: navigate to login instead of register
│   │   ├── login.tsx               # MODIFY: add password toggle + T&C link
│   │   └── register.tsx            # MODIFY: add password toggle + T&C link
│   ├── (profile)/
│   │   ├── settings.tsx            # MODIFY: full settings UI
│   │   └── change-password.tsx     # NEW: change password form
│   └── (legal)/
│       └── terms.tsx               # NEW: Terms & Conditions page
├── services/
│   └── views.service.ts            # NEW: views API wrapper
├── hooks/queries/
│   └── use-views.ts                # NEW: React Query views hook
├── constants/
│   └── terms.ts                    # NEW: static T&C text
└── context/
    └── player-context.tsx          # MODIFY: add view recording on play
```

**Structure Decision**: Existing mobile + API monorepo layout. Backend in `backend/`, frontend in `rawy/`. No new top-level directories needed. New screens follow established expo-router group conventions: `(legal)` for legal pages, `(profile)` for profile-related screens.

## Phase 0 Artifacts

| Artifact | Description |
|----------|-------------|
| [research.md](./research.md) | 6 decisions: Podcast search/category (MongoDB $text), views frontend integration (fire-and-forget), change password (bcrypt verify), delete account (cascade), notification preferences (AsyncStorage + device token), T&C (static embedded content) |

## Phase 1 Artifacts

| Artifact | Description |
|----------|-------------|
| [data-model.md](./data-model.md) | Entity modifications (Podcast.category + text index), client-side state, 4 data flow diagrams (search, views, deletion, password change), relationship map |
| [contracts/api-endpoints.md](./contracts/api-endpoints.md) | Modified `GET /podcasts` (search + category), new `PATCH /auth/change-password`, new `DELETE /users/me`, existing views/follows endpoints reference |
| [quickstart.md](./quickstart.md) | Setup guide, key files by user story, testing strategy |

## Complexity Tracking

No constitution violations to justify.
