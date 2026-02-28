import { body, param, validationResult } from 'express-validator';
import AuthConstants from './Auth.constants.mjs';

/**
 * AuthValidator - Comprehensive validation middleware for authentication
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
class AuthValidator {
    /**
     * Handle validation errors
     */
    static handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(AuthConstants.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }

    /**
     * Validate signup step 1 data
     */
    static validateSignupStep1 = [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage(AuthConstants.MESSAGES.VALIDATION.NAME_TOO_SHORT)
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name can only contain letters and spaces'),

        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage(AuthConstants.MESSAGES.VALIDATION.EMAIL_INVALID),

        body('phoneNumber')
            .matches(/^[+]?[\d\s\-()]+$/)
            .withMessage(AuthConstants.MESSAGES.VALIDATION.PHONE_INVALID)
            .isLength({ min: 10, max: 15 })
            .withMessage('Phone number must be between 10 and 15 characters'),

        body('role')
            .isIn([AuthConstants.ROLES.USER, AuthConstants.ROLES.HELPER])
            .withMessage(AuthConstants.MESSAGES.VALIDATION.ROLE_INVALID),

        body('profileImage')
            .optional()
            .isURL()
            .withMessage('Profile image must be a valid URL'),

        this.handleValidationErrors
    ];

    /**
     * Validate login credentials
     */
    static validateLogin = [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage(AuthConstants.MESSAGES.VALIDATION.EMAIL_INVALID),

        body('password')
            .notEmpty()
            .withMessage(AuthConstants.MESSAGES.VALIDATION.PASSWORD_REQUIRED),

        this.handleValidationErrors
    ];

    /**
     * Validate password reset request
     */
    static validatePasswordResetRequest = [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage(AuthConstants.MESSAGES.VALIDATION.EMAIL_INVALID),

        this.handleValidationErrors
    ];

    /**
     * Validate password reset
     */
    static validatePasswordReset = [
        body('token')
            .notEmpty()
            .withMessage('Reset token is required'),

        body('password')
            .isLength({ min: AuthConstants.PASSWORD.MIN_LENGTH })
            .withMessage(AuthConstants.MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage(AuthConstants.MESSAGES.VALIDATION.PASSWORD_TOO_WEAK),

        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }),

        this.handleValidationErrors
    ];

    /**
     * Validate change password payload
     */
    static validateChangePassword = [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),

        body('newPassword')
            .isLength({ min: AuthConstants.PASSWORD.MIN_LENGTH })
            .withMessage(AuthConstants.MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage(AuthConstants.MESSAGES.VALIDATION.PASSWORD_TOO_WEAK),

        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }),

        this.handleValidationErrors
    ];

    /**
     * Validate email verification
     */
    static validateEmailVerification = [
        param('token')
            .notEmpty()
            .withMessage('Verification token is required'),

        this.handleValidationErrors
    ];

    /**
     * Validate social login
     */
    static validateSocialLogin = [
        body('provider')
            .isIn([AuthConstants.SOCIAL_PROVIDERS.GOOGLE, AuthConstants.SOCIAL_PROVIDERS.APPLE])
            .withMessage('Invalid social login provider'),

        body('token')
            .notEmpty()
            .withMessage('Social login token is required'),

        this.handleValidationErrors
    ];

    /**
     * Validate email check
     */
    static validateEmailCheck = [
        param('email')
            .isEmail()
            .normalizeEmail()
            .withMessage(AuthConstants.MESSAGES.VALIDATION.EMAIL_INVALID),

        this.handleValidationErrors
    ];

    /**
     * Validate auth ID parameter
     */
    static validateAuthId = [
        param('authId')
            .isMongoId()
            .withMessage('Invalid auth ID format'),

        this.handleValidationErrors
    ];

    /**
     * Validate emergency contacts
     */
    static validateEmergencyContacts = [
        body('emergencyContacts')
            .isArray({ min: AuthConstants.EMERGENCY_CONTACTS.MIN_CONTACTS, max: AuthConstants.EMERGENCY_CONTACTS.MAX_CONTACTS })
            .withMessage(`Emergency contacts must be between ${AuthConstants.EMERGENCY_CONTACTS.MIN_CONTACTS} and ${AuthConstants.EMERGENCY_CONTACTS.MAX_CONTACTS} contacts`),

        body('emergencyContacts.*.name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Emergency contact name must be between 2 and 50 characters'),

        body('emergencyContacts.*.relationship')
            .isIn(['parent', 'spouse', 'sibling', 'child', 'friend', 'other'])
            .withMessage('Invalid relationship type'),

        body('emergencyContacts.*.phoneNumber')
            .matches(/^[+]?[\d\s\-()]+$/)
            .withMessage('Invalid emergency contact phone number'),

        body('emergencyContacts.*.isPrimary')
            .isBoolean()
            .withMessage('isPrimary must be a boolean'),

        this.handleValidationErrors
    ];

    /**
     * Validate helper skills and credentials
     */
    static validateHelperData = [
        body('skills')
            .isArray({ min: 1 })
            .withMessage('At least one skill is required'),

        body('skills.*')
            .isIn(AuthConstants.SKILLS)
            .withMessage('Invalid skill selected'),

        body('credentials')
            .optional()
            .isArray()
            .withMessage('Credentials must be an array'),

        body('credentials.*.type')
            .optional()
            .isIn(['medical_license', 'certification', 'id_proof', 'other'])
            .withMessage('Invalid credential type'),

        body('credentials.*.documentUrl')
            .optional()
            .isURL()
            .withMessage('Document URL must be valid'),

        this.handleValidationErrors
    ];

    /**
     * Validate medical information
     */
    static validateMedicalInfo = [
        body('bloodType')
            .optional()
            .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
            .withMessage('Invalid blood type'),

        body('dateOfBirth')
            .optional()
            .isISO8601()
            .withMessage('Invalid date of birth format'),

        body('height')
            .optional()
            .isString()
            .withMessage('Height must be a string'),

        body('weight')
            .optional()
            .isString()
            .withMessage('Weight must be a string'),

        body('allergies')
            .optional()
            .isString()
            .withMessage('Allergies must be a string'),

        body('medications')
            .optional()
            .isString()
            .withMessage('Medications must be a string'),

        body('conditions')
            .optional()
            .isString()
            .withMessage('Conditions must be a string'),

        this.handleValidationErrors
    ];

    /**
     * Validate location data
     */
    static validateLocationData = [
        body()
            .custom((body) => {
                const hasCoordinates = body.latitude && body.longitude;
                const hasManualAddress = body.address && body.city && body.zipCode;

                if (!hasCoordinates && !hasManualAddress) {
                    throw new Error('Either GPS coordinates or manual address is required');
                }
                return true;
            }),

        body('latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Invalid latitude'),

        body('longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),

        body('address')
            .optional()
            .isString()
            .isLength({ min: 5, max: 200 })
            .withMessage('Address must be between 5 and 200 characters'),

        body('city')
            .optional()
            .isString()
            .isLength({ min: 2, max: 100 })
            .withMessage('City must be between 2 and 100 characters'),

        body('zipCode')
            .optional()
            .isString()
            .matches(/^\d{5}(-\d{4})?$/)
            .withMessage('Invalid zip code format'),

        this.handleValidationErrors
    ];
}

export default AuthValidator;
