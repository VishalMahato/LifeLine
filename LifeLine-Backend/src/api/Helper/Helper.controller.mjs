import HelperService from './Helper.service.mjs';
import HelperConstants from './Helper.constants.mjs';

/**
 * HelperController - API handlers for Helper operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class HelperController {
    /**
     * Create helper profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createHelper(req, res) {
        try {
            const helperData = {
                ...req.body,
                authId: req.user?.userId || req.body.authId // From auth middleware or direct
            };

            const helper = await HelperService.createHelper(helperData);

            res.status(201).json({
                success: true,
                message: HelperConstants.MESSAGES.SUCCESS.HELPER_CREATED,
                data: helper
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get helper profile by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getHelper(req, res) {
        try {
            const { id } = req.params;
            const helper = await HelperService.getHelperById(id);

            res.status(200).json({
                success: true,
                data: helper
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get current user's helper profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getMyProfile(req, res) {
        try {
            const authId = req.user.userId;
            const helper = await HelperService.getHelperByAuthId(authId);

            res.status(200).json({
                success: true,
                data: helper
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update helper profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateHelper(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const helper = await HelperService.updateHelper(id, updateData);

            res.status(200).json({
                success: true,
                message: HelperConstants.MESSAGES.SUCCESS.HELPER_UPDATED,
                data: helper
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update helper availability
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateAvailability(req, res) {
        try {
            const { id } = req.params;
            const availabilityData = req.body;

            const helper = await HelperService.updateAvailability(id, availabilityData);

            res.status(200).json({
                success: true,
                message: HelperConstants.MESSAGES.SUCCESS.AVAILABILITY_UPDATED,
                data: helper
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update helper skills
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateSkills(req, res) {
        try {
            const { id } = req.params;
            const { skills } = req.body;

            const helper = await HelperService.updateHelper(id, { skills });

            res.status(200).json({
                success: true,
                message: HelperConstants.MESSAGES.SUCCESS.SKILLS_UPDATED,
                data: helper
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Verify helper credentials (Admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async verifyCredentials(req, res) {
        try {
            const { id, credentialId } = req.params;
            const { status } = req.body;

            const helper = await HelperService.verifyCredentials(id, credentialId, status);

            res.status(200).json({
                success: true,
                message: HelperConstants.MESSAGES.SUCCESS.HELPER_VERIFIED,
                data: helper
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Award badge to helper (Admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async awardBadge(req, res) {
        try {
            const { id } = req.params;
            const { badgeType } = req.body;

            const helper = await HelperService.awardBadge(id, badgeType);

            res.status(200).json({
                success: true,
                message: HelperConstants.MESSAGES.SUCCESS.BADGE_AWARDED,
                data: helper
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Search helpers
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async searchHelpers(req, res) {
        try {
            const filters = {
                skills: req.query.skills ? req.query.skills.split(',') : [],
                categories: req.query.categories ? req.query.categories.split(',') : [],
                minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
                isVolunteer: req.query.isVolunteer ? req.query.isVolunteer === 'true' : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
                userLocation: req.query.lat && req.query.lng ? {
                    lat: parseFloat(req.query.lat),
                    lng: parseFloat(req.query.lng)
                } : undefined
            };

            const options = {
                page: parseInt(req.query.page) || HelperConstants.PAGINATION.DEFAULT_PAGE,
                limit: Math.min(
                    parseInt(req.query.limit) || HelperConstants.PAGINATION.DEFAULT_LIMIT,
                    HelperConstants.PAGINATION.MAX_LIMIT
                ),
                sortBy: req.query.sortBy || 'rating',
                sortOrder: req.query.sortOrder || 'desc'
            };

            const result = await HelperService.searchHelpers(filters, options);

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
     * Update performance metrics (Internal/System use)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateMetrics(req, res) {
        try {
            const { id } = req.params;
            const metrics = req.body;

            const helper = await HelperService.updatePerformanceMetrics(id, metrics);

            res.status(200).json({
                success: true,
                data: helper
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete helper profile (Admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteHelper(req, res) {
        try {
            const { id } = req.params;

            const deleted = await HelperService.deleteHelper(id);

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: 'Helper profile deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND
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
