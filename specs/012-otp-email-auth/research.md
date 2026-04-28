# Research: OTP Email Verification

## Decision: Email Service Implementation

**Technology**: Nodemailer with SMTP

### Rationale
- Most flexible solution for NestJS backend
- Works with Gmail SMTP (abdelmottale3@gmail.com)
- Easy to swap to other providers (SendGrid, Mailgun) without code changes
- Well-maintained, widely-used TypeScript library
- Compatible with existing Mongoose/MongoDB stack

### Alternatives Considered
- **SendGrid API**: More expensive, less flexible, requires API key management
- **AWS SES**: Requires AWS account, more complex setup
- **Gmail SMTP direct**: Has strict rate limits (500/day), less reliable

---

## Decision: OTP Storage Strategy

**Approach**: Store OTP records in MongoDB with Mongoose

### Rationale
- Leverages existing MongoDB infrastructure
- Easy to query by user ID or OTP code
- TTL index for automatic expiration
- Can track retry attempts and usage status

### Implementation Notes
- Use Mongoose TTL index for 10-minute auto-expiration
- Store hashed OTP (never plaintext)
- Track: userId, purpose (signup/reset/change), attempts, status

---

## Decision: OTP Generation

**Algorithm**: Cryptographically secure 6-digit numeric string

### Rationale
- 6 digits = 1 million possible combinations
- Sufficient for low-frequency use cases (not for banking)
- Numeric only = easier user input on mobile
- Use Node.js crypto.randomBytes for generation

---

## Decision: Rate Limiting Strategy

**Approach**: Application-level rate limiting with cooldown

### Rationale
- Max 5 retry attempts per OTP
- 60-second cooldown between resend requests
- Temporary lockout after 3 OTP requests in 15 minutes
- Prevents brute-force without external dependencies

---

## Constitution Compliance

| Principle | How Addressed |
|-----------|---------------|
| I. Test-First | Unit tests for OTP service, integration tests for API endpoints |
| II. Modular | OTP module as self-contained unit with clear public API |
| III. RBAC | OTP verification tied to existing role system |
| IV. API-First | REST endpoints documented in contracts/ |
| V. Observability | Logging for OTP generation, sending, verification, failures |