import UserConstants from './User.constants.mjs';

/**
 * UserUtils - Utility functions for User module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class UserUtils {
    static EMERGENCY_RELATIONSHIPS = new Set([
        'parent',
        'spouse',
        'sibling',
        'child',
        'friend',
        'other',
    ]);

    static EMERGENCY_RELATIONSHIP_ALIASES = {
        mom: 'parent',
        mother: 'parent',
        dad: 'parent',
        father: 'parent',
        husband: 'spouse',
        wife: 'spouse',
        partner: 'spouse',
        boyfriend: 'spouse',
        girlfriend: 'spouse',
        brother: 'sibling',
        sister: 'sibling',
        son: 'child',
        daughter: 'child',
    };

    /**
     * Normalize emergency contact input across payload variants.
     * Accepts both legacy and newer keys and returns canonical shape.
     * @param {Object} contact
     * @returns {{name: string, relationship: string, phoneNumber: string, isPrimary: boolean, email?: string}}
     */
    static normalizeEmergencyContact(contact = {}) {
        const rawName = contact.name ?? contact.fullName ?? '';
        const rawRelationship = contact.relationship ?? contact.relation ?? '';
        const rawPhone = contact.phoneNumber ?? contact.phone ?? '';

        const relationshipRaw = String(rawRelationship).trim().toLowerCase();
        const relationship = this.EMERGENCY_RELATIONSHIPS.has(relationshipRaw)
            ? relationshipRaw
            : (this.EMERGENCY_RELATIONSHIP_ALIASES[relationshipRaw] || relationshipRaw);

        return {
            name: String(rawName).trim(),
            relationship,
            phoneNumber: String(rawPhone).trim(),
            isPrimary: Boolean(contact.isPrimary ?? contact.primary),
            email: typeof contact.email === 'string' ? contact.email.toLowerCase().trim() : undefined,
        };
    }

    /**
     * Validate emergency contacts array
     * @param {Array} emergencyContacts
     * @returns {boolean}
     */
    static validateEmergencyContacts(emergencyContacts) {
        if (!Array.isArray(emergencyContacts)) return false;

        return emergencyContacts.every(contact => {
            const normalized = this.normalizeEmergencyContact(contact);
            return (
                normalized.name &&
                normalized.phoneNumber &&
                normalized.relationship &&
                this.EMERGENCY_RELATIONSHIPS.has(normalized.relationship) &&
                /^[+]?[\d\s\-()]+$/.test(normalized.phoneNumber) &&
                normalized.phoneNumber.replace(/\D/g, '').length >= 10 &&
                normalized.phoneNumber.replace(/\D/g, '').length <= 15 &&
                (!normalized.email || this.isValidEmail(normalized.email))
            );
        });
    }

    /**
     * Validate email format
     * @param {string} email
     * @returns {boolean}
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Format user response for API
     * @param {Object} user
     * @returns {Object} Formatted user data
     */
    static formatUserResponse(user) {
        return {
            id: user._id,
            authId: user.authId,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            address: user.address,
            emergencyContacts: user.emergencyContacts,
            medicalId: user.medicalId,
            locationId: user.locationId,
            role: user.role,
            status: user.status,
            profileCompleted: user.profileCompleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    /**
     * Check if user profile is complete
     * @param {Object} user
     * @returns {boolean}
     */
    static isProfileComplete(user) {
        const requiredFields = [
            'fullName',
            'email',
            'phoneNumber',
            'dateOfBirth',
            'gender',
            'address',
            'emergencyContacts'
        ];

        return requiredFields.every(field => {
            if (field === 'emergencyContacts') {
                return user.emergencyContacts && user.emergencyContacts.length > 0;
            }
            return user[field];
        });
    }

    /**
     * Sanitize user input data
     * @param {Object} userData
     * @returns {Object} Sanitized data
     */
    static sanitizeUserData(userData) {
        const sanitized = { ...userData };

        // Trim string fields
        ['fullName', 'email', 'phoneNumber', 'gender'].forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = sanitized[field].trim();
            }
        });

        // Convert email to lowercase
        if (sanitized.email) {
            sanitized.email = sanitized.email.toLowerCase();
        }

        // Sanitize emergency contacts
        if (sanitized.emergencyContacts) {
            sanitized.emergencyContacts = sanitized.emergencyContacts.map(contact => {
                const normalized = this.normalizeEmergencyContact(contact);
                return {
                    name: normalized.name,
                    phoneNumber: normalized.phoneNumber,
                    email: normalized.email,
                    relationship: normalized.relationship,
                    isPrimary: normalized.isPrimary,
                };
            });
        }

        return sanitized;
    }

    /**
     * Generate user search query
     * @param {Object} filters
     * @returns {Object} MongoDB query
     */
    static buildSearchQuery(filters) {
        const query = {
            status: UserConstants.STATUS.ACTIVE
        };

        if (filters.role) {
            query.role = filters.role;
        }

        if (filters.profileCompleted !== undefined) {
            query.profileCompleted = filters.profileCompleted;
        }

        if (filters.hasEmergencyContacts !== undefined) {
            if (filters.hasEmergencyContacts) {
                query['emergencyContacts.0'] = { $exists: true };
            } else {
                query.$or = [
                    { emergencyContacts: { $exists: false } },
                    { emergencyContacts: { $size: 0 } }
                ];
            }
        }

        return query;
    }

    /**
     * Generate sort options for user search
     * @param {string} sortBy
     * @param {string} sortOrder
     * @returns {Object} MongoDB sort object
     */
    static buildSortOptions(sortBy = 'createdAt', sortOrder = 'desc') {
        const sortOptions = {};

        switch (sortBy) {
            case 'createdAt':
                sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'fullName':
                sortOptions.fullName = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'updatedAt':
                sortOptions.updatedAt = sortOrder === 'desc' ? -1 : 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        return sortOptions;
    }
}
