/**
 * UserConstants - Centralized constants for User module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export default class UserConstants {
    // Roles and Permissions
    static ROLES = {
        USER: 'user',
        ADMIN: 'admin'
    };

    // User Status
    static STATUS = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended'
    };

    // Emergency Contact Types
    static EMERGENCY_CONTACT_TYPES = {
        PRIMARY: 'primary',
        SECONDARY: 'secondary',
        FAMILY: 'family',
        FRIEND: 'friend'
    };

    // Validation Messages
    static MESSAGES = {
        VALIDATION: {
            INVALID_EMERGENCY_CONTACTS: 'Invalid emergency contacts format',
            MISSING_REQUIRED_FIELDS: 'Missing required fields',
            INVALID_STATUS: 'Invalid status',
            INVALID_ROLE: 'Invalid role',
            INVALID_CONTACT_TYPE: 'Invalid emergency contact type'
        },
        SUCCESS: {
            USER_CREATED: 'User profile created successfully',
            USER_UPDATED: 'User profile updated successfully',
            EMERGENCY_CONTACTS_UPDATED: 'Emergency contacts updated successfully',
            PROFILE_COMPLETED: 'Profile completed successfully'
        },
        ERROR: {
            USER_NOT_FOUND: 'User not found',
            UNAUTHORIZED: 'Unauthorized access',
            UPDATE_FAILED: 'Update failed',
            INVALID_DATA: 'Invalid data provided'
        }
    };

    // Default Values
    static DEFAULTS = {
        STATUS: this.STATUS.ACTIVE,
        ROLE: this.ROLES.USER
    };

    // Rate Limiting
    static RATE_LIMITS = {
        CREATE_USER: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
        UPDATE_PROFILE: { windowMs: 15 * 60 * 1000, max: 10 },
        GET_PROFILE: { windowMs: 15 * 60 * 1000, max: 30 }
    };

    // Pagination
    static PAGINATION = {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    };
}