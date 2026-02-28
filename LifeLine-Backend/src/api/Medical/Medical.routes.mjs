import express from 'express';
import MedicalController from './Medical.controller.mjs';
import AuthMiddleware from '../Auth/v1/Auth.middleware.mjs';

const router = express.Router();

/**
 * Medical Routes - API endpoints for Medical operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

// Restrict medical APIs to authenticated users
router.use(AuthMiddleware.authenticate);

// Create medical information (current endpoint + compatibility alias)
router.post('/', MedicalController.createMedicalInfo);
router.post('/create', MedicalController.createMedicalInfo);

// Get current user's medical information
router.get('/profile/me', MedicalController.getMyMedicalInfo);

// Get medical information by ID
router.get('/:id',
    MedicalController.getMedicalInfo
);

// Update medical information
router.put('/:id',
    MedicalController.updateMedicalInfo
);

// Update allergies
router.put('/:id/allergies',
    MedicalController.updateAllergies
);

// Update conditions
router.put('/:id/conditions',
    MedicalController.updateConditions
);

// Update medications
router.put('/:id/medications',
    MedicalController.updateMedications
);

// Add allergy
router.post('/:id/allergies',
    MedicalController.addAllergy
);

// Add condition
router.post('/:id/conditions',
    MedicalController.addCondition
);

// Add medication
router.post('/:id/medications',
    MedicalController.addMedication
);

// Get medical profile completion
router.get('/:id/completion',
    MedicalController.getProfileCompletion
);

// Search medical information (Admin only)
router.get('/',
    MedicalController.searchMedicalInfo
);

// Delete medical information (Admin only)
router.delete('/:id',
    MedicalController.deleteMedicalInfo
);

export default router;
