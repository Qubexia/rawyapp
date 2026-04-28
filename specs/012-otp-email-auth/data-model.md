# Data Model: OTP Email Verification

## Entities

### OTP Record

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Auto-generated unique identifier |
| `userId` | ObjectId | Yes | Reference to User (for signup/change) or email (for reset) |
| `email` | String | Yes | Email address to send OTP to |
| `otp` | String | Yes | Hashed 6-digit OTP |
| `purpose` | Enum | Yes | `signup`, `password_reset`, `password_change` |
| `attempts` | Number | Yes | Number of verification attempts (default: 0) |
| `maxAttempts` | Number | Yes | Maximum allowed attempts (default: 5) |
| `status` | Enum | Yes | `pending`, `verified`, `expired`, `failed` |
| `expiresAt` | Date | Yes | When OTP becomes invalid |
| `createdAt` | Date | Yes | Record creation timestamp |
| `verifiedAt` | Date | No | When OTP was successfully verified |

### User Account (Extended)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isEmailVerified` | Boolean | Yes | Whether email has been verified (default: false) |
| `emailVerifiedAt` | Date | No | When email verification completed |

## Validation Rules

### OTP Record
- `email`: Must be valid email format
- `otp`: 6 digits, numeric only
- `purpose`: Must be one of: `signup`, `password_reset`, `password_change`
- `expiresAt`: Must be 10 minutes from creation
- `attempts`: Cannot exceed `maxAttempts`

### User Account
- `isEmailVerified`: Boolean, default false
- When `isEmailVerified` becomes true, user can access all features

## State Transitions

### OTP Record States
```
pending → verified (successful verification)
pending → expired (time elapsed)
pending → failed (max attempts reached)
```

### User Account States
```
unverified → verified (email OTP verified)
```

## Indexes

| Index | Fields | Purpose |
|-------|--------|---------|
| Unique | `userId` + `purpose` | Find active OTP for user+purpose |
| Index | `email` | Find OTP by email (password reset) |
| TTL | `expiresAt` | Auto-delete expired OTPs |

## Relationships

- OTP Record → User: Many-to-One (one user can have multiple OTP records over time)
- User Account → OTP Record: One-to-Many (for history/audit)