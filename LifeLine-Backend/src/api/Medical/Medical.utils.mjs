import MedicalConstants from './Medical.constants.mjs';

/**
 * MedicalUtils - Utility functions for Medical module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class MedicalUtils {
    /**
     * Validate blood type
     * @param {string} bloodType
     * @returns {boolean}
     */
    static validateBloodType(bloodType) {
        return Object.values(MedicalConstants.BLOOD_TYPES).includes(bloodType);
    }

    /**
     * Validate allergies array
     * @param {Array} allergies
     * @returns {boolean}
     */
    static validateAllergies(allergies) {
        if (!Array.isArray(allergies)) return false;

        return allergies.every(allergy => {
            return allergy.substance &&
                   allergy.reaction &&
                   Object.values(MedicalConstants.ALLERGY_SEVERITY).includes(allergy.severity) &&
                   allergy.discoveredDate;
        });
    }

    /**
     * Validate conditions array
     * @param {Array} conditions
     * @returns {boolean}
     */
    static validateConditions(conditions) {
        if (!Array.isArray(conditions)) return false;

        return conditions.every(condition => {
            return condition.name &&
                   condition.diagnosisDate &&
                   Object.values(MedicalConstants.CONDITION_STATUS).includes(condition.status) &&
                   condition.treatedBy;
        });
    }

    /**
     * Validate medications array
     * @param {Array} medications
     * @returns {boolean}
     */
    static validateMedications(medications) {
        if (!Array.isArray(medications)) return false;

        return medications.every(medication => {
            return medication.name &&
                   medication.dosage &&
                   Object.values(MedicalConstants.MEDICATION_FREQUENCY).includes(medication.frequency) &&
                   medication.prescribedBy &&
                   medication.prescriptionDate;
        });
    }

    /**
     * Format medical information response for API
     * @param {Object} medicalInfo
     * @returns {Object} Formatted medical data
     */
    static formatMedicalResponse(medicalInfo) {
        return {
            id: medicalInfo._id,
            userId: medicalInfo.userId,
            bloodType: medicalInfo.bloodType,
            allergies: medicalInfo.allergies,
            conditions: medicalInfo.conditions,
            medications: medicalInfo.medications,
            emergencyInfo: medicalInfo.emergencyInfo,
            organDonor: medicalInfo.organDonor,
            emergencyContactConsent: medicalInfo.emergencyContactConsent,
            createdAt: medicalInfo.createdAt,
            updatedAt: medicalInfo.updatedAt
        };
    }

    /**
     * Sanitize medical input data
     * @param {Object} medicalData
     * @returns {Object} Sanitized data
     */
    static sanitizeMedicalData(medicalData) {
        const sanitized = { ...medicalData };

        // Trim string fields
        ['bloodType'].forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = sanitized[field].trim();
            }
        });

        // Sanitize allergies
        if (sanitized.allergies) {
            sanitized.allergies = sanitized.allergies.map(allergy => ({
                ...allergy,
                substance: allergy.substance?.trim(),
                reaction: allergy.reaction?.trim(),
                notes: allergy.notes?.trim()
            }));
        }

        // Sanitize conditions
        if (sanitized.conditions) {
            sanitized.conditions = sanitized.conditions.map(condition => ({
                ...condition,
                name: condition.name?.trim(),
                diagnosis: condition.diagnosis?.trim(),
                treatment: condition.treatment?.trim(),
                treatedBy: condition.treatedBy?.trim(),
                notes: condition.notes?.trim()
            }));
        }

        // Sanitize medications
        if (sanitized.medications) {
            sanitized.medications = sanitized.medications.map(medication => ({
                ...medication,
                name: medication.name?.trim(),
                dosage: medication.dosage?.trim(),
                instructions: medication.instructions?.trim(),
                prescribedBy: medication.prescribedBy?.trim(),
                pharmacy: medication.pharmacy?.trim()
            }));
        }

        // Sanitize emergency info
        if (sanitized.emergencyInfo) {
            sanitized.emergencyInfo = {
                ...sanitized.emergencyInfo,
                additionalNotes: sanitized.emergencyInfo.additionalNotes?.trim(),
                preferredHospital: sanitized.emergencyInfo.preferredHospital?.trim(),
                insuranceProvider: sanitized.emergencyInfo.insuranceProvider?.trim(),
                insuranceNumber: sanitized.emergencyInfo.insuranceNumber?.trim()
            };
        }

        return sanitized;
    }

    /**
     * Check if medical information is complete
     * @param {Object} medicalInfo
     * @returns {boolean}
     */
    static isMedicalInfoComplete(medicalInfo) {
        const requiredFields = ['bloodType'];

        return requiredFields.every(field => medicalInfo[field]);
    }

    /**
     * Generate medical search query
     * @param {Object} filters
     * @returns {Object} MongoDB query
     */
    static buildSearchQuery(filters) {
        const query = {};

        if (filters.bloodType) {
            query.bloodType = filters.bloodType;
        }

        if (filters.hasAllergies !== undefined) {
            if (filters.hasAllergies) {
                query['allergies.0'] = { $exists: true };
            } else {
                query.$or = [
                    { allergies: { $exists: false } },
                    { allergies: { $size: 0 } }
                ];
            }
        }

        if (filters.hasConditions !== undefined) {
            if (filters.hasConditions) {
                query['conditions.0'] = { $exists: true };
            } else {
                query.$or = [
                    { conditions: { $exists: false } },
                    { conditions: { $size: 0 } }
                ];
            }
        }

        if (filters.organDonor !== undefined) {
            query.organDonor = filters.organDonor;
        }

        return query;
    }

    /**
     * Generate sort options for medical search
     * @param {string} sortBy
     * @param {string} sortOrder
     * @returns {Object} MongoDB sort object
     */
    static buildSortOptions(sortBy = 'createdAt', sortOrder = 'desc') {
        const sortOptions = {};

        switch (sortBy) {
            case 'createdAt':
                sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'updatedAt':
                sortOptions.updatedAt = sortOrder === 'desc' ? -1 : 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        return sortOptions;
    }

    /**
     * Calculate medical profile completion
     * @param {Object} medicalInfo
     * @returns {number} Completion percentage
     */
    static calculateCompletion(medicalInfo) {
        const sections = [
            { field: 'bloodType', weight: 20 },
            { field: 'allergies', weight: 20, check: (data) => data && data.length > 0 },
            { field: 'conditions', weight: 20, check: (data) => data && data.length > 0 },
            { field: 'medications', weight: 15, check: (data) => data && data.length > 0 },
            { field: 'emergencyInfo', weight: 15, check: (data) => data && Object.keys(data).length > 0 },
            { field: 'organDonor', weight: 5 },
            { field: 'emergencyContactConsent', weight: 5 }
        ];

        let completed = 0;

        sections.forEach(section => {
            if (section.check) {
                if (section.check(medicalInfo[section.field])) {
                    completed += section.weight;
                }
            } else if (medicalInfo[section.field]) {
                completed += section.weight;
            }
        });

        return Math.round(completed);
    }
}