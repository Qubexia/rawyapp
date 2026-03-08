# Implementation Plan: App Engagement Features

**Branch**: `004-app-engagement-features` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-app-engagement-features/spec.md`

## Summary

This plan covers 10 engagement and UX features for the RAWY Podcast platform: in-app notifications with aggregation, Firebase push notifications (FCM), comment likes and threaded replies, following system improvements (user + creator), podcast sharing via deep links (Expo Universal Links / App Links), personalized home feed, location-based user suggestions, episode screen UX redesign, view count bug fix, and general UX polish. The implementation spans both the NestJS/MongoDB backend and the React Native/Expo frontend.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.7 (backend)  
**Primary Dependencies**:
- Frontend: React Native 0.81.5, Expo SDK 54, Expo Router 6, React Native Paper 5.15, @tanstack/react-query 5.x, axios, lucide-react-native, react-native-reanimated 4.x, zod 4.x
- Backend: NestJS 11, Mongoose 9.2, firebase-admin 13.7, @nestjs/jwt, @nestjs/passport, bcrypt, nodemailer

**Storage**: MongoDB (via Mongoose ODM)  
**Testing**: Jest 30 (backend), no formal frontend test framework  
**Target Platform**: iOS + Android (Expo managed workflow)  
**Project Type**: Mobile app (Expo/React Native) + REST API backend (NestJS)  
**Performance Goals**: API responses <500ms p95, push notifications delivered <10s, notification screen loads <3s  
**Constraints**: Offline-capable for cached data, city-level location only (~10km), 90-day notification retention  
**Scale/Scope**: ~50 screens, growing user base, 8 existing backend modules to extend + 1 new module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a template with no custom principles defined. No gate violations to check. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/004-app-engagement-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-endpoints.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── notifications/       # EXTEND: add Notification schema, controller, in-app storage
│   ├── comments/            # EXTEND: add parentCommentId, comment likes
│   ├── comment-likes/       # NEW: comment-level like module
│   ├── follows/             # EXTEND: user-following support, counts optimization
│   ├── likes/               # EXISTING: episode likes (no changes)
│   ├── views/               # EXISTING: minor fixes if needed
│   ├── users/               # EXTEND: add city/location fields
│   ├── episodes/            # EXTEND: feed endpoint for personalized content
│   ├── podcasts/            # EXISTING: category data used for suggestions
│   ├── creators/            # EXISTING: used for suggestions
│   └── feed/                # NEW: personalized feed module
└── tests/

rawy/ (frontend)
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # MODIFY: add 5th Notifications tab
│   │   ├── notifications.tsx # NEW: notifications screen
│   │   ├── index.tsx         # MODIFY: personalized feed
│   │   └── explore.tsx       # MODIFY: suggestions section
│   ├── episode/
│   │   └── [id].tsx          # MODIFY: UX improvements, comment likes/replies
│   └── _layout.tsx           # MODIFY: deep link configuration
├── services/
│   ├── notifications.service.ts  # NEW
│   ├── comment-likes.service.ts  # NEW
│   ├── comments.service.ts       # MODIFY: replies support
│   ├── follows.service.ts        # MODIFY: user following
│   ├── views.service.ts          # EXISTING: fix duplicate calls
│   └── feed.service.ts           # NEW
├── hooks/
│   └── queries/
│       ├── use-notifications.ts  # NEW
│       ├── use-comment-likes.ts  # NEW
│       ├── use-comments.ts       # MODIFY: replies
│       └── use-feed.ts           # NEW
├── components/
│   ├── NotificationItem.tsx      # NEW
│   ├── CommentItem.tsx           # NEW: enhanced comment with likes/replies
│   └── SuggestionCard.tsx        # NEW
└── utils/
    └── deep-link.ts              # NEW
```

**Structure Decision**: Follows the existing monorepo pattern with `backend/` (NestJS) and `rawy/` (Expo/React Native). New modules follow the established NestJS convention (module/controller/service/schema/dto). Frontend follows Expo Router file-based routing with services layer and React Query hooks.

## Complexity Tracking

No constitution violations to justify.
