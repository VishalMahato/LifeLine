import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AuthConstants from './Auth.constants.mjs';

/**
 * AuthUtils - Utility functions for authentication operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
class AuthUtils {
    /**
     * Hash a password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    static async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(AuthConstants.PASSWORD.SALT_ROUNDS);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            throw new Error(`Password hashing failed: ${error.message}`);
        }
    }

    /**
     * Compare a plain text password with a hashed password
     * @param {string} password - Plain text password
     * @param {string} hashedPassword - Hashed password from database
     * @returns {Promise<boolean>} True if passwords match
     */
    static async comparePassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new Error(`Password comparison failed: ${error.message}`);
        }
    }

    /**
     * Generate JWT access token
     * @param {Object} payload - Token payload
     * @returns {string} JWT token
     */
    static generateAccessToken(payload) {
        try {
            return jwt.sign(payload, AuthConstants.JWT.SECRET, {
                expiresIn: AuthConstants.JWT.EXPIRES_IN
            });
        } catch (error) {
            throw new Error(`Access token generation failed: ${error.message}`);
        }
    }

    /**
     * Generate JWT refresh token
     * @param {Object} payload - Token payload
     * @returns {string} Refresh token
     */
    static generateRefreshToken(payload) {
        try {
            return jwt.sign(payload, AuthConstants.JWT.SECRET, {
                expiresIn: AuthConstants.JWT.REFRESH_EXPIRES_IN
            });
        } catch (error) {
            throw new Error(`Refresh token generation failed: ${error.message}`);
        }
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token to verify
     * @returns {Object} Decoded token payload
     */
    static verifyToken(token) {
        try {
            return jwt.verify(token, AuthConstants.JWT.SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            } else {
                throw new Error(`Token verification failed: ${error.message}`);
            }
        }
    }

    /**
     * Generate a secure random token for email verification or password reset
     * @returns {string} Random token
     */
    static generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Generate email verification token
     * @param {string} userId - User ID
     * @returns {Object} Token and expiry
     */
    static generateEmailVerificationToken(userId) {
        const token = this.generateSecureToken();
        const expiresAt = new Date(Date.now() + AuthConstants.EMAIL.VERIFICATION_EXPIRES_IN);

        return {
            token,
            expiresAt
        };
    }

    /**
     * Generate password reset token
     * @param {string} userId - User ID
     * @returns {Object} Token and expiry
     */
    static generatePasswordResetToken(userId) {
        const token = this.generateSecureToken();
        const expiresAt = new Date(Date.now() + AuthConstants.EMAIL.RESET_PASSWORD_EXPIRES_IN);

        return {
            token,
            expiresAt
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[+]?[\d\s\-()]+$/;
        return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 15;
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with isValid and errors
     */
    static validatePasswordStrength(password) {
        const errors = [];

        if (password.length < AuthConstants.PASSWORD.MIN_LENGTH) {
            errors.push(`Password must be at least ${AuthConstants.PASSWORD.MIN_LENGTH} characters long`);
        }

        if (password.length > AuthConstants.PASSWORD.MAX_LENGTH) {
            errors.push(`Password cannot exceed ${AuthConstants.PASSWORD.MAX_LENGTH} characters`);
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitize user input
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized input
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential XSS characters
            .substring(0, 1000); // Limit length
    }

    /**
     * Format user data for response (remove sensitive information)
     * @param {Object} user - User object from database
     * @returns {Object} Formatted user data
     */
    static formatUserResponse(user) {
        const { password, ...userWithoutPassword } = user._doc || user;
        return {
            ...userWithoutPassword,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    /**
     * Check if token is expired
     * @param {Date} expiryDate - Token expiry date
     * @returns {boolean} True if expired
     */
    static isTokenExpired(expiryDate) {
        return new Date() > new Date(expiryDate);
    }

    /**
     * Generate a unique identifier
     * @returns {string} UUID-like string
     */
    static generateId() {
        return crypto.randomUUID();
    }

    /**
     * Extract token from Authorization header
     * @param {string} authHeader - Authorization header value
     * @returns {string|null} Token or null
     */
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    /**
     * Create standardized API response
     * @param {boolean} success - Success status
     * @param {string} message - Response message
     * @param {Object} data - Response data
     * @param {number} statusCode - HTTP status code
     * @returns {Object} Standardized response
     */
    static createResponse(success, message, data = null, statusCode = 200) {
        const response = {
            success,
            message,
            timestamp: new Date().toISOString()
        };

        if (data !== null) {
            response.data = data;
        }

        return { response, statusCode };
    }

    /**
     * Create success response
     * @param {string} message - Success message
     * @param {Object} data - Response data
     * @param {number} statusCode - HTTP status code
     * @returns {Object} Success response
     */
    static createSuccessResponse(message, data = null, statusCode = AuthConstants.HTTP_STATUS.OK) {
        return this.createResponse(true, message, data, statusCode);
    }

    /**
     * Create error response
     * @param {string} message - Error message
     * @param {Object} data - Error data
     * @param {number} statusCode - HTTP status code
     * @returns {Object} Error response
     */
    static createErrorResponse(message, data = null, statusCode = AuthConstants.HTTP_STATUS.BAD_REQUEST) {
        return this.createResponse(false, message, data, statusCode);
    }
}

export default AuthUtils;
