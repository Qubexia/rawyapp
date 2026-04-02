# Research: Fix Podcast Cover Image, Google Auth, and Admin Display Issues

## Research Findings

### Issue 1: Podcast Cover Image Not Displaying
**Decision**: Frontend component fix - verify image URL is properly bound in podcast card component
**Rationale**: This is a display issue, likely missing prop or incorrect image tag usage
**Alternatives**: Checked both Next.js Image component and standard img tag usage

### Issue 2: Explore Page and Library Improvements  
**Decision**: CSS/layout adjustments in existing page components
**Rationale**: Display improvements don't require backend changes
**Alternatives**: Could use CSS-in-JS or Tailwind depending on project setup

### Issue 3: Google Auth Integration Issues
**Decision**: Backend auth service fix - verify OAuth callback handling
**Rationale**: Auth issues typically in token exchange or callback processing
**Alternatives**: Check Passport.js strategy configuration and token refresh logic

### Issue 4: Admin Accounts in "Who to Follow"
**Decision**: Add role filter to suggestions query - exclude role='admin'
**Rationale**: Simple query modification in suggestions service
**Alternatives**: Could filter in frontend but backend filtering is more secure

## Dependencies

- None required - all fixes use existing infrastructure

## Testing Strategy

- Unit tests for backend services (suggestions service filter)
- Integration tests for auth flow
- Visual verification for frontend display issues
