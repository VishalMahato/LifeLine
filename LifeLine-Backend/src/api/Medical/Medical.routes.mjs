import express from 'express';
import MedicalController from './Medical.controller.mjs';
import MedicalConstants from './Medical.constants.mjs';
import AuthMiddleware from '../Auth/v1/Auth.middleware.mjs';

const router = express.Router();

/**
 * Medical Routes - API endpoints for Medical operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

// Create medical information
router.post('/',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.createMedicalInfo
);

// Get current user's medical information
router.get('/profile/me',
    AuthMiddleware.authenticate,
    MedicalController.getMyMedicalInfo
);

// Get medical information by ID
router.get('/:id',
    // AuthMiddleware.authenticate,
    MedicalController.getMedicalInfo
);

// Update medical information
router.put('/:id',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.updateMedicalInfo
);

// Update allergies
router.put('/:id/allergies',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.updateAllergies
);

// Update conditions
router.put('/:id/conditions',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.updateConditions
);

// Update medications
router.put('/:id/medications',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.updateMedications
);

// Add allergy
router.post('/:id/allergies',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.addAllergy
);

// Add condition
router.post('/:id/conditions',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.addCondition
);

// Add medication
router.post('/:id/medications',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.addMedication
);

// Get medical profile completion
router.get('/:id/completion',
    // authenticate, // Uncomment when auth middleware is available
    MedicalController.getProfileCompletion
);

// Search medical information (Admin only)
router.get('/',
    // authenticate, authorize([MedicalConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    MedicalController.searchMedicalInfo
);

// Delete medical information (Admin only)
router.delete('/:id',
    // authenticate, authorize([MedicalConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    MedicalController.deleteMedicalInfo
);

export default router;
