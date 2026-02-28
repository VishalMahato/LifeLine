import LocationService from './Location.service.mjs';
import LocationConstants from './Location.constants.mjs';

/**
 * LocationController - API handlers for Location operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class LocationController {
    /**
     * Create location
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createLocation(req, res) {
        try {
            const locationData = {
                ...req.body,
                userId: req.user?.id || req.body.userId // From auth middleware or direct
            };

            const location = await LocationService.createLocation(locationData);

            res.status(201).json({
                success: true,
                message: LocationConstants.MESSAGES.SUCCESS.LOCATION_CREATED,
                data: location
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get location by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getLocation(req, res) {
        try {
            const { id } = req.params;
            const location = await LocationService.getLocationById(id);

            res.status(200).json({
                success: true,
                data: location
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get user's locations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getUserLocations(req, res) {
        try {
            const userId = req.user?.id || req.params.userId;
            const locations = await LocationService.getLocationsByUserId(userId);

            res.status(200).json({
                success: true,
                data: locations
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update location
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const location = await LocationService.updateLocation(id, updateData);

            res.status(200).json({
                success: true,
                message: LocationConstants.MESSAGES.SUCCESS.LOCATION_UPDATED,
                data: location
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update current location
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateCurrentLocation(req, res) {
        try {
            const userId = req.user.id;
            const { coordinates, accuracy } = req.body;

            const location = await LocationService.updateCurrentLocation(userId, { coordinates, accuracy });

            res.status(200).json({
                success: true,
                message: 'Current location updated successfully',
                data: location
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Search locations within radius
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async searchNearbyLocations(req, res) {
        try {
            const { lat, lng, radius } = req.query;

            if (!lat || !lng) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required'
                });
            }

            const center = { lat: parseFloat(lat), lng: parseFloat(lng) };
            const radiusKm = radius ? parseFloat(radius) : LocationConstants.SEARCH.DEFAULT_DISTANCE_KM;

            const filters = {
                type: req.query.type,
                isVerified: req.query.verified === 'true' ? true : undefined
            };

            const locations = await LocationService.searchLocationsWithinRadius(center, radiusKm, filters);

            res.status(200).json({
                success: true,
                data: locations
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Search locations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async searchLocations(req, res) {
        try {
            const filters = {
                userId: req.query.userId,
                type: req.query.type,
                isVerified: req.query.verified ? req.query.verified === 'true' : undefined,
                city: req.query.city,
                country: req.query.country
            };

            const options = {
                page: parseInt(req.query.page) || LocationConstants.PAGINATION.DEFAULT_PAGE,
                limit: Math.min(
                    parseInt(req.query.limit) || LocationConstants.PAGINATION.DEFAULT_LIMIT,
                    LocationConstants.PAGINATION.MAX_LIMIT
                ),
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc'
            };

            const result = await LocationService.searchLocations(filters, options);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Verify location (Admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async verifyLocation(req, res) {
        try {
            const { id } = req.params;
            const { isVerified } = req.body;

            const location = await LocationService.verifyLocation(id, isVerified);

            res.status(200).json({
                success: true,
                message: LocationConstants.MESSAGES.SUCCESS.LOCATION_VERIFIED,
                data: location
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get location statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getLocationStats(req, res) {
        try {
            const userId = req.user?.id || req.params.userId;
            const stats = await LocationService.getLocationStats(userId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete location
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteLocation(req, res) {
        try {
            const { id } = req.params;

            const deleted = await LocationService.deleteLocation(id);

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: 'Location deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}