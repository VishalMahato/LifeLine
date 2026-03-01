import express from 'express';
import LocationController from './Location.controller.mjs';
import AuthMiddleware from '../Auth/v1/Auth.middleware.mjs';

const router = express.Router();

/**
 * Location routes.
 * Keep specific routes above dynamic `/:id` routes.
 */

// Core creation/update routes
router.post('/', LocationController.createLocation);
router.post('/coordinates', LocationController.createLocationFromCoordinates);
router.post('/current', AuthMiddleware.authenticate, LocationController.updateCurrentLocation);

// User-specific routes
router.get('/user/me/locations', AuthMiddleware.authenticate, LocationController.getUserLocations);
router.get('/user/me/stats', AuthMiddleware.authenticate, LocationController.getLocationStats);
router.get('/user/:userId', LocationController.getUserLocations);
router.get('/user/:userId/stats', LocationController.getLocationStats);

// Nearby search routes
router.get('/nearby/search', LocationController.searchNearbyLocations);
router.get('/nearby/helpers', LocationController.searchNearbyHelpers);

// Filtered query route
router.get('/', LocationController.searchLocations);

// Single-resource routes
router.get('/:id', LocationController.getLocation);
router.put('/:id', LocationController.updateLocation);
router.patch('/:id/address', LocationController.updateLocationAddress);
router.patch('/:id/verify', LocationController.verifyLocation);
router.delete('/:id', LocationController.deleteLocation);

export default router;
