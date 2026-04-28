# Implementation Plan: OTP Email Verification

**Branch**: `012-otp-email-auth` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-otp-email-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement OTP (One-Time Password) email verification for user signup, password reset, and password change flows using Nodemailer with SMTP. Users receive a 6-digit OTP via email from abdelmottale3@gmail.com and must verify within 10 minutes. Account access is blocked until email verification is complete.

## Technical Context

**Language/Version**: TypeScript 5.7.3  
**Primary Dependencies**: NestJS 11.x, Mongoose 9.2, Nodemailer  
**Storage**: MongoDB with Mongoose ODM  
**Testing**: Jest with ts-jest transformer  
**Target Platform**: Backend API (Linux server)  
**Project Type**: Web-service (REST API)  
**Performance Goals**: OTP generation <50ms, email delivery <60s (95th percentile)  
**Constraints**: 6-digit OTP, 10-minute expiration, max 5 retry attempts  
**Scale/Scope**: Single server deployment, supports existing user base

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Test-First Development | ✅ PASS | Tests will be written before implementation |
| II. Modular Library-First | ✅ PASS | OTP service as independent module |
| III. Role-Based Access Control | ✅ PASS | Applies to existing auth flows |
| IV. API-First Design | ✅ PASS | REST API endpoints documented in contracts/api-endpoints.md |
| V. Observability | ✅ PASS | Logging for OTP requests and verifications |

## Phase 0: Research ✅ COMPLETE

Research document: [research.md](research.md)

Key decisions documented:
- Email service: Nodemailer with SMTP
- OTP storage: MongoDB with Mongoose, TTL index
- OTP generation: Crypto secure 6-digit
- Rate limiting: Application-level with cooldown

## Phase 1: Design & Contracts ✅ COMPLETE

| Artifact | Status |
|----------|--------|
| data-model.md | ✅ Created |
| contracts/api-endpoints.md | ✅ Created |
| quickstart.md | ✅ Created |
| Agent context | ✅ Updated |

## Next Steps

Run `/speckit.tasks` to generate implementation tasks.

## Project Structure

### Documentation (this feature)

```text
specs/012-otp-email-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── auth/
│   │   ├── otp/              # New OTP module
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── otp.controller.ts
│   │   │   ├── otp.service.ts
│   │   │   └── otp.module.ts
│   │   └── ...
│   ├── users/
│   └── ...
└── tests/

frontend/
├── src/
│   ├── pages/
│   │   ├── verify-email/
│   │   └── reset-password/
│   └── ...
└── tests/
```

**Structure Decision**: NestJS backend with dedicated OTP module; Next.js frontend with verification pages

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all gates pass.
