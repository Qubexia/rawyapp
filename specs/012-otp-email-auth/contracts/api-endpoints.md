# API Contracts: OTP Email Verification

## OTP Endpoints

### POST /auth/otp/send

Send an OTP to the user's email for verification.

**Purpose**: Used for signup verification, password reset, and password change.

**Request**:
```json
{
  "email": "string (required)",
  "purpose": "signup | password_reset | password_change (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

**Errors**:
- 400: Invalid email format or purpose
- 429: Too many requests (rate limit)
- 500: Server error

---

### POST /auth/otp/verify

Verify an OTP entered by the user.

**Request**:
```json
{
  "email": "string (required)",
  "otp": "string (6 digits, required)",
  "purpose": "signup | password_reset | password_change (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "string (JWT for password_reset/password_change flows)"
}
```

**Errors**:
- 400: Invalid OTP format
- 401: Invalid or expired OTP
- 429: Too many failed attempts

---

### POST /auth/otp/resend

Resend a new OTP after the previous one expired or wasn't received.

**Request**:
```json
{
  "email": "string (required)",
  "purpose": "signup | password_reset | password_change (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "New OTP sent successfully",
  "expiresIn": 600,
  "resendCount": 2
}
```

**Errors**:
- 400: Invalid email or purpose
- 429: Rate limit exceeded (max resends or cooldown)

---

### POST /auth/otp/cancel

Cancel an ongoing OTP verification process.

**Request**:
```json
{
  "email": "string (required)",
  "purpose": "signup | password_reset | password_change (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP verification cancelled"
}
```

---

## Password Reset Flow

### POST /auth/forgot-password

Initiate password reset by sending OTP to user's email.

**Request**:
```json
{
  "email": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "If the email exists, an OTP has been sent"
}
```

*Security note: Always return success to prevent email enumeration*

---

### POST /auth/reset-password

Complete password reset with verified OTP.

**Request**:
```json
{
  "email": "string (required)",
  "otp": "string (6 digits, required)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## User Endpoint (Extended)

### PATCH /users/me/verify-email

Complete email verification after OTP input (optional, can be part of verify flow).

**Request**:
```json
{
  "otp": "string (6 digits, required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "isEmailVerified": true
}
```