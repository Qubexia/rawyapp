<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)
- Added principles: 5 core principles derived from project structure
- Added sections: Technical Standards, Development Workflow
- Templates requiring updates: ✅ plan-template.md (constitution check present), ✅ tasks-template.md (TDD mentioned), ✅ spec-template.md (user stories present)
-->

# Rawy Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)
TDD is mandatory for all features: Tests MUST be written before implementation begins; Tests MUST fail initially; Implementation proceeds only after tests demonstrate failure; Red-Green-Refactor cycle strictly enforced for all backend services and mobile components.

**Rationale**: The backend uses Jest (configured in package.json) and the project follows TDD practices. This ensures reliability for a multi-role platform handling user data, podcast content, and engagement features.

### II. Modular Library-First
Every feature MUST be implemented as a self-contained, independently testable module; Modules MUST have clear purposes and public APIs; No organizational-only modules without functional value; Reusable components extracted to shared packages.

**Rationale**: The NestJS backend uses modular architecture with services, controllers, and entities. This principle ensures maintainability as the platform grows with Creator, User, and Admin roles.

### III. Role-Based Access Control
Three roles exist: User (default), Creator, Admin; Access to podcast/episode management restricted to Creators and Admins; Admin functions (role elevation, content moderation) restricted to Admins; Role checks enforced at service layer for all protected operations.

**Rationale**: Platform specification defines three distinct roles with specific privileges. Access control must be enforced consistently across all API endpoints.

### IV. API-First Design
All external functionality exposed via REST APIs with OpenAPI/Swagger documentation; API contracts defined in contracts/ directory before implementation; Contract tests MUST pass for all endpoints; JSON format for machine-readable responses, human-readable for developer queries.

**Rationale**: The project maintains API contract documentation in specs/*/contracts/api-endpoints.md. This ensures clear contracts between backend and mobile app consumers.

### V. Observability
Structured logging required for all service operations; Error tracking with meaningful context; API response times tracked; Security events logged (login, role changes, content moderation).

**Rationale**: With three user roles and engagement features (likes, comments, follows, notifications), observability is critical for debugging and maintaining platform reliability.

## Technical Standards

**Language/Version**: TypeScript 5.7.3  
**Framework**: NestJS 11.x (backend), Expo SDK (mobile)  
**Database**: MongoDB with Mongoose ODM  
**Testing**: Jest with ts-jest transformer  

All new features MUST include: Unit tests for services, Integration tests for API endpoints, Contract tests verifying API responses match specifications.

## Development Workflow

**Feature Flow**: Research → Spec → Plan → Tasks → Implement → Test → Review → Merge  
**Spec Requirements**: User stories with independent testability, Functional requirements with MUST/SHOULD clarity, Measurable success criteria  
**Task Organization**: Tasks grouped by user story, Tests written before implementation, Parallel execution where dependencies allow  
**Quality Gates**: All tests pass, Lint passes, TypeScript compiles without errors

## Governance

**Version**: 1.0.0 | **Ratified**: 2026-03-30 | **Last Amended**: 2026-03-30

This constitution supersedes all other practices. Amendments require:
1. Documentation of proposed change
2. Rationale explaining why change is needed
3. Migration plan if change affects existing features
4. Version bump following semantic versioning:
   - MAJOR: Backward incompatible governance changes
   - MINOR: New principles or materially expanded guidance
   - PATCH: Clarifications, wording, typo fixes

All PRs/reviews must verify compliance with these principles.
