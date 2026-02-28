import express from 'express';
import AuthController from './Auth.controller.mjs';
import AuthValidator from './Auth.validator.mjs';
import AuthConstants from './Auth.constants.mjs';
import rateLimit from 'express-rate-limit';

/**
 * AuthRoutes - Route definitions for authentication endpoints
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
class AuthRoutes {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
        this.setupMiddleware();
    }

    /**
     * Setup rate limiting middleware
     */
    setupMiddleware() {
        // Signup rate limiting
        const signupLimiter = rateLimit({
            windowMs: AuthConstants.RATE_LIMIT.SIGNUP.windowMs,
            max: AuthConstants.RATE_LIMIT.SIGNUP.max,
            message: {
                success: false,
                message: 'Too many signup attempts, please try again later.',
                retryAfter: Math.ceil(AuthConstants.RATE_LIMIT.SIGNUP.windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        // Login rate limiting
        const loginLimiter = rateLimit({
            windowMs: AuthConstants.RATE_LIMIT.LOGIN.windowMs,
            max: AuthConstants.RATE_LIMIT.LOGIN.max,
            message: {
                success: false,
                message: 'Too many login attempts, please try again later.',
                retryAfter: Math.ceil(AuthConstants.RATE_LIMIT.LOGIN.windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        // General rate limiting
        const generalLimiter = rateLimit({
            windowMs: AuthConstants.RATE_LIMIT.GENERAL.windowMs,
            max: AuthConstants.RATE_LIMIT.GENERAL.max,
            message: {
                success: false,
                message: 'Too many requests, please try again later.',
                retryAfter: Math.ceil(AuthConstants.RATE_LIMIT.GENERAL.windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        // Apply rate limiting to specific routes
        this.router.use('/signup-step1', signupLimiter);
        this.router.use('/login', loginLimiter);
        this.router.use(generalLimiter);
    }

    /**
     * Setup all authentication routes
     */
    setupRoutes() {
        // Public routes (no authentication required)
        this.setupPublicRoutes();

        // Protected routes (authentication required)
        this.setupProtectedRoutes();
    }

    /**
     * Setup public routes
     */
    setupPublicRoutes() {
        // Signup step 1 - Create auth record
        this.router.post(
            '/signup-step1',
            AuthValidator.validateSignupStep1,
            AuthController.signupStep1
        );

        // Complete user signup (Steps 2-5)
        this.router.post(
            '/signup-complete/user/:authId',
            AuthValidator.validateAuthId,
            AuthController.completeUserSignup
        );

        // Complete helper signup (Steps 2-5)
        this.router.post(
            '/signup-complete/helper/:authId',
            AuthValidator.validateAuthId,
            AuthController.completeHelperSignup
        );

        // Update user profile during signup
        this.router.patch(
            '/signup/user/:authId',
            AuthValidator.validateAuthId,
            AuthController.updateUserProfile
        );

        // Update helper profile during signup
        this.router.patch(
            '/signup/helper/:authId',
            AuthValidator.validateAuthId,
            AuthController.updateHelperProfile
        );

        // Update emergency contacts during signup
        this.router.patch(
            '/signup/emergency-contacts/:authId',
            AuthValidator.validateAuthId,
            AuthController.updateEmergencyContacts
        );

        // Update medical info during signup
        this.router.patch(
            '/signup/medical/:authId',
            AuthValidator.validateAuthId,
            AuthController.updateMedicalInfo
        );

        // Update location during signup
        this.router.patch(
            '/signup/location/:authId',
            AuthValidator.validateAuthId,
            AuthController.updateLocation
        );

        // Get signup progress
        this.router.get(
            '/signup/progress/:authId',
            AuthValidator.validateAuthId,
            AuthController.getSignupProgress
        );

        // Check if email exists
        this.router.get(
            '/check-email/:email',
            AuthValidator.validateEmailCheck,
            AuthController.checkEmail
        );

        // Login
        this.router.post(
            '/login',
            AuthValidator.validateLogin,
            AuthController.login
        );

        // Social login
        this.router.post(
            '/social-login',
            AuthValidator.validateSocialLogin,
            AuthController.socialLogin
        );

        // Email verification
        this.router.get(
            '/verify-email/:token',
            AuthValidator.validateEmailVerification,
            AuthController.verifyEmail
        );

        // Password reset request
        this.router.post(
            '/forgot-password',
            AuthValidator.validatePasswordResetRequest,
            AuthController.requestPasswordReset
        );

        // Password reset
        this.router.post(
            '/reset-password',
            AuthValidator.validatePasswordReset,
            AuthController.resetPassword
        );

        // Refresh token
        this.router.post(
            '/refresh-token',
            AuthController.refreshToken
        );

        // Update auth record (used by other services)
        this.router.patch(
            '/:authId',
            AuthValidator.validateAuthId,
            AuthController.updateAuth
        );
    }

    /**
     * Setup protected routes (require authentication)
     */
    setupProtectedRoutes() {
        // Change password
        this.router.post(
            '/change-password',
            AuthValidator.validatePasswordReset, // Reuse validation
            AuthController.changePassword
        );

        // Get profile
        this.router.get(
            '/profile',
            AuthController.getProfile
        );

        // Update profile
        this.router.patch(
            '/profile',
            AuthController.updateProfile
        );

        // Delete account
        this.router.delete(
            '/account',
            AuthController.deleteAccount
        );

        // Logout
        this.router.post(
            '/logout',
            AuthController.logout
        );
    }

    /**
     * Get the configured router
     * @returns {Object} Express router
     */
    getRouter() {
        return this.router;
    }
}

// Export singleton instance
const authRoutes = new AuthRoutes();
export default authRoutes.getRouter();
