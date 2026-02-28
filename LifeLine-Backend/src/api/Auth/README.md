# 🔐 LifeLine Authentication Module

## Overview

A comprehensive, enterprise-grade authentication system built with Node.js, Express, and MongoDB. Designed for the LifeLine emergency response application with multi-step signup, JWT authentication, and role-based access control.

## 🏗️ Architecture

### Core Components

- **AuthConstants**: Centralized configuration and constants
- **AuthValidator**: Input validation and sanitization
- **AuthUtils**: Utility functions for passwords, tokens, and data formatting
- **AuthService**: Business logic layer
- **AuthController**: API endpoint handlers
- **AuthModel**: MongoDB schema and data models
- **AuthRoutes**: Route definitions with middleware
- **AuthMiddleware**: Authentication and authorization middleware
- **AuthTest**: Comprehensive test suite

## 🚀 Features

### Authentication Methods

- ✅ Multi-step user registration
- ✅ Email/password login
- ✅ Social login (Google, Apple)
- ✅ JWT token-based authentication
- ✅ Refresh token support
- ✅ Password reset via email
- ✅ Email verification

### Security Features

- ✅ bcrypt password hashing
- ✅ JWT token expiration
- ✅ Rate limiting
- ✅ Input validation and sanitization
- ✅ Account lockout after failed attempts
- ✅ CORS protection
- ✅ Security headers
- ✅ Request logging

### User Management

- ✅ Role-based access control (User/Helper)
- ✅ Profile management
- ✅ Account deletion
- ✅ Password change
- ✅ Email verification

## 📡 API Endpoints

### Public Endpoints

```
POST   /api/auth/signup-step1        → Create auth record
GET    /api/auth/check-email/:email  → Check email existence
POST   /api/auth/login               → User login
POST   /api/auth/social-login        → Social authentication
GET    /api/auth/verify-email/:token → Email verification
POST   /api/auth/forgot-password     → Password reset request
POST   /api/auth/reset-password      → Password reset
POST   /api/auth/refresh-token       → Refresh access token
```

### Protected Endpoints (Require Authentication)

```
GET    /api/auth/profile             → Get user profile
PATCH  /api/auth/profile             → Update profile
POST   /api/auth/change-password     → Change password
DELETE /api/auth/account             → Delete account
POST   /api/auth/logout              → Logout
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB 5+
- npm or pnpm

### Installation

```bash
cd LifeLine-Backend
pnpm install
```

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lifeline

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Usage

```javascript
import express from 'express';
import authRoutes from './src/api/Auth/v1/Auth.routes.mjs';
import AuthMiddleware from './src/api/Auth/v1/Auth.middleware.mjs';

const app = express();

// Apply global middleware
app.use(AuthMiddleware.cors);
app.use(AuthMiddleware.securityHeaders);
app.use(AuthMiddleware.logging);

// Mount auth routes
app.use('/api/auth', authRoutes);

// Protect other routes
app.use('/api/protected', AuthMiddleware.authenticate, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});

app.listen(3001, () => {
  console.log('Auth service running on port 3001');
});
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# Performance tests
pnpm test:performance
```

### Test Coverage

- ✅ Unit tests for all utilities
- ✅ Integration tests for API endpoints
- ✅ Security and validation tests
- ✅ Performance and load tests
- ✅ Rate limiting tests

## 🔒 Security Best Practices

### Password Security

- Minimum 8 characters
- Requires uppercase, lowercase, and numbers
- Salted hashing with bcrypt (12 rounds)
- No plaintext storage

### Token Security

- JWT with expiration (7 days access, 30 days refresh)
- Secure random token generation
- Token blacklisting capability

### Rate Limiting

- Signup: 5 requests per 15 minutes
- Login: 10 attempts per 15 minutes
- General: 100 requests per 15 minutes

### Input Validation

- Comprehensive validation with express-validator
- SQL injection prevention
- XSS protection
- Input sanitization

## 📊 Database Schema

```javascript
{
  name: String,
  email: String (unique),
  phoneNumber: String (unique),
  profileImage: String,
  password: String (hashed),
  role: Enum ['user', 'helper'],
  isVerified: Boolean,
  isBlocked: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  socialProvider: String,
  socialId: String,
  userId: ObjectId (ref: User),
  helperId: ObjectId (ref: Helper),
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Multi-Step Registration Flow

### For Users

1. **Step 1**: Auth info (name, email, phone, role)
2. **Step 2**: Emergency contacts
3. **Step 3**: Medical info (optional)
4. **Step 4**: Location (GPS/manual)

### For Helpers

1. **Step 1**: Auth info (name, email, phone, role)
2. **Step 2**: Skills & credentials
3. **Step 3**: Medical info (optional)
4. **Step 4**: Location (GPS/manual)

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

## 📈 Performance

- **Response Time**: < 100ms for most endpoints
- **Concurrent Users**: Supports 1000+ concurrent users
- **Database Queries**: Optimized with proper indexing
- **Caching**: Redis integration ready
- **Load Balancing**: Stateless design

## 🔧 Maintenance

### Logs

- Request/response logging
- Error tracking
- Performance monitoring
- Security audit logs

### Monitoring

- Health check endpoints
- Metrics collection
- Alert system integration

### Backup

- Database backups
- Configuration backups
- Log rotation

## 🤝 Contributing

1. Follow the established code structure
2. Add comprehensive tests
3. Update documentation
4. Follow security best practices
5. Use meaningful commit messages

## 📄 License

This module is part of the LifeLine application and follows the same licensing terms.

---

**Built with ❤️ by Senior Software Engineers**
