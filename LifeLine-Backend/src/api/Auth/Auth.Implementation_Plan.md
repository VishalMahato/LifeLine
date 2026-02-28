# Auth Module Implementation Plan

## Overview

This document outlines the complete implementation strategy for the LifeLine Authentication module. The auth module handles user registration, login, verification, and role-based authentication for Users and Helpers.

## Current Status

### Existing

- `Auth.model.mjs` - MongoDB schema defined
- `Auth.service.mjs` - Empty service class
- `Auth.controller.mjs` - Empty
- `Auth.routes.mjs` - Empty
- `Auth.utils.mjs` - Empty

### Missing Core Features

- OTP generation and verification
- JWT token management
- Password hashing (if using password auth)
- Phone/email verification workflow
- Role-based registration logic
- Session management
- Refresh token mechanism
- Authentication middleware
- Input validation
- Error handling

---

## Implementation Architecture

### 1. Authentication Flow Design

#### Registration Flow

1. User submits signup data (name, email/phone, role)
2. Validate input data
3. Check if user already exists
4. Generate OTP for verification
5. Store temporary auth record
6. Send OTP via SMS/Email
7. User submits OTP
8. Verify OTP and activate account
9. Generate JWT tokens
10. Return user data + tokens

#### Login Flow

1. User submits email/phone + credentials/OTP
2. Validate input
3. Find and verify user exists
4. Check if blocked/deactivated
5. Validate credentials or OTP
6. Update last login timestamp
7. Generate access + refresh tokens
8. Return auth response

#### Token Refresh Flow

1. Client sends refresh token
2. Validate refresh token
3. Generate new access token
4. Return new tokens

---

## File-wise Implementation

### `Auth.utils.mjs`

#### Required Functions

```javascript
// Token utilities
-generateAccessToken(payload) -
  generateRefreshToken(payload) -
  verifyToken(token) -
  // OTP utilities
  generateOTP((length = 6)) -
  hashOTP(otp) -
  verifyOTP(inputOTP, hashedOTP) -
  // Validation utilities
  validateEmail(email) -
  validatePhone(phone) -
  validatePassword(password) -
  sanitizeAuthInput(data) -
  // Response utilities
  createAuthResponse(user, tokens) -
  formatUserData(user);
```

#### Dependencies

- `jsonwebtoken` for JWT
- `bcryptjs` for hashing
- `crypto` for secure random generation

---

### `Auth.service.mjs`

#### Required Methods

```javascript
class AuthService {
  // Registration
  async signUp(userData)
  async verifySignUpOTP(authId, otp)

  // Login
  async login(credentials)
  async requestLoginOTP(identifier)
  async verifyLoginOTP(identifier, otp)

  // Token Management
  async refreshAccessToken(refreshToken)
  async logout(userId, deviceId)
  async logoutAllDevices(userId)

  // Account Management
  async resendVerificationOTP(authId)
  async forgotPassword(identifier)
  async resetPassword(token, newPassword)
  async updateProfile(authId, updateData)

  // Admin Actions
  async blockUser(authId, reason)
  async unblockUser(authId)
}
```

#### Business Logic Requirements

1. **Role-based User Creation**
   - If role = `user`: Create User document
   - If role = `helper`: Create Helper document
   - Link created document ID to Auth model

2. **Verification Workflow**
   - Store OTP with expiration (5-10 minutes)
   - Maximum retry attempts (3-5)
   - Rate limiting for OTP requests

3. **Security Measures**
   - Hash sensitive data
   - Token expiration management
   - Device/session tracking
   - Failed login attempt tracking

---

### `Auth.controller.mjs`

#### Required Endpoints

```javascript
class AuthController {
  // Public routes
  async signUp(req, res, next)
  async verifySignUpOTP(req, res, next)
  async login(req, res, next)
  async requestLoginOTP(req, res, next)
  async verifyLoginOTP(req, res, next)
  async refreshToken(req, res, next)
  async forgotPassword(req, res, next)
  async resetPassword(req, res, next)

  // Protected routes
  async logout(req, res, next)
  async logoutAll(req, res, next)
  async getProfile(req, res, next)
  async updateProfile(req, res, next)

  // Admin routes
  async blockUser(req, res, next)
  async unblockUser(req, res, next)
}
```

#### Controller Responsibilities

- Input validation
- Service method calls
- Response formatting
- Error forwarding
- Status code management

---

### `Auth.routes.mjs`

#### Route Structure

```javascript
// Public Auth Routes
POST   /api/v1/auth/signup
POST   /api/v1/auth/signup/verify-otp
POST   /api/v1/auth/login
POST   /api/v1/auth/login/request-otp
POST   /api/v1/auth/login/verify-otp
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

// Protected Routes
POST   /api/v1/auth/logout
POST   /api/v1/auth/logout-all
GET    /api/v1/auth/profile
PATCH  /api/v1/auth/profile

// Admin Routes
PATCH  /api/v1/auth/:authId/block
PATCH  /api/v1/auth/:authId/unblock
```

