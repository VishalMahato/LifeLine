import HelperConstants from './Helper.constants.mjs';

/**
 * HelperUtils - Utility functions for Helper module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class HelperUtils {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {Object} coord1 - {lat, lng}
     * @param {Object} coord2 - {lat, lng}
     * @returns {number} Distance in kilometers
     */
    static calculateDistance(coord1, coord2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(coord2.lat - coord1.lat);
        const dLng = this.toRadians(coord2.lng - coord1.lng);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees
     * @returns {number} Radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Validate skills array
     * @param {Array} skills
     * @returns {boolean}
     */
    static validateSkills(skills) {
        if (!Array.isArray(skills)) return false;

        return skills.every(skill => {
            return skill.name &&
                   skill.category &&
                   Object.values(HelperConstants.SKILL_CATEGORIES).includes(skill.category) &&
                   typeof skill.proficiency === 'number' &&
                   skill.proficiency >= 1 && skill.proficiency <= 5;
        });
    }

    /**
     * Validate credentials array
     * @param {Array} credentials
     * @returns {boolean}
     */
    static validateCredentials(credentials) {
        if (!Array.isArray(credentials)) return false;

        return credentials.every(cred => {
            return cred.type &&
                   cred.title &&
                   cred.issuer &&
                   cred.issueDate &&
                   cred.expiryDate &&
                   ['verified', 'pending', 'rejected'].includes(cred.verificationStatus);
        });
    }

    /**
     * Validate availability object
     * @param {Object} availability
     * @returns {boolean}
     */
    static validateAvailability(availability) {
        if (!availability || typeof availability !== 'object') return false;

        const required = ['status', 'currentLocation', 'serviceRadius'];
        for (const field of required) {
            if (!availability[field]) return false;
        }

        if (!Object.values(HelperConstants.AVAILABILITY_STATUS).includes(availability.status)) {
            return false;
        }

        if (availability.schedule && !Array.isArray(availability.schedule)) {
            return false;
        }

        return true;
    }

    /**
     * Calculate performance metrics
     * @param {Object} helper
     * @returns {Object} Updated metrics
     */
    static calculatePerformanceMetrics(helper) {
        const metrics = { ...helper.performanceMetrics };

        if (helper.totalRequests > 0) {
            metrics.completionRate = helper.successfulRequests / helper.totalRequests;
        }

        // Calculate average response time if we have response times
        if (helper.responseTimes && helper.responseTimes.length > 0) {
            metrics.averageResponseTime = helper.responseTimes.reduce((a, b) => a + b, 0) / helper.responseTimes.length;
        }

        return metrics;
    }

    /**
     * Check if helper meets badge criteria
     * @param {Object} helper
     * @param {string} badgeType
     * @returns {boolean}
     */
    static checkBadgeCriteria(helper, badgeType) {
        const metrics = helper.performanceMetrics;

        switch (badgeType) {
            case HelperConstants.BADGE_TYPES.LIFESAVER:
                return metrics.totalRequests >= 100 && metrics.completionRate >= 0.95;
            case HelperConstants.BADGE_TYPES.QUICK_RESPONDER:
                return metrics.averageResponseTime <= HelperConstants.PERFORMANCE_THRESHOLDS.GOOD_RESPONSE_TIME;
            case HelperConstants.BADGE_TYPES.RELIABLE:
                return metrics.completionRate >= HelperConstants.PERFORMANCE_THRESHOLDS.HIGH_COMPLETION_RATE;
            case HelperConstants.BADGE_TYPES.EXPERT:
                return metrics.rating >= HelperConstants.PERFORMANCE_THRESHOLDS.HIGH_RATING &&
                       helper.skills.length >= 5;
            case HelperConstants.BADGE_TYPES.VOLUNTEER:
                return helper.isVolunteer === true;
            default:
                return false;
        }
    }

    /**
     * Format helper response for API
     * @param {Object} helper
     * @returns {Object} Formatted helper data
     */
    static formatHelperResponse(helper) {
        return {
            id: helper._id,
            authId: helper.authId,
            fullName: helper.fullName,
            email: helper.email,
            phoneNumber: helper.phoneNumber,
            role: helper.role,
            status: helper.status,
            verificationStatus: helper.verificationStatus,
            skills: helper.skills,
            credentials: helper.credentials,
            availability: helper.availability,
            pricing: helper.pricing,
            performanceMetrics: helper.performanceMetrics,
            badges: helper.badges,
            locationId: helper.locationId,
            isVolunteer: helper.isVolunteer,
            createdAt: helper.createdAt,
            updatedAt: helper.updatedAt
        };
    }

    /**
     * Format helper list for search results
     * @param {Array} helpers
     * @param {Object} userLocation - {lat, lng}
     * @returns {Array} Formatted helper list
     */
    static formatHelperList(helpers, userLocation = null) {
        return helpers.map(helper => {
            const formatted = this.formatHelperResponse(helper);

            // Add distance if user location provided
            if (userLocation && helper.availability?.currentLocation) {
                formatted.distance = this.calculateDistance(
                    userLocation,
                    helper.availability.currentLocation
                );
            }

            return formatted;
        });
    }

    /**
     * Generate search query for helpers
     * @param {Object} filters
     * @returns {Object} MongoDB query
     */
    static buildSearchQuery(filters) {
        const query = {
            status: HelperConstants.STATUS.ACTIVE,
            verificationStatus: HelperConstants.VERIFICATION_STATUS.VERIFIED
        };

        if (filters.skills && filters.skills.length > 0) {
            query['skills.name'] = { $in: filters.skills };
        }

        if (filters.categories && filters.categories.length > 0) {
            query['skills.category'] = { $in: filters.categories };
        }

        if (filters.minRating) {
            query['performanceMetrics.rating'] = { $gte: filters.minRating };
        }

        if (filters.isVolunteer !== undefined) {
            query.isVolunteer = filters.isVolunteer;
        }

        if (filters.maxPrice) {
            query['pricing.baseRate'] = { $lte: filters.maxPrice };
        }

        return query;
    }

    /**
     * Generate sort options for helper search
     * @param {string} sortBy
     * @param {string} sortOrder
     * @returns {Object} MongoDB sort object
     */
    static buildSortOptions(sortBy = 'rating', sortOrder = 'desc') {
        const sortOptions = {};

        switch (sortBy) {
            case 'rating':
                sortOptions['performanceMetrics.rating'] = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'responseTime':
                sortOptions['performanceMetrics.averageResponseTime'] = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'price':
                sortOptions['pricing.baseRate'] = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'distance':
                // Distance sorting needs to be handled separately with aggregation
                break;
            default:
                sortOptions['performanceMetrics.rating'] = -1;
        }

        return sortOptions;
    }
}
