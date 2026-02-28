import express from 'express';
import EmergencyController from './Emergency.controller.mjs';
import AuthMiddleware from '../Auth/v1/Auth.middleware.mjs';

const router = express.Router();

/**
 * Emergency Routes for LifeLine Emergency Response System
 * Defines API endpoints for emergency operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

/**
 * @route POST /api/emergency/sos
 * @desc Trigger SOS emergency
 * @access Private (Users)
 * @rateLimit 3 requests per minute
 */
router.post('/sos', EmergencyController.triggerSOS);

/**
 * @route POST /api/emergency
 * @desc Create a new emergency
 * @access Private (Users)
 */
router.post('/', EmergencyController.createEmergency);

/**
 * @route GET /api/emergency/user/me
 * @desc Get user's emergencies
 * @access Private (Users)
 * @query {string} status - Filter by status
 * @query {string} type - Filter by type
 * @query {number} limit - Results per page (default: 20)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/user/me', EmergencyController.getUserEmergencies);

/**
 * @route GET /api/emergency/nearby/search
 * @desc Get nearby emergencies (for helpers)
 * @access Private (Helpers)
 * @query {number} latitude - Required
 * @query {number} longitude - Required
 * @query {number} radius - Search radius in meters (default: 5000)
 */
router.get('/nearby/search', EmergencyController.getNearbyEmergencies);

/**
 * @route GET /api/emergency/stats
 * @desc Get emergency statistics
 * @access Private (Admins)
 */
router.get('/stats', EmergencyController.getStatistics);

/**
 * @route PUT /api/emergency/:id/accept
 * @desc Accept helper request for emergency
 * @access Private (Helpers)
 */
router.put('/:id/accept', EmergencyController.acceptHelperRequest);

/**
 * @route PUT /api/emergency/:id/arrived
 * @desc Mark helper as arrived at emergency location
 * @access Private (Assigned Helpers)
 */
router.put('/:id/arrived', EmergencyController.markHelperArrived);

/**
 * @route PUT /api/emergency/:id/resolve
 * @desc Resolve emergency
 * @access Private (Owner, Assigned Helpers)
 */
router.put('/:id/resolve', EmergencyController.resolveEmergency);

/**
 * @route PUT /api/emergency/:id
 * @desc Update emergency (limited operations)
 * @access Private (Owner)
 */
router.put('/:id', EmergencyController.updateEmergency);

// Notification integration endpoints (as mentioned in API docs)

/**
 * @route POST /api/emergency/notifications/sos
 * @desc Send SOS alert (notification integration)
 * @access Private (Users)
 */
router.post('/notifications/sos', EmergencyController.sendSOSAlert);

/**
 * @route POST /api/emergency/notifications/helper-request
 * @desc Send helper request (notification integration)
 * @access Private (Users)
 */
router.post('/notifications/helper-request', EmergencyController.sendHelperRequest);

/**
 * @route GET /api/emergency/:id
 * @desc Get emergency by ID
 * @access Private (Owner, Assigned Helpers, Admins)
 */
router.get('/:id', EmergencyController.getEmergency);

export default router;