#### Middleware Integration

- Rate limiter for auth endpoints
- Validation middleware
- JWT auth middleware
- Role-based access control middleware

---

## Required New Files

### Additional Models Needed

#### 1. OTP Schema (`src/api/Auth/v1/OTP.model.mjs`)

```javascript
{
  authId: ObjectId,
  otpHash: String,
  type: String, // signup, login, forgot_password
  expiresAt: Date,
  attempts: Number,
  isUsed: Boolean,
  createdAt: Date
}
```

#### 2. Session Schema (`src/api/Auth/v1/Session.model.mjs`)

```javascript
{
  authId: ObjectId,
  refreshToken: String,
  deviceId: String,
  deviceInfo: Object,
  ipAddress: String,
  isActive: Boolean,
  expiresAt: Date
}
```

#### 3. Token Blacklist (`src/api/Auth/v1/TokenBlacklist.model.mjs`)

```javascript
{
  token: String,
  authId: ObjectId,
  expiresAt: Date
}
```

### Middleware Files Needed

#### 1. Auth Middleware (`src/middleware/auth.middleware.mjs`)

- Verify JWT token
- Extract user from token
- Attach user to request

#### 2. Role Middleware (`src/middleware/role.middleware.mjs`)

- Check user roles
- Protect role-specific routes

#### 3. Validation Middleware (`src/middleware/validation.middleware.mjs`)

- Request body validation
- Parameter validation

---

## Environment Variables Required

```env
# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRES_IN_MINUTES=10
OTP_MAX_ATTEMPTS=3
OTP_RESEND_COOLDOWN_SECONDS=60

# Security
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME_MINUTES=30

# Session
MAX_SESSIONS_PER_USER=5
```

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "user"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 900
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid OTP",
  "error": {
    "code": "INVALID_OTP",
    "details": "OTP has expired"
  }
}
```

---

## Implementation Priority

### Phase 1: Core Authentication (Week 1)

1. Implement `Auth.utils.mjs` token and validation utilities
2. Implement basic `signUp` and `login` in `Auth.service.mjs`
3. Implement controllers for signup/login
4. Set up basic routes
5. Add JWT middleware

### Phase 2: OTP Verification (Week 1-2)

1. Create OTP model
2. Implement OTP generation/verification
3. Add signup verification flow
4. Add login OTP option
5. Integrate SMS/Email service

### Phase 3: Session Management (Week 2)

1. Create Session model
2. Implement refresh token logic
3. Add logout/logout-all functionality
4. Add device tracking

### Phase 4: Advanced Security (Week 2-3)

1. Add rate limiting
2. Implement account lockout
3. Add password reset flow
4. Add token blacklist
5. Security testing

### Phase 5: Admin Features (Week 3)

1. Add block/unblock functionality
2. Add auth analytics endpoints
3. Add audit logging

---

## Dependencies to Install

```bash
pnpm add jsonwebtoken bcryptjs express-rate-limit joi
pnpm add -D @types/jsonwebtoken @types/bcryptjs
```

---

## Testing Requirements

### Unit Tests

- Auth utility functions
- Service methods
- OTP generation/verification
- Token management

### Integration Tests

- Complete signup flow
- Complete login flow
- Token refresh flow
- Protected route access
- Role-based route access

### Security Tests

- SQL/NoSQL injection prevention
- Brute force attack prevention
- Token tampering
- Session hijacking prevention

---

## Notes for Future Development

1. Consider implementing OAuth (Google, Apple) for easier signup
2. Add biometric authentication support for mobile app
3. Implement multi-factor authentication (MFA)
4. Add login history and suspicious activity detection
5. Consider Redis for OTP/session caching
6. Implement webhook support for auth events

---

## File Structure Target

```
src/
├── api/
│   └── Auth/
│       └── v1/
│           ├── Auth.model.mjs
│           ├── Auth.service.mjs
│           ├── Auth.controller.mjs
│           ├── Auth.routes.mjs
│           ├── Auth.utils.mjs
│           ├── OTP.model.mjs
│           ├── Session.model.mjs
│           └── TokenBlacklist.model.mjs
├── middleware/
│   ├── auth.middleware.mjs
│   ├── role.middleware.mjs
│   └── validation.middleware.mjs
└── utils/
    ├── jwt.utils.mjs
    ├── otp.utils.mjs
    └── response.utils.mjs
```

---

## Next Action Items

1. ✅ Update `package.json` with auth dependencies
2. ✅ Create `Auth.utils.mjs` with basic utilities
3. ✅ Implement `signUp` method in service
4. ✅ Implement `login` method in service
5. ✅ Create auth middleware
6. ✅ Wire auth routes in `server.mjs`
7. ✅ Add validation schemas
8. ✅ Create OTP model
9. ✅ Write tests for auth flow
