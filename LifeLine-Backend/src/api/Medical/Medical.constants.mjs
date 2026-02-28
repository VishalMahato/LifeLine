/**
 * MedicalConstants - Centralized constants for Medical module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export default class MedicalConstants {
    // Blood Types
    static BLOOD_TYPES = {
        A_POSITIVE: 'A+',
        A_NEGATIVE: 'A-',
        B_POSITIVE: 'B+',
        B_NEGATIVE: 'B-',
        AB_POSITIVE: 'AB+',
        AB_NEGATIVE: 'AB-',
        O_POSITIVE: 'O+',
        O_NEGATIVE: 'O-'
    };

    // Allergy Severity Levels
    static ALLERGY_SEVERITY = {
        MILD: 'mild',
        MODERATE: 'moderate',
        SEVERE: 'severe',
        LIFE_THREATENING: 'life_threatening'
    };

    // Condition Status
    static CONDITION_STATUS = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        RESOLVED: 'resolved',
        CHRONIC: 'chronic'
    };

    // Medication Frequency
    static MEDICATION_FREQUENCY = {
        AS_NEEDED: 'as_needed',
        DAILY: 'daily',
        TWICE_DAILY: 'twice_daily',
        THREE_TIMES_DAILY: 'three_times_daily',
        FOUR_TIMES_DAILY: 'four_times_daily',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly'
    };

    // Validation Messages
    static MESSAGES = {
        VALIDATION: {
            INVALID_BLOOD_TYPE: 'Invalid blood type',
            INVALID_ALLERGIES: 'Invalid allergies format',
            INVALID_CONDITIONS: 'Invalid conditions format',
            INVALID_MEDICATIONS: 'Invalid medications format',
            MISSING_REQUIRED_FIELDS: 'Missing required fields',
            INVALID_SEVERITY: 'Invalid allergy severity',
            INVALID_STATUS: 'Invalid condition status',
            INVALID_FREQUENCY: 'Invalid medication frequency'
        },
        SUCCESS: {
            MEDICAL_INFO_CREATED: 'Medical information created successfully',
            MEDICAL_INFO_UPDATED: 'Medical information updated successfully',
            ALLERGIES_UPDATED: 'Allergies updated successfully',
            CONDITIONS_UPDATED: 'Conditions updated successfully',
            MEDICATIONS_UPDATED: 'Medications updated successfully'
        },
        ERROR: {
            MEDICAL_INFO_NOT_FOUND: 'Medical information not found',
            UNAUTHORIZED: 'Unauthorized access',
            UPDATE_FAILED: 'Update failed',
            INVALID_DATA: 'Invalid data provided'
        }
    };

    // Default Values
    static DEFAULTS = {
        HAS_ALLERGIES: false,
        HAS_CONDITIONS: false,
        HAS_MEDICATIONS: false,
        ORGAN_DONOR: false,
        EMERGENCY_CONTACT_CONSENT: false
    };

    // Rate Limiting
    static RATE_LIMITS = {
        CREATE_MEDICAL: { windowMs: 15 * 60 * 1000, max: 3 }, // 3 requests per 15 minutes
        UPDATE_MEDICAL: { windowMs: 15 * 60 * 1000, max: 10 },
        GET_MEDICAL: { windowMs: 15 * 60 * 1000, max: 30 }
    };

    // Pagination
    static PAGINATION = {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    };
}