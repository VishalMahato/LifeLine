import User from './User.Schema.mjs';
import UserUtils from './User.utils.mjs';
import UserConstants from './User.constants.mjs';

/**
 * UserService - Business logic layer for User operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class UserService {
    /**
     * Normalize contacts for storage by removing duplicates and ensuring a single primary contact.
     * @param {Array} emergencyContacts
     * @returns {Array}
     */
    static prepareEmergencyContacts(emergencyContacts) {
        const sanitizedContacts =
            UserUtils.sanitizeUserData({ emergencyContacts }).emergencyContacts || [];

        const dedupedContacts = [];
        const seen = new Set();

        sanitizedContacts.forEach((contact) => {
            const normalizedPhone = String(contact.phoneNumber || '').replace(/\D/g, '');
            const key = `${String(contact.name || '').toLowerCase()}::${normalizedPhone}`;
            if (seen.has(key)) {
                return;
            }

            seen.add(key);
            dedupedContacts.push(contact);
        });

        if (dedupedContacts.length === 0) {
            return dedupedContacts;
        }

        let primaryIndex = dedupedContacts.findIndex((contact) => contact.isPrimary);
        if (primaryIndex < 0) {
            primaryIndex = 0;
        }

        dedupedContacts.forEach((contact, index) => {
            contact.isPrimary = index === primaryIndex;
        });

        return dedupedContacts;
    }

    /**
     * Create a new user profile
     * @param {Object} userData - User profile data
     * @returns {Promise<Object>} Created user profile
     */
    static async createUser(userData) {
        try {
            const {
                authId,
                fullName,
                email,
                phoneNumber,
                dateOfBirth,
                gender,
                address,
                emergencyContacts = [],
                medicalId,
                locationId
            } = userData;

            // Validate required fields
            if (!authId || !fullName || !email || !phoneNumber) {
                throw new Error(UserConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
            }

            // Validate emergency contacts if provided
            if (emergencyContacts.length > 0 && !UserUtils.validateEmergencyContacts(emergencyContacts)) {
                throw new Error(UserConstants.MESSAGES.VALIDATION.INVALID_EMERGENCY_CONTACTS);
            }

            // Check if user already exists for this auth
            const existingUser = await User.findOne({ authId });
            if (existingUser) {
                throw new Error('User profile already exists for this account');
            }

            // Sanitize input data
            const sanitizedData = UserUtils.sanitizeUserData(userData);

            // Create user profile
            const user = new User({
                authId,
                fullName: sanitizedData.fullName,
                email: sanitizedData.email,
                phoneNumber: sanitizedData.phoneNumber,
                dateOfBirth,
                gender,
                address,
                emergencyContacts: sanitizedData.emergencyContacts,
                medicalId,
                locationId,
                role: UserConstants.DEFAULTS.ROLE,
                status: UserConstants.DEFAULTS.STATUS,
                profileCompleted: UserUtils.isProfileComplete(sanitizedData)
            });

            await user.save();

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to create user profile: ${error.message}`);
        }
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     */
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId)
                .populate('medicalId')
                .populate('locationId');

            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    /**
     * Get user by auth ID
     * @param {string} authId - Auth ID
     * @returns {Promise<Object>} User profile
     */
    static async getUserByAuthId(authId) {
        try {
            const user = await User.findOne({ authId })
                .populate('medicalId')
                .populate('locationId');

            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated user profile
     */
    static async updateUser(userId, updateData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            // Validate emergency contacts if being updated
            if (updateData.emergencyContacts && !UserUtils.validateEmergencyContacts(updateData.emergencyContacts)) {
                throw new Error(UserConstants.MESSAGES.VALIDATION.INVALID_EMERGENCY_CONTACTS);
            }

            // Sanitize update data
            const sanitizedData = UserUtils.sanitizeUserData(updateData);

            // Update fields
            const allowedUpdates = [
                'fullName', 'phoneNumber', 'dateOfBirth', 'gender',
                'address', 'emergencyContacts', 'medicalId', 'locationId'
            ];

            allowedUpdates.forEach(field => {
                if (sanitizedData[field] !== undefined) {
                    user[field] = sanitizedData[field];
                }
            });

            // Check if profile is now complete
            user.profileCompleted = UserUtils.isProfileComplete(user);

            await user.save();

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    /**
     * Update emergency contacts
     * @param {string} userId - User ID
     * @param {Array} emergencyContacts - Emergency contacts array
     * @returns {Promise<Object>} Updated user profile
     */
    static async updateEmergencyContacts(userId, emergencyContacts) {
        try {
            if (!UserUtils.validateEmergencyContacts(emergencyContacts)) {
                throw new Error(UserConstants.MESSAGES.VALIDATION.INVALID_EMERGENCY_CONTACTS);
            }

            const preparedContacts = this.prepareEmergencyContacts(emergencyContacts);
            if (preparedContacts.length === 0) {
                throw new Error(UserConstants.MESSAGES.VALIDATION.INVALID_EMERGENCY_CONTACTS);
            }

            const user = await User.findByIdAndUpdate(
                userId,
                {
                    emergencyContacts: preparedContacts,
                    profileCompleted: true, // Emergency contacts make profile complete
                    updatedAt: new Date()
                },
                { new: true }
            ).populate('medicalId').populate('locationId');

            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to update emergency contacts: ${error.message}`);
        }
    }

    /**
     * Add emergency contact
     * @param {string} userId - User ID
     * @param {Object} contact - Emergency contact data
     * @returns {Promise<Object>} Updated user profile
     */
    static async addEmergencyContact(userId, contact) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            // Validate contact
            if (!UserUtils.validateEmergencyContacts([contact])) {
                throw new Error(UserConstants.MESSAGES.VALIDATION.INVALID_EMERGENCY_CONTACTS);
            }

            const preparedContacts = this.prepareEmergencyContacts([
                ...user.emergencyContacts.map((entry) => entry.toObject ? entry.toObject() : entry),
                contact,
            ]);
            user.emergencyContacts = preparedContacts;
            user.updatedAt = new Date();

            await user.save();

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to add emergency contact: ${error.message}`);
        }
    }

    /**
     * Remove emergency contact
     * @param {string} userId - User ID
     * @param {string} contactId - Emergency contact ID
     * @returns {Promise<Object>} Updated user profile
     */
    static async removeEmergencyContact(userId, contactId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            user.emergencyContacts = user.emergencyContacts.filter(
                contact => contact._id.toString() !== contactId
            );

            user.updatedAt = new Date();

            await user.save();

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to remove emergency contact: ${error.message}`);
        }
    }

    /**
     * Update user medical information reference
     * @param {string} userId - User ID
     * @param {string} medicalId - Medical information ID
     * @returns {Promise<Object>} Updated user profile
     */
    static async updateMedicalInfo(userId, medicalId) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { medicalId, updatedAt: new Date() },
                { new: true }
            ).populate('medicalId').populate('locationId');

            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to update medical info: ${error.message}`);
        }
    }

    /**
     * Update user location reference
     * @param {string} userId - User ID
     * @param {string} locationId - Location ID
     * @returns {Promise<Object>} Updated user profile
     */
    static async updateLocation(userId, locationId) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { locationId, updatedAt: new Date() },
                { new: true }
            ).populate('medicalId').populate('locationId');

            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            return UserUtils.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to update location: ${error.message}`);
        }
    }

    /**
     * Search users with filters
     * @param {Object} filters - Search filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Object>} Search results
     */
    static async searchUsers(filters = {}, options = {}) {
        try {
            const {
                page = UserConstants.PAGINATION.DEFAULT_PAGE,
                limit = UserConstants.PAGINATION.DEFAULT_LIMIT,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const query = UserUtils.buildSearchQuery(filters);
            const sortOptions = UserUtils.buildSortOptions(sortBy, sortOrder);

            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                User.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .populate('medicalId')
                    .populate('locationId'),
                User.countDocuments(query)
            ]);

            const formattedUsers = users.map(user => UserUtils.formatUserResponse(user));

            return {
                users: formattedUsers,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to search users: ${error.message}`);
        }
    }

    /**
     * Delete user profile
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteUser(userId) {
        try {
            const result = await User.findByIdAndDelete(userId);
            return !!result;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    /**
     * Get user dashboard data
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Dashboard data
     */
    static async getUserDashboard(userId) {
        try {
            const user = await User.findById(userId)
                .populate('medicalId')
                .populate('locationId');

            if (!user) {
                throw new Error(UserConstants.MESSAGES.ERROR.USER_NOT_FOUND);
            }

            const dashboard = {
                profile: UserUtils.formatUserResponse(user),
                profileCompletion: {
                    isComplete: user.profileCompleted,
                    completionPercentage: this.calculateProfileCompletion(user)
                },
                emergencyContactsCount: user.emergencyContacts.length,
                hasMedicalInfo: !!user.medicalId,
                hasLocation: !!user.locationId
            };

            return dashboard;
        } catch (error) {
            throw new Error(`Failed to get user dashboard: ${error.message}`);
        }
    }

    /**
     * Calculate profile completion percentage
     * @param {Object} user
     * @returns {number} Completion percentage
     */
    static calculateProfileCompletion(user) {
        const fields = [
            'fullName', 'email', 'phoneNumber', 'dateOfBirth',
            'gender', 'address', 'emergencyContacts', 'medicalId', 'locationId'
        ];

        let completed = 0;

        fields.forEach(field => {
            if (field === 'emergencyContacts') {
                if (user.emergencyContacts && user.emergencyContacts.length > 0) completed++;
            } else if (user[field]) {
                completed++;
            }
        });

        return Math.round((completed / fields.length) * 100);
    }
}
