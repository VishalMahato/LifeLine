/**
 * HelperConstants - Centralized constants for Helper module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export default class HelperConstants {
    // Roles and Permissions
    static ROLES = {
        HELPER: 'helper',
        NGO: 'ngo',
        ADMIN: 'admin'
    };

    // Helper Status
    static STATUS = {
        PENDING: 'pending',
        ACTIVE: 'active',
        SUSPENDED: 'suspended',
        INACTIVE: 'inactive'
    };

    // Verification Status
    static VERIFICATION_STATUS = {
        UNVERIFIED: 'unverified',
        PENDING: 'pending',
        VERIFIED: 'verified',
        REJECTED: 'rejected'
    };

    // Skill Categories
    static SKILL_CATEGORIES = {
        MEDICAL: 'medical',
        TECHNICAL: 'technical',
        LOGISTICAL: 'logistical',
        EMOTIONAL: 'emotional',
        LANGUAGE: 'language'
    };

    // Availability Status
    static AVAILABILITY_STATUS = {
        AVAILABLE: 'available',
        BUSY: 'busy',
        OFFLINE: 'offline',
        ON_DUTY: 'on_duty'
    };

    // Badge Types
    static BADGE_TYPES = {
        LIFESAVER: 'lifesaver',
        QUICK_RESPONDER: 'quick_responder',
        RELIABLE: 'reliable',
        EXPERT: 'expert',
        VOLUNTEER: 'volunteer'
    };

    // Validation Messages
    static MESSAGES = {
        VALIDATION: {
            INVALID_SKILLS: 'Invalid skills format',
            INVALID_CREDENTIALS: 'Invalid credentials format',
            INVALID_AVAILABILITY: 'Invalid availability format',
            INVALID_LOCATION: 'Invalid location data',
            MISSING_REQUIRED_FIELDS: 'Missing required fields',
            INVALID_BADGE_TYPE: 'Invalid badge type',
            INVALID_STATUS: 'Invalid status',
            INVALID_VERIFICATION_STATUS: 'Invalid verification status'
        },
        SUCCESS: {
            HELPER_CREATED: 'Helper profile created successfully',
            HELPER_UPDATED: 'Helper profile updated successfully',
            HELPER_VERIFIED: 'Helper verified successfully',
            AVAILABILITY_UPDATED: 'Availability updated successfully',
            SKILLS_UPDATED: 'Skills updated successfully',
            BADGE_AWARDED: 'Badge awarded successfully'
        },
        ERROR: {
            HELPER_NOT_FOUND: 'Helper not found',
            UNAUTHORIZED: 'Unauthorized access',
            VERIFICATION_FAILED: 'Verification failed',
            UPDATE_FAILED: 'Update failed',
            INVALID_DATA: 'Invalid data provided'
        }
    };

    // Default Values
    static DEFAULTS = {
        STATUS: this.STATUS.PENDING,
        VERIFICATION_STATUS: this.VERIFICATION_STATUS.UNVERIFIED,
        AVAILABILITY_STATUS: this.AVAILABILITY_STATUS.OFFLINE,
        RATING: 0,
        RESPONSE_TIME: 0,
        COMPLETION_RATE: 0,
        TOTAL_REQUESTS: 0,
        SUCCESSFUL_REQUESTS: 0
    };

    // Rate Limiting
    static RATE_LIMITS = {
        CREATE_HELPER: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
        UPDATE_PROFILE: { windowMs: 15 * 60 * 1000, max: 10 },
        SEARCH_HELPERS: { windowMs: 15 * 60 * 1000, max: 50 }
    };

    // Pagination
    static PAGINATION = {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    };

    // Search and Filter
    static SEARCH = {
        MAX_DISTANCE_KM: 50,
        DEFAULT_DISTANCE_KM: 10,
        SORT_OPTIONS: ['rating', 'responseTime', 'distance', 'price']
    };

    // Performance Metrics
    static PERFORMANCE_THRESHOLDS = {
        HIGH_RATING: 4.5,
        GOOD_RESPONSE_TIME: 300, // seconds
        HIGH_COMPLETION_RATE: 0.95
    };
}