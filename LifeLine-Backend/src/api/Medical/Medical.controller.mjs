import MedicalService from './Medical.service.mjs';
import MedicalConstants from './Medical.constants.mjs';

/**
 * MedicalController - API handlers for Medical operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class MedicalController {
    /**
     * Create medical information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createMedicalInfo(req, res) {
        try {
            const medicalData = {
                ...req.body,
                userId: req.user.userId
            };

            const medicalInfo = await MedicalService.createMedicalInfo(medicalData);

            res.status(201).json({
                success: true,
                message: MedicalConstants.MESSAGES.SUCCESS.MEDICAL_INFO_CREATED,
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get medical information by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getMedicalInfo(req, res) {
        try {
            const { id } = req.params;
            const medicalInfo = await MedicalService.getMedicalInfoById(id);

            res.status(200).json({
                success: true,
                data: medicalInfo
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get current user's medical information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getMyMedicalInfo(req, res) {
        try {
            const userId = req.user.userId;
            const medicalInfo = await MedicalService.getMedicalInfoByUserId(userId);

            res.status(200).json({
                success: true,
                data: medicalInfo
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update medical information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateMedicalInfo(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const medicalInfo = await MedicalService.updateMedicalInfo(id, updateData);

            res.status(200).json({
                success: true,
                message: MedicalConstants.MESSAGES.SUCCESS.MEDICAL_INFO_UPDATED,
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update allergies
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateAllergies(req, res) {
        try {
            const { id } = req.params;
            const { allergies } = req.body;

            const medicalInfo = await MedicalService.updateAllergies(id, allergies);

            res.status(200).json({
                success: true,
                message: MedicalConstants.MESSAGES.SUCCESS.ALLERGIES_UPDATED,
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update conditions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateConditions(req, res) {
        try {
            const { id } = req.params;
            const { conditions } = req.body;

            const medicalInfo = await MedicalService.updateConditions(id, conditions);

            res.status(200).json({
                success: true,
                message: MedicalConstants.MESSAGES.SUCCESS.CONDITIONS_UPDATED,
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update medications
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateMedications(req, res) {
        try {
            const { id } = req.params;
            const { medications } = req.body;

            const medicalInfo = await MedicalService.updateMedications(id, medications);

            res.status(200).json({
                success: true,
                message: MedicalConstants.MESSAGES.SUCCESS.MEDICATIONS_UPDATED,
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Add allergy
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async addAllergy(req, res) {
        try {
            const { id } = req.params;
            const allergy = req.body;

            const medicalInfo = await MedicalService.addAllergy(id, allergy);

            res.status(200).json({
                success: true,
                message: 'Allergy added successfully',
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Add condition
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async addCondition(req, res) {
        try {
            const { id } = req.params;
            const condition = req.body;

            const medicalInfo = await MedicalService.addCondition(id, condition);

            res.status(200).json({
                success: true,
                message: 'Condition added successfully',
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Add medication
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async addMedication(req, res) {
        try {
            const { id } = req.params;
            const medication = req.body;

            const medicalInfo = await MedicalService.addMedication(id, medication);

            res.status(200).json({
                success: true,
                message: 'Medication added successfully',
                data: medicalInfo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get medical profile completion
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getProfileCompletion(req, res) {
        try {
            const { id } = req.params;
            const completion = await MedicalService.getProfileCompletion(id);

            res.status(200).json({
                success: true,
                data: completion
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Search medical information (Admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async searchMedicalInfo(req, res) {
        try {
            const filters = {
                bloodType: req.query.bloodType,
                hasAllergies: req.query.hasAllergies ? req.query.hasAllergies === 'true' : undefined,
                hasConditions: req.query.hasConditions ? req.query.hasConditions === 'true' : undefined,
                organDonor: req.query.organDonor ? req.query.organDonor === 'true' : undefined
            };

            const options = {
                page: parseInt(req.query.page) || MedicalConstants.PAGINATION.DEFAULT_PAGE,
                limit: Math.min(
                    parseInt(req.query.limit) || MedicalConstants.PAGINATION.DEFAULT_LIMIT,
                    MedicalConstants.PAGINATION.MAX_LIMIT
                ),
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc'
            };

            const result = await MedicalService.searchMedicalInfo(filters, options);

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
     * Delete medical information (Admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteMedicalInfo(req, res) {
        try {
            const { id } = req.params;

            const deleted = await MedicalService.deleteMedicalInfo(id);

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: 'Medical information deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND
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
