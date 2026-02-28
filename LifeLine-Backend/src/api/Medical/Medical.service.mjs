import Medical from './Medical.Schema.mjs';
import MedicalUtils from './Medical.utils.mjs';
import MedicalConstants from './Medical.constants.mjs';

/**
 * MedicalService - Business logic layer for Medical operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class MedicalService {
    /**
     * Create medical information
     * @param {Object} medicalData - Medical information data
     * @returns {Promise<Object>} Created medical information
     */
    static async createMedicalInfo(medicalData) {
        try {
            const {
                userId,
                bloodType,
                allergies = [],
                conditions = [],
                medications = [],
                emergencyInfo = {},
                organDonor = MedicalConstants.DEFAULTS.ORGAN_DONOR,
                emergencyContactConsent = MedicalConstants.DEFAULTS.EMERGENCY_CONTACT_CONSENT
            } = medicalData;

            // Validate required fields
            if (!userId) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
            }

            // Validate blood type if provided
            if (bloodType && !MedicalUtils.validateBloodType(bloodType)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_BLOOD_TYPE);
            }

            // Validate allergies if provided
            if (allergies.length > 0 && !MedicalUtils.validateAllergies(allergies)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_ALLERGIES);
            }

            // Validate conditions if provided
            if (conditions.length > 0 && !MedicalUtils.validateConditions(conditions)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_CONDITIONS);
            }

            // Validate medications if provided
            if (medications.length > 0 && !MedicalUtils.validateMedications(medications)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_MEDICATIONS);
            }

            // Check if medical info already exists for this user
            const existingMedical = await Medical.findOne({ userId });
            if (existingMedical) {
                throw new Error('Medical information already exists for this user');
            }

            // Sanitize input data
            const sanitizedData = MedicalUtils.sanitizeMedicalData(medicalData);

            // Create medical information
            const medicalInfo = new Medical({
                userId,
                bloodType: sanitizedData.bloodType,
                allergies: sanitizedData.allergies,
                conditions: sanitizedData.conditions,
                medications: sanitizedData.medications,
                emergencyInfo: sanitizedData.emergencyInfo,
                organDonor,
                emergencyContactConsent
            });

            await medicalInfo.save();

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to create medical information: ${error.message}`);
        }
    }

    /**
     * Get medical information by ID
     * @param {string} medicalId - Medical information ID
     * @returns {Promise<Object>} Medical information
     */
    static async getMedicalInfoById(medicalId) {
        try {
            const medicalInfo = await Medical.findById(medicalId);
            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to get medical information: ${error.message}`);
        }
    }

    /**
     * Get medical information by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Medical information
     */
    static async getMedicalInfoByUserId(userId) {
        try {
            const medicalInfo = await Medical.findOne({ userId });
            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to get medical information: ${error.message}`);
        }
    }

    /**
     * Update medical information
     * @param {string} medicalId - Medical information ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated medical information
     */
    static async updateMedicalInfo(medicalId, updateData) {
        try {
            const medicalInfo = await Medical.findById(medicalId);
            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            // Validate blood type if being updated
            if (updateData.bloodType && !MedicalUtils.validateBloodType(updateData.bloodType)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_BLOOD_TYPE);
            }

            // Validate allergies if being updated
            if (updateData.allergies && !MedicalUtils.validateAllergies(updateData.allergies)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_ALLERGIES);
            }

            // Validate conditions if being updated
            if (updateData.conditions && !MedicalUtils.validateConditions(updateData.conditions)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_CONDITIONS);
            }

            // Validate medications if being updated
            if (updateData.medications && !MedicalUtils.validateMedications(updateData.medications)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_MEDICATIONS);
            }

            // Sanitize update data
            const sanitizedData = MedicalUtils.sanitizeMedicalData(updateData);

            // Update fields
            const allowedUpdates = [
                'bloodType', 'allergies', 'conditions', 'medications',
                'emergencyInfo', 'organDonor', 'emergencyContactConsent'
            ];

            allowedUpdates.forEach(field => {
                if (sanitizedData[field] !== undefined) {
                    medicalInfo[field] = sanitizedData[field];
                }
            });

            await medicalInfo.save();

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to update medical information: ${error.message}`);
        }
    }

    /**
     * Update allergies
     * @param {string} medicalId - Medical information ID
     * @param {Array} allergies - Allergies array
     * @returns {Promise<Object>} Updated medical information
     */
    static async updateAllergies(medicalId, allergies) {
        try {
            if (!MedicalUtils.validateAllergies(allergies)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_ALLERGIES);
            }

            const sanitizedAllergies = MedicalUtils.sanitizeMedicalData({ allergies }).allergies;

            const medicalInfo = await Medical.findByIdAndUpdate(
                medicalId,
                { allergies: sanitizedAllergies, updatedAt: new Date() },
                { new: true }
            );

            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to update allergies: ${error.message}`);
        }
    }

    /**
     * Update conditions
     * @param {string} medicalId - Medical information ID
     * @param {Array} conditions - Conditions array
     * @returns {Promise<Object>} Updated medical information
     */
    static async updateConditions(medicalId, conditions) {
        try {
            if (!MedicalUtils.validateConditions(conditions)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_CONDITIONS);
            }

            const sanitizedConditions = MedicalUtils.sanitizeMedicalData({ conditions }).conditions;

            const medicalInfo = await Medical.findByIdAndUpdate(
                medicalId,
                { conditions: sanitizedConditions, updatedAt: new Date() },
                { new: true }
            );

            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to update conditions: ${error.message}`);
        }
    }

    /**
     * Update medications
     * @param {string} medicalId - Medical information ID
     * @param {Array} medications - Medications array
     * @returns {Promise<Object>} Updated medical information
     */
    static async updateMedications(medicalId, medications) {
        try {
            if (!MedicalUtils.validateMedications(medications)) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_MEDICATIONS);
            }

            const sanitizedMedications = MedicalUtils.sanitizeMedicalData({ medications }).medications;

            const medicalInfo = await Medical.findByIdAndUpdate(
                medicalId,
                { medications: sanitizedMedications, updatedAt: new Date() },
                { new: true }
            );

            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to update medications: ${error.message}`);
        }
    }

    /**
     * Add allergy
     * @param {string} medicalId - Medical information ID
     * @param {Object} allergy - Allergy data
     * @returns {Promise<Object>} Updated medical information
     */
    static async addAllergy(medicalId, allergy) {
        try {
            const medicalInfo = await Medical.findById(medicalId);
            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            // Validate allergy
            if (!MedicalUtils.validateAllergies([allergy])) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_ALLERGIES);
            }

            // Sanitize allergy
            const sanitizedAllergy = MedicalUtils.sanitizeMedicalData({ allergies: [allergy] }).allergies[0];

            medicalInfo.allergies.push(sanitizedAllergy);
            medicalInfo.updatedAt = new Date();

            await medicalInfo.save();

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to add allergy: ${error.message}`);
        }
    }

    /**
     * Add condition
     * @param {string} medicalId - Medical information ID
     * @param {Object} condition - Condition data
     * @returns {Promise<Object>} Updated medical information
     */
    static async addCondition(medicalId, condition) {
        try {
            const medicalInfo = await Medical.findById(medicalId);
            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            // Validate condition
            if (!MedicalUtils.validateConditions([condition])) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_CONDITIONS);
            }

            // Sanitize condition
            const sanitizedCondition = MedicalUtils.sanitizeMedicalData({ conditions: [condition] }).conditions[0];

            medicalInfo.conditions.push(sanitizedCondition);
            medicalInfo.updatedAt = new Date();

            await medicalInfo.save();

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to add condition: ${error.message}`);
        }
    }

    /**
     * Add medication
     * @param {string} medicalId - Medical information ID
     * @param {Object} medication - Medication data
     * @returns {Promise<Object>} Updated medical information
     */
    static async addMedication(medicalId, medication) {
        try {
            const medicalInfo = await Medical.findById(medicalId);
            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            // Validate medication
            if (!MedicalUtils.validateMedications([medication])) {
                throw new Error(MedicalConstants.MESSAGES.VALIDATION.INVALID_MEDICATIONS);
            }

            // Sanitize medication
            const sanitizedMedication = MedicalUtils.sanitizeMedicalData({ medications: [medication] }).medications[0];

            medicalInfo.medications.push(sanitizedMedication);
            medicalInfo.updatedAt = new Date();

            await medicalInfo.save();

            return MedicalUtils.formatMedicalResponse(medicalInfo);
        } catch (error) {
            throw new Error(`Failed to add medication: ${error.message}`);
        }
    }

    /**
     * Search medical information
     * @param {Object} filters - Search filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Object>} Search results
     */
    static async searchMedicalInfo(filters = {}, options = {}) {
        try {
            const {
                page = MedicalConstants.PAGINATION.DEFAULT_PAGE,
                limit = MedicalConstants.PAGINATION.DEFAULT_LIMIT,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const query = MedicalUtils.buildSearchQuery(filters);
            const sortOptions = MedicalUtils.buildSortOptions(sortBy, sortOrder);

            const skip = (page - 1) * limit;

            const [medicalInfos, total] = await Promise.all([
                Medical.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit),
                Medical.countDocuments(query)
            ]);

            const formattedResults = medicalInfos.map(info => MedicalUtils.formatMedicalResponse(info));

            return {
                medicalInfos: formattedResults,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to search medical information: ${error.message}`);
        }
    }

    /**
     * Get medical profile completion
     * @param {string} medicalId - Medical information ID
     * @returns {Promise<Object>} Completion data
     */
    static async getProfileCompletion(medicalId) {
        try {
            const medicalInfo = await Medical.findById(medicalId);
            if (!medicalInfo) {
                throw new Error(MedicalConstants.MESSAGES.ERROR.MEDICAL_INFO_NOT_FOUND);
            }

            const completion = MedicalUtils.calculateCompletion(medicalInfo);

            return {
                completionPercentage: completion,
                isComplete: MedicalUtils.isMedicalInfoComplete(medicalInfo),
                sections: {
                    bloodType: !!medicalInfo.bloodType,
                    allergies: medicalInfo.allergies && medicalInfo.allergies.length > 0,
                    conditions: medicalInfo.conditions && medicalInfo.conditions.length > 0,
                    medications: medicalInfo.medications && medicalInfo.medications.length > 0,
                    emergencyInfo: medicalInfo.emergencyInfo && Object.keys(medicalInfo.emergencyInfo).length > 0,
                    organDonor: medicalInfo.organDonor,
                    emergencyContactConsent: medicalInfo.emergencyContactConsent
                }
            };
        } catch (error) {
            throw new Error(`Failed to get profile completion: ${error.message}`);
        }
    }

    /**
     * Delete medical information
     * @param {string} medicalId - Medical information ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteMedicalInfo(medicalId) {
        try {
            const result = await Medical.findByIdAndDelete(medicalId);
            return !!result;
        } catch (error) {
            throw new Error(`Failed to delete medical information: ${error.message}`);
        }
    }
}