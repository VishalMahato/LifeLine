import express from 'express';
import LocationController from './Location.controller.mjs';
import LocationConstants from './Location.constants.mjs';
// Import auth middleware when available
// import { authenticate, authorize } from '../Auth/Auth.middleware.mjs';

const router = express.Router();

/**
 * Location Routes - API endpoints for Location operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

// Create location
router.post('/',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.createLocation
);

// Get location by ID
router.get('/:id',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.getLocation
);

// Get user's locations
router.get('/user/:userId',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.getUserLocations
);

// Get current user's locations
router.get('/user/me/locations',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.getUserLocations
);

// Update location
router.put('/:id',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.updateLocation
);

// Update current location
router.post('/current',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.updateCurrentLocation
);

// Search nearby locations
router.get('/nearby/search',
    // Add rate limiting when available
    LocationController.searchNearbyLocations
);

// Search locations
router.get('/',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.searchLocations
);

// Get location statistics
router.get('/user/:userId/stats',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.getLocationStats
);

// Get current user's location statistics
router.get('/user/me/stats',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.getLocationStats
);

// Verify location (Admin only)
router.patch('/:id/verify',
    // authenticate, authorize([LocationConstants.ROLES.ADMIN]), // Uncomment when auth middleware is available
    LocationController.verifyLocation
);

// Delete location
router.delete('/:id',
    // authenticate, // Uncomment when auth middleware is available
    LocationController.deleteLocation
);

export default router;