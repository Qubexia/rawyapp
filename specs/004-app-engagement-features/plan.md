# Implementation Plan: App Engagement Features

**Branch**: `004-app-engagement-features` | **Date**: 2026-03-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-app-engagement-features/spec.md`

## Summary

This plan implements 10 engagement features for the Rawy podcast app: in-app notifications, Firebase push notifications, deep linking, comment system improvements (likes, replies), following system improvements (user+creator follow, counts), personalized feed, location-based user suggestions, episode screen UX improvements, view count fix, and general UX polish. Features are prioritized with notification systems as P1-P2, social features P3-P5, and UX polish P6-P10.

## Technical Context

**Language/Version**: React Native 0.81.5, Expo SDK 54, TypeScript  
**Primary Dependencies**: expo-notifications, @react-native-firebase/app, expo-location, expo-linking, @tanstack/react-query, react-native-paper  
**Storage**: MongoDB with Mongoose ODM (backend), AsyncStorage (mobile local)  
**Testing**: Jest with ts-jest (backend), Jest (mobile)  
**Target Platform**: Android/iOS via Expo  
**Project Type**: Mobile app (Expo) with NestJS API backend  
**Performance Goals**: Notifications <5s delivery, Feed load <3s, Transitions <300ms, UI feedback <100ms  
**Constraints**: Deep linking requires custom domain (e.g., rawy.app) with .well-known/assetlinks.json and apple-app-site-association  
**Scale/Scope**: ~10k users, ~50 screens total after feature additions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Status | Notes |
|-----------|-------------|-------|
| I. Test-First Development | ✅ PASS | New services (notifications, comments, follows, feed) require unit tests before implementation |
| II. Modular Library-First | ✅ PASS | Each feature (notifications, comments, follows, suggestions, feed) will be self-contained modules |
| III. Role-Based Access Control | ✅ PASS | Existing RBAC in backend covers this feature; no new roles introduced |
| IV. API-First Design | ⚠️ REVIEW | New API endpoints required for notifications, comment likes, user follows, personalized feed — contracts needed in Phase 1 |
| V. Observability | ✅ PASS | All new services will include structured logging for notification events, follow actions, feed generation |

**Post-Phase 1 Re-evaluation**: Need to verify API contracts are documented before implementation.

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

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
