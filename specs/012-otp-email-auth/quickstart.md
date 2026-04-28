# Quickstart: OTP Email Verification

## Prerequisites

- Node.js 18+
- MongoDB running
- SMTP credentials for abdelmottale3@gmail.com

## Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install nodemailer @types/nodemailer
   ```

2. **Configure environment**:
   Add to `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=abdelmottale3@gmail.com
   SMTP_PASS=your-app-password
   OTP_EXPIRY_SECONDS=600
   ```

3. **Create OTP module**:
   - Generate NestJS module: `nest g module auth/otp`
   - Generate service: `nest g service auth/otp`
   - Generate controller: `nest g controller auth/otp`

4. **Create OTP entity**:
   - Define schema in `entities/otp.entity.ts`
   - Add TTL index on `expiresAt` field

## Implementation Order

### Phase 1: Core OTP Service
1. OTP generation (cryptographically secure 6-digit)
2. OTP storage in MongoDB
3. OTP expiration (10 minutes via TTL)

### Phase 2: Email Integration
4. Nodemailer service setup
5. Send OTP via email
6. Resend functionality with rate limiting

### Phase 3: Verification Logic
7. OTP verification endpoint
8. Retry attempt tracking (max 5)
9. Account activation on successful verification

### Phase 4: Integration
10. Hook into signup flow
11. Hook into password reset flow
12. Hook into password change flow

## Testing

```bash
# Run OTP service tests
npm test -- --testPathPattern=otp

# Run integration tests
npm test -- --testPathPattern=auth
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not sent | Check SMTP credentials, enable IMAP in Gmail |
| OTP expires too fast | Verify TTL index on `expiresAt` |
| Too many requests | Check rate limiting config |