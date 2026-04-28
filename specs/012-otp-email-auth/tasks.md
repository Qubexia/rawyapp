---

description: "Task list for OTP Email Verification feature"
---

# Tasks: OTP Email Verification

**Input**: Design documents from `/specs/012-otp-email-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test tasks (TDD required per Constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Configure SMTP environment variables in backend/.env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- [X] T002 Install nodemailer and @types/nodemailer in backend/
- [X] T003 [P] Create directory structure backend/src/auth/otp/{dto,entities}/
- [X] T004 Add OTP configuration constants in backend/src/config/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T005 [P] Create OTP entity/schema in backend/src/auth/otp/entities/otp.entity.ts
- [X] T006 [P] Create OTP DTOs (SendOtpDto, VerifyOtpDto, ResendOtpDto) in backend/src/auth/otp/dto/
- [X] T007 [P] Extend User entity with isEmailVerified and emailVerifiedAt fields in backend/src/users/schemas/user.schema.ts
- [X] T008 Create EmailService for sending OTP emails in backend/src/auth/otp/email.service.ts
- [X] T009 [P] Configure Mongoose TTL index on OTP expiresAt field
- [X] T010 Add OTP rate limiting constants (MAX_ATTEMPTS, EXPIRY_SECONDS, COOLDOWN_SECONDS)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Email OTP Verification After Signup (Priority: P1) 🎯 MVP

**Goal**: New users verify email via OTP before account becomes active

**Independent Test**: Register new account → receive OTP → enter correct OTP → account activated

### Tests for User Story 1 (TDD - Write First) ⚠️

- [X] T011 [P] [US1] Unit test for OTP generation in backend/src/auth/otp/otp.service.spec.ts
- [X] T012 [P] [US1] Unit test for OTP storage and retrieval in backend/src/auth/otp/otp.service.spec.ts
- [X] T013 [US1] Integration test for POST /auth/otp/send in backend/src/auth/otp/otp.controller.spec.ts
- [X] T014 [US1] Integration test for POST /auth/otp/verify in backend/src/auth/otp/otp.controller.spec.ts

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement OTP generate and hash methods in backend/src/auth/otp/otp.service.ts
- [X] T016 [P] [US1] Implement OTP storage with expiration in backend/src/auth/otp/otp.service.ts
- [X] T017 [US1] Implement send OTP endpoint (POST /auth/otp/send) in backend/src/auth/otp/otp.controller.ts
- [X] T018 [US1] Implement verify OTP endpoint (POST /auth/otp/verify) in backend/src/auth/otp/otp.controller.ts
- [X] T019 [US1] Update User document isEmailVerified on successful verification in backend/src/users/users.service.ts
- [X] T020 [US1] Add validation and error handling (invalid OTP, expired, max attempts)
- [X] T021 [US1] Add structured logging for OTP send/verify operations in backend/src/auth/otp/otp.service.ts

**Checkpoint**: User Story 1 fully functional - can verify email after signup

---

## Phase 4: User Story 2 - OTP for Password Reset (Priority: P1)

**Goal**: Users can reset password via OTP sent to their email

**Independent Test**: Request password reset → receive OTP → enter OTP → set new password → login with new password

### Tests for User Story 2 (TDD - Write First) ⚠️

- [X] T022 [P] [US2] Integration test for POST /auth/forgot-password in backend/src/auth/auth.controller.spec.ts
- [X] T023 [P] [US2] Integration test for POST /auth/reset-password in backend/src/auth/auth.controller.spec.ts
- [X] T024 [US2] Integration test for POST /auth/otp/resend in backend/src/auth/otp/otp.controller.spec.ts

### Implementation for User Story 2

- [X] T025 [P] [US2] Implement resend OTP endpoint (POST /auth/otp/resend) in backend/src/auth/otp/otp.controller.ts
- [X] T026 [P] [US2] Implement cancel OTP endpoint (POST /auth/otp/cancel) in backend/src/auth/otp/otp.controller.ts
- [X] T027 [US2] Implement forgot-password endpoint (POST /auth/forgot-password) in backend/src/auth/auth.controller.ts
- [X] T028 [US2] Implement reset-password endpoint (POST /auth/reset-password) in backend/src/auth/auth.controller.ts
- [X] T029 [US2] Generate JWT token after successful OTP verification for password_reset flow
- [X] T030 [US2] Update password via authenticated reset flow in backend/src/auth/auth.service.ts
- [X] T031 [US2] Add email enumeration protection (always return success)

**Checkpoint**: User Story 2 fully functional - can reset password via OTP

---

## Phase 5: User Story 3 - OTP for Password Change (Priority: P2)

**Goal**: Logged-in users can change password with OTP verification

**Independent Test**: User logged in → request password change → receive OTP → enter OTP → set new password → remain logged in

### Tests for User Story 3 (TDD - Write First) ⚠️

- [X] T032 [P] [US3] Integration test for POST /auth/otp/send with password_change purpose
- [X] T033 [US3] Integration test for password change with OTP verification

### Implementation for User Story 3

- [X] T034 [P] [US3] Add password_change purpose handling in OTP service
- [X] T035 [US3] Create password change endpoint requiring authenticated user + OTP in backend/src/auth/auth.controller.ts
- [X] T036 [US3] Generate new JWT token after password change

**Checkpoint**: User Story 3 fully functional - can change password with OTP

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T037 [P] Add rate limiting for OTP endpoints (prevent abuse)
- [X] T038 Add email bounce handling and user feedback
- [X] T039 Update frontend pages for OTP verification UI
- [X] T040 [P] Add verification confirmation email after successful verification
- [X] T041 Run quickstart.md validation against implementation
- [X] T042 Full integration test across all flows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses US1 OTP service but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses US1/US2 OTP service but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- OTP entity before OTP service
- OTP service before controller endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Tests for each user story marked [P] can run in parallel
- User Story 1 and 2 can run in parallel after Foundational (both use OTP service)
- User Story 3 can start in parallel with others after Foundational

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for OTP generation in backend/src/auth/otp/otp.service.spec.ts"
Task: "Unit test for OTP storage and retrieval in backend/src/auth/otp/otp.service.spec.ts"
Task: "Integration test for POST /auth/otp/send in backend/src/auth/otp/otp.controller.spec.ts"
Task: "Integration test for POST /auth/otp/verify in backend/src/auth/otp/otp.controller.spec.ts"

# Launch all implementations for User Story 1 in parallel:
Task: "Implement OTP generate and hash methods in backend/src/auth/otp/otp.service.ts"
Task: "Create OTP DTOs in backend/src/auth/otp/dto/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1 - MVP)
   - Developer B: User Story 2 (P1 - Password Reset)
   - Developer C: User Story 3 (P2 - Password Change)
3. Stories complete and integrate independently

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 42 |
| **Phase 1: Setup** | 4 |
| **Phase 2: Foundational** | 6 |
| **Phase 3: User Story 1 (P1 - MVP)** | 11 |
| **Phase 4: User Story 2 (P1)** | 10 |
| **Phase 5: User Story 3 (P2)** | 5 |
| **Phase 6: Polish** | 6 |

### Independent Test Criteria by User Story

| User Story | Test Criteria |
|------------|---------------|
| **US1** | Register account → OTP sent to email → Enter valid OTP → Account activated → Can log in |
| **US2** | Enter email on forgot password → OTP sent → Enter valid OTP → Set new password → Login with new password |
| **US3** | Logged-in user requests password change → OTP sent → Enter valid OTP → Set new password → Remain logged in with new password |

### Suggested MVP Scope

User Story 1 alone constitutes the MVP. Focus on completing Phase 1, Phase 2, and Phase 3 fully before proceeding to other stories.