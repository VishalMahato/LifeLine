import UserService from './User.service.mjs';
import UserConstants from './User.constants.mjs';

/**
 * UserController - API handlers for User operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class UserController {
    /**
     * Create user profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createUser(req, res) {
        try {
            const userData = {
                ...req.body,
                authId: req.user?.userId || req.body.authId // From auth middleware or direct
            };

            const user = await UserService.createUser(userData);

            res.status(201).json({
                success: true,
                message: UserConstants.MESSAGES.SUCCESS.USER_CREATED,
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get user profile by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get current user's profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getMyProfile(req, res) {
        try {
            const authId = req.user.userId;
            const user = await UserService.getUserByAuthId(authId);

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update user profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const user = await UserService.updateUser(id, updateData);

            res.status(200).json({
                success: true,
                message: UserConstants.MESSAGES.SUCCESS.USER_UPDATED,
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update emergency contacts
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateEmergencyContacts(req, res) {
        try {
            const { id } = req.params;
            const { emergencyContacts } = req.body;

            const user = await UserService.updateEmergencyContacts(id, emergencyContacts);

            res.status(200).json({
                success: true,
                message: UserConstants.MESSAGES.SUCCESS.EMERGENCY_CONTACTS_UPDATED,
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Add emergency contact
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async addEmergencyContact(req, res) {
        try {
            const { id } = req.params;
            const contact = req.body;

            const user = await UserService.addEmergencyContact(id, contact);

            res.status(200).json({
                success: true,
                message: 'Emergency contact added successfully',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Remove emergency contact
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async removeEmergencyContact(req, res) {
        try {
            const { id, contactId } = req.params;

            const user = await UserService.removeEmergencyContact(id, contactId);

            res.status(200).json({
                success: true,
                message: 'Emergency contact removed successfully',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update medical information reference
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateMedicalInfo(req, res) {
        try {
            const { id } = req.params;
            const { medicalId } = req.body;

            const user = await UserService.updateMedicalInfo(id, medicalId);

            res.status(200).json({
                success: true,
                message: 'Medical information updated successfully',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update location reference
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const { locationId } = req.body;

            const user = await UserService.updateLocation(id, locationId);

            res.status(200).json({
                success: true,
                message: 'Location updated successfully',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get user dashboard
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getDashboard(req, res) {
        try {
            const { id } = req.params;
            const dashboard = await UserService.getUserDashboard(id);

            res.status(200).json({
                success: true,
                data: dashboard
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Search users
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async searchUsers(req, res) {
        try {
            const filters = {
                role: req.query.role,
                profileCompleted: req.query.profileCompleted ? req.query.profileCompleted === 'true' : undefined,
                hasEmergencyContacts: req.query.hasEmergencyContacts ? req.query.hasEmergencyContacts === 'true' : undefined
            };

            const options = {
                page: parseInt(req.query.page) || UserConstants.PAGINATION.DEFAULT_PAGE,
                limit: Math.min(
                    parseInt(req.query.limit) || UserConstants.PAGINATION.DEFAULT_LIMIT,
                    UserConstants.PAGINATION.MAX_LIMIT
                ),
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc'
            };

            const result = await UserService.searchUsers(filters, options);

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
     * Delete user profile (Admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            const deleted = await UserService.deleteUser(id);

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: 'User profile deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: UserConstants.MESSAGES.ERROR.USER_NOT_FOUND
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
