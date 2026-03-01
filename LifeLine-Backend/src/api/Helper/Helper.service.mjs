import Helper from './Helper.model.mjs';
import Auth from '../Auth/v1/Auth.model.mjs';
import HelperUtils from './Helper.utils.mjs';
import HelperConstants from './Helper.constants.mjs';
import mongoose from 'mongoose';

/**
 * HelperService - Business logic layer for Helper operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class HelperService {
    static async resolveHelperByIdentifier(helperIdentifier) {
        let helper = null;

        if (mongoose.Types.ObjectId.isValid(helperIdentifier)) {
            helper = await Helper.findById(helperIdentifier);
            if (!helper) {
                helper = await Helper.findOne({ authId: helperIdentifier });
            }
        } else {
            helper = await Helper.findOne({ authId: helperIdentifier });
        }

        if (!helper) {
            throw new Error(HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND);
        }

        return helper;
    }

    /**
     * Create a new helper profile
     * @param {Object} helperData - Helper profile data
     * @returns {Promise<Object>} Created helper profile
     */
    static async createHelper(helperData) {
        try {
            const {
                authId,
                fullName,
                email,
                phoneNumber,
                skills = [],
                credentials = [],
                availability,
                pricing = {},
                locationId,
                isVolunteer = false
            } = helperData;

            // Validate required fields
            if (!authId || !fullName || !email || !phoneNumber) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
            }

            // Validate skills if provided
            if (skills.length > 0 && !HelperUtils.validateSkills(skills)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_SKILLS);
            }

            // Validate credentials if provided
            if (credentials.length > 0 && !HelperUtils.validateCredentials(credentials)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_CREDENTIALS);
            }

            // Validate availability if provided
            if (availability && !HelperUtils.validateAvailability(availability)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_AVAILABILITY);
            }

            // Check if helper already exists for this auth
            const existingHelper = await Helper.findOne({ authId });
            if (existingHelper) {
                throw new Error('Helper profile already exists for this user');
            }

            // Create helper profile
            const helper = new Helper({
                authId,
                fullName,
                email: email.toLowerCase(),
                phoneNumber,
                role: HelperConstants.ROLES.HELPER,
                status: HelperConstants.DEFAULTS.STATUS,
                verificationStatus: HelperConstants.DEFAULTS.VERIFICATION_STATUS,
                skills,
                credentials,
                availability: availability || {
                    status: HelperConstants.DEFAULTS.AVAILABILITY_STATUS,
                    serviceRadius: 10
                },
                pricing: {
                    baseRate: pricing.baseRate || 0,
                    currency: pricing.currency || 'INR',
                    ...pricing
                },
                performanceMetrics: {
                    rating: HelperConstants.DEFAULTS.RATING,
                    responseTime: HelperConstants.DEFAULTS.RESPONSE_TIME,
                    completionRate: HelperConstants.DEFAULTS.COMPLETION_RATE,
                    totalRequests: HelperConstants.DEFAULTS.TOTAL_REQUESTS,
                    successfulRequests: HelperConstants.DEFAULTS.SUCCESSFUL_REQUESTS
                },
                badges: [],
                locationId,
                isVolunteer,
                responseTimes: []
            });

            await helper.save();
            await Auth.findByIdAndUpdate(authId, { helperId: helper._id });

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to create helper profile: ${error.message}`);
        }
    }

    /**
     * Get helper by ID
     * @param {string} helperId - Helper ID
     * @returns {Promise<Object>} Helper profile
     */
    static async getHelperById(helperId) {
        try {
            const helper = await Helper.findById(helperId);
            if (!helper) {
                throw new Error(HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND);
            }

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to get helper: ${error.message}`);
        }
    }

    /**
     * Get helper by auth ID
     * @param {string} authId - Auth ID
     * @returns {Promise<Object>} Helper profile
     */
    static async getHelperByAuthId(authId) {
        try {
            const helper = await Helper.findOne({ authId });
            if (!helper) {
                throw new Error(HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND);
            }

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to get helper: ${error.message}`);
        }
    }

    /**
     * Update helper profile
     * @param {string} helperId - Helper ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated helper profile
     */
    static async updateHelper(helperId, updateData) {
        try {
            const helper = await Helper.findById(helperId);
            if (!helper) {
                throw new Error(HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND);
            }

            // Validate skills if being updated
            if (updateData.skills && !HelperUtils.validateSkills(updateData.skills)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_SKILLS);
            }

            // Validate credentials if being updated
            if (updateData.credentials && !HelperUtils.validateCredentials(updateData.credentials)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_CREDENTIALS);
            }

            // Validate availability if being updated
            if (updateData.availability && !HelperUtils.validateAvailability(updateData.availability)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_AVAILABILITY);
            }

            // Update fields
            const allowedUpdates = [
                'fullName', 'phoneNumber', 'skills', 'credentials',
                'availability', 'pricing', 'locationId', 'isVolunteer'
            ];

            allowedUpdates.forEach(field => {
                if (updateData[field] !== undefined) {
                    helper[field] = updateData[field];
                }
            });

            // Recalculate performance metrics if needed
            if (updateData.skills || updateData.credentials) {
                helper.performanceMetrics = HelperUtils.calculatePerformanceMetrics(helper);
            }

            await helper.save();

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to update helper: ${error.message}`);
        }
    }

    /**
     * Update helper availability
     * @param {string} helperId - Helper ID
     * @param {Object} availabilityData - Availability data
     * @returns {Promise<Object>} Updated helper profile
     */
    static async updateAvailability(helperIdentifier, availabilityData) {
        try {
            const helper = await this.resolveHelperByIdentifier(helperIdentifier);

            const hasBooleanPayload =
                typeof availabilityData === 'boolean' ||
                typeof availabilityData?.isAvailable === 'boolean';

            if (hasBooleanPayload) {
                const nextAvailability = Boolean(
                    typeof availabilityData === 'boolean'
                        ? availabilityData
                        : availabilityData.isAvailable
                );

                helper.availability = {
                    ...(helper.availability?.toObject?.() || helper.availability || {}),
                    isAvailable: nextAvailability
                };
                helper.lastActive = new Date();
                await helper.save();

                return HelperUtils.formatHelperResponse(helper);
            }

            if (!HelperUtils.validateAvailability(availabilityData)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_AVAILABILITY);
            }

            helper.availability = availabilityData;
            helper.lastActive = new Date();
            await helper.save();

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to update availability: ${error.message}`);
        }
    }

    /**
     * Get current helper availability status
     * @param {string} helperIdentifier - Helper id or auth id
     * @returns {Promise<boolean>} Current availability
     */
    static async getCurrentAvailabilityStatus(helperIdentifier) {
        try {
            const helper = await this.resolveHelperByIdentifier(helperIdentifier);
            return Boolean(helper?.availability?.isAvailable);
        } catch (error) {
            throw new Error(`Failed to get availability status: ${error.message}`);
        }
    }

    /**
     * Verify helper credentials
     * @param {string} helperId - Helper ID
     * @param {string} credentialId - Credential ID
     * @param {string} status - Verification status
     * @returns {Promise<Object>} Updated helper profile
     */
    static async verifyCredentials(helperId, credentialId, status) {
        try {
            if (!Object.values(HelperConstants.VERIFICATION_STATUS).includes(status)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_VERIFICATION_STATUS);
            }

            const helper = await Helper.findById(helperId);
            if (!helper) {
                throw new Error(HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND);
            }

            const credential = helper.credentials.id(credentialId);
            if (!credential) {
                throw new Error('Credential not found');
            }

            credential.verificationStatus = status;
            credential.verifiedAt = status === HelperConstants.VERIFICATION_STATUS.VERIFIED ? new Date() : null;

            // Update overall verification status
            const allVerified = helper.credentials.every(cred =>
                cred.verificationStatus === HelperConstants.VERIFICATION_STATUS.VERIFIED
            );

            if (allVerified && helper.credentials.length > 0) {
                helper.verificationStatus = HelperConstants.VERIFICATION_STATUS.VERIFIED;
            }

            await helper.save();

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to verify credentials: ${error.message}`);
        }
    }

    /**
     * Award badge to helper
     * @param {string} helperId - Helper ID
     * @param {string} badgeType - Badge type
     * @returns {Promise<Object>} Updated helper profile
     */
    static async awardBadge(helperId, badgeType) {
        try {
            if (!Object.values(HelperConstants.BADGE_TYPES).includes(badgeType)) {
                throw new Error(HelperConstants.MESSAGES.VALIDATION.INVALID_BADGE_TYPE);
            }

            const helper = await Helper.findById(helperId);
            if (!helper) {
                throw new Error(HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND);
            }

            // Check if badge criteria are met
            if (!HelperUtils.checkBadgeCriteria(helper, badgeType)) {
                throw new Error('Badge criteria not met');
            }

            // Check if badge already awarded
            const existingBadge = helper.badges.find(badge => badge.type === badgeType);
            if (existingBadge) {
                throw new Error('Badge already awarded');
            }

            // Award badge
            helper.badges.push({
                type: badgeType,
                awardedAt: new Date(),
                isActive: true
            });

            await helper.save();

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to award badge: ${error.message}`);
        }
    }

    /**
     * Search helpers with filters
     * @param {Object} filters - Search filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Object>} Search results
     */
    static async searchHelpers(filters = {}, options = {}) {
        try {
            const {
                page = HelperConstants.PAGINATION.DEFAULT_PAGE,
                limit = HelperConstants.PAGINATION.DEFAULT_LIMIT,
                sortBy = 'rating',
                sortOrder = 'desc'
            } = options;

            const query = HelperUtils.buildSearchQuery(filters);
            const sortOptions = HelperUtils.buildSortOptions(sortBy, sortOrder);

            const skip = (page - 1) * limit;

            const [helpers, total] = await Promise.all([
                Helper.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .populate('locationId'),
                Helper.countDocuments(query)
            ]);

            const formattedHelpers = HelperUtils.formatHelperList(helpers, filters.userLocation);

            return {
                helpers: formattedHelpers,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to search helpers: ${error.message}`);
        }
    }

    /**
     * Update helper performance metrics
     * @param {string} helperId - Helper ID
     * @param {Object} metrics - Performance metrics
     * @returns {Promise<Object>} Updated helper profile
     */
    static async updatePerformanceMetrics(helperId, metrics) {
        try {
            const helper = await Helper.findById(helperId);
            if (!helper) {
                throw new Error(HelperConstants.MESSAGES.ERROR.HELPER_NOT_FOUND);
            }

            // Update metrics
            if (metrics.rating !== undefined) {
                helper.performanceMetrics.rating = metrics.rating;
            }
            if (metrics.responseTime !== undefined) {
                helper.responseTimes.push(metrics.responseTime);
                helper.performanceMetrics.averageResponseTime =
                    helper.responseTimes.reduce((a, b) => a + b, 0) / helper.responseTimes.length;
            }
            if (metrics.totalRequests !== undefined) {
                helper.performanceMetrics.totalRequests = metrics.totalRequests;
            }
            if (metrics.successfulRequests !== undefined) {
                helper.performanceMetrics.successfulRequests = metrics.successfulRequests;
                helper.performanceMetrics.completionRate =
                    helper.performanceMetrics.successfulRequests / helper.performanceMetrics.totalRequests;
            }

            // Check for new badges
            const newBadges = [];
            Object.values(HelperConstants.BADGE_TYPES).forEach(badgeType => {
                if (HelperUtils.checkBadgeCriteria(helper, badgeType)) {
                    const existingBadge = helper.badges.find(badge => badge.type === badgeType);
                    if (!existingBadge) {
                        newBadges.push({
                            type: badgeType,
                            awardedAt: new Date(),
                            isActive: true
                        });
                    }
                }
            });

            if (newBadges.length > 0) {
                helper.badges.push(...newBadges);
            }

            await helper.save();

            return HelperUtils.formatHelperResponse(helper);
        } catch (error) {
            throw new Error(`Failed to update performance metrics: ${error.message}`);
        }
    }

    /**
     * Delete helper profile
     * @param {string} helperId - Helper ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteHelper(helperId) {
        try {
            const result = await Helper.findByIdAndDelete(helperId);
            return !!result;
        } catch (error) {
            throw new Error(`Failed to delete helper: ${error.message}`);
        }
    }
}
