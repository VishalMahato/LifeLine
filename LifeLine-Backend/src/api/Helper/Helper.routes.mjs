import express from 'express';
import HelperController from './Helper.controller.mjs';
import HelperConstants from './Helper.constants.mjs';
import AuthMiddleware from '../Auth/v1/Auth.middleware.mjs';

const router = express.Router();

/**
 * Helper Routes - API endpoints for Helper operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

// Payment endpoints
router.post('/:id/payments',
    AuthMiddleware.authenticate,
    HelperController.createPayment
);

router.get('/:id/payments',
    AuthMiddleware.authenticate,
    HelperController.getPayments
);

router.patch('/payments/:paymentId/status',
    AuthMiddleware.authenticate,
    HelperController.updatePaymentStatus
);

// Create helper profile
router.post('/',
    // authenticate, // Uncomment when auth middleware is available
    HelperController.createHelper
);

// Get current user's helper profile
router.get('/profile/me',
    AuthMiddleware.authenticate,
    HelperController.getMyProfile
);

// Get helper availability by auth/helper id
router.get('/checkCurrentAvailability/:id',
    HelperController.getCurrentAvailabilityStatus
);

// Get helper by ID
router.get('/:id',
    // AuthMiddleware.authenticate,
    HelperController.getHelper
);

// Update helper profile
router.put('/:id',
    // authenticate, authorize([HelperConstants.ROLES.HELPER, HelperConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    HelperController.updateHelper
);

// Update helper availability
router.patch('/:id/availability',
    // authenticate, authorize([HelperConstants.ROLES.HELPER]), // Uncomment when auth middleware is available
    HelperController.updateAvailability
);

// Update helper skills
router.patch('/:id/skills',
    // authenticate, authorize([HelperConstants.ROLES.HELPER]), // Uncomment when auth middleware is available
    HelperController.updateSkills
);

// Search helpers
router.get('/',
    // Add rate limiting when available
    HelperController.searchHelpers
);

// Admin routes - Verify credentials
router.patch('/:id/credentials/:credentialId/verify',
    // authenticate, authorize([HelperConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    HelperController.verifyCredentials
);

// Admin routes - Award badge
router.post('/:id/badges',
    // authenticate, authorize([HelperConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    HelperController.awardBadge
);

// Admin routes - Update metrics (internal use)
router.patch('/:id/metrics',
    // authenticate, authorize([HelperConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    HelperController.updateMetrics
);

// Admin routes - Delete helper
router.delete('/:id',
    // authenticate, authorize([HelperConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    HelperController.deleteHelper
);

export default router;
