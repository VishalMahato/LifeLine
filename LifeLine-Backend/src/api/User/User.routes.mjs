import express from 'express';
import UserController from './User.controller.mjs';
import UserConstants from './User.constants.mjs';
// Import auth middleware when available
// import { authenticate, authorize } from '../Auth/Auth.middleware.mjs';

const router = express.Router();

/**
 * User Routes - API endpoints for User operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

// Create user profile
router.post('/',
    // authenticate, // Uncomment when auth middleware is available
    UserController.createUser
);

// Get user by ID
router.get('/:id',
    // authenticate, // Uncomment when auth middleware is available
    UserController.getUser
);

// Get current user's profile
router.get('/profile/me',
    // authenticate, // Uncomment when auth middleware is available
    UserController.getMyProfile
);

// Update user profile
router.put('/:id',
    // authenticate, authorize([UserConstants.ROLES.USER, UserConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    UserController.updateUser
);

// Update emergency contacts
router.put('/:id/emergency-contacts',
    // authenticate, authorize([UserConstants.ROLES.USER]), // Uncomment when auth middleware is available
    UserController.updateEmergencyContacts
);

// Add emergency contact
router.post('/:id/emergency-contacts',
    // authenticate, authorize([UserConstants.ROLES.USER]), // Uncomment when auth middleware is available
    UserController.addEmergencyContact
);

// Remove emergency contact
router.delete('/:id/emergency-contacts/:contactId',
    // authenticate, authorize([UserConstants.ROLES.USER]), // Uncomment when auth middleware is available
    UserController.removeEmergencyContact
);

// Update medical information reference
router.patch('/:id/medical',
    // authenticate, authorize([UserConstants.ROLES.USER]), // Uncomment when auth middleware is available
    UserController.updateMedicalInfo
);

// Update location reference
router.patch('/:id/location',
    // authenticate, authorize([UserConstants.ROLES.USER]), // Uncomment when auth middleware is available
    UserController.updateLocation
);

// Get user dashboard
router.get('/:id/dashboard',
    // authenticate, // Uncomment when auth middleware is available
    UserController.getDashboard
);

// Search users (Admin only)
router.get('/',
    // authenticate, authorize([UserConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    UserController.searchUsers
);

// Delete user profile (Admin only)
router.delete('/:id',
    // authenticate, authorize([UserConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    UserController.deleteUser
);

export default router;