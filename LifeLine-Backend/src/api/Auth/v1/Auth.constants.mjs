/**
 * AuthConstants - Centralized constants for authentication module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

class AuthConstants {
    // User Roles
    static ROLES = {
        USER: 'user',
        HELPER: 'helper'
    };

    // JWT Configuration
    static JWT = {
        SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    };

    // Password Configuration
    static PASSWORD = {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        SALT_ROUNDS: 12
    };

    // Email Configuration
    static EMAIL = {
        VERIFICATION_EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours
        RESET_PASSWORD_EXPIRES_IN: 60 * 60 * 1000 // 1 hour
    };

    // Rate Limiting
    static RATE_LIMIT = {
        SIGNUP: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 signups per 15 minutes
        LOGIN: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 login attempts per 15 minutes
        GENERAL: { windowMs: 15 * 60 * 1000, max: 100 } // 100 requests per 15 minutes
    };

    // Validation Messages
    static MESSAGES = {
        VALIDATION: {
            NAME_REQUIRED: 'Name is required',
            NAME_TOO_SHORT: 'Name must be at least 2 characters long',
            NAME_TOO_LONG: 'Name cannot exceed 50 characters',
            EMAIL_REQUIRED: 'Email is required',
            EMAIL_INVALID: 'Please enter a valid email address',
            EMAIL_EXISTS: 'Email address is already registered',
            PHONE_REQUIRED: 'Phone number is required',
            PHONE_INVALID: 'Please enter a valid phone number',
            PHONE_EXISTS: 'Phone number is already registered',
            PASSWORD_REQUIRED: 'Password is required',
            PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
            PASSWORD_TOO_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            ROLE_REQUIRED: 'Role is required',
            ROLE_INVALID: 'Role must be either user or helper'
        },
        AUTH: {
            INVALID_CREDENTIALS: 'Invalid email or password',
            ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
            ACCOUNT_NOT_VERIFIED: 'Please verify your email address before logging in.',
            TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
            TOKEN_INVALID: 'Invalid authentication token.',
            UNAUTHORIZED: 'You are not authorized to access this resource.',
            EMAIL_NOT_FOUND: 'No account found with this email address.',
            RESET_TOKEN_INVALID: 'Invalid or expired password reset token.'
        },
        SUCCESS: {
            SIGNUP_SUCCESS: 'Account created successfully. Please check your email for verification.',
            LOGIN_SUCCESS: 'Login successful.',
            LOGOUT_SUCCESS: 'Logout successful.',
            PASSWORD_RESET_SENT: 'Password reset instructions sent to your email.',
            PASSWORD_RESET_SUCCESS: 'Password reset successful.',
            EMAIL_VERIFIED: 'Email verified successfully.'
        }
    };

    // HTTP Status Codes
    static HTTP_STATUS = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        UNPROCESSABLE_ENTITY: 422,
        SERVICE_UNAVAILABLE: 503,
        INTERNAL_SERVER_ERROR: 500
    };

    // Emergency Contact Limits
    static EMERGENCY_CONTACTS = {
        MIN_CONTACTS: 1,
        MAX_CONTACTS: 5
    };

    // Skills List
    static SKILLS = [
        'CPR Certified',
        'First Aid',
        'Registered Nurse',
        'EMT / Paramedic',
        'Medical Doctor',
        'Lifeguard'
    ];

    // Social Login Providers
    static SOCIAL_PROVIDERS = {
        GOOGLE: 'google',
        APPLE: 'apple'
    };
}

export default AuthConstants;
