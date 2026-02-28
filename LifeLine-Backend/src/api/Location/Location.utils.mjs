import LocationConstants from './Location.constants.mjs';

/**
 * LocationUtils - Utility functions for Location module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class LocationUtils {
    /**
     * Validate coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {boolean}
     */
    static validateCoordinates(lat, lng) {
        return lat >= LocationConstants.COORDINATES.MIN_LATITUDE &&
               lat <= LocationConstants.COORDINATES.MAX_LATITUDE &&
               lng >= LocationConstants.COORDINATES.MIN_LONGITUDE &&
               lng <= LocationConstants.COORDINATES.MAX_LONGITUDE;
    }

    /**
     * Validate location type
     * @param {string} type - Location type
     * @returns {boolean}
     */
    static validateLocationType(type) {
        return Object.values(LocationConstants.LOCATION_TYPES).includes(type);
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {Object} coord1 - {lat, lng}
     * @param {Object} coord2 - {lat, lng}
     * @returns {number} Distance in kilometers
     */
    static calculateDistance(coord1, coord2) {
        const R = LocationConstants.SEARCH.EARTH_RADIUS_KM;
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
     * Format location response for API
     * @param {Object} location
     * @returns {Object} Formatted location data
     */
    static formatLocationResponse(location) {
        return {
            id: location._id,
            userId: location.userId,
            type: location.type,
            name: location.name,
            coordinates: location.coordinates,
            address: location.address,
            buildingInfo: location.buildingInfo,
            isVerified: location.isVerified,
            accuracy: location.accuracy,
            lastUpdated: location.lastUpdated,
            createdAt: location.createdAt,
            updatedAt: location.updatedAt
        };
    }

    /**
     * Sanitize location input data
     * @param {Object} locationData
     * @returns {Object} Sanitized data
     */
    static sanitizeLocationData(locationData) {
        const sanitized = { ...locationData };

        // Trim string fields
        ['name', 'type'].forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = sanitized[field].trim();
            }
        });

        // Sanitize address
        if (sanitized.address) {
            sanitized.address = {
                ...sanitized.address,
                street: sanitized.address.street?.trim(),
                city: sanitized.address.city?.trim(),
                state: sanitized.address.state?.trim(),
                country: sanitized.address.country?.trim(),
                postalCode: sanitized.address.postalCode?.trim()
            };
        }

        // Sanitize building info
        if (sanitized.buildingInfo) {
            sanitized.buildingInfo = {
                ...sanitized.buildingInfo,
                buildingName: sanitized.buildingInfo.buildingName?.trim(),
                floor: sanitized.buildingInfo.floor?.trim(),
                room: sanitized.buildingInfo.room?.trim(),
                landmark: sanitized.buildingInfo.landmark?.trim()
            };
        }

        return sanitized;
    }

    /**
     * Generate location search query
     * @param {Object} filters
     * @returns {Object} MongoDB query
     */
    static buildSearchQuery(filters) {
        const query = {};

        if (filters.userId) {
            query.userId = filters.userId;
        }

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.isVerified !== undefined) {
            query.isVerified = filters.isVerified;
        }

        if (filters.city) {
            query['address.city'] = new RegExp(filters.city, 'i');
        }

        if (filters.country) {
            query['address.country'] = new RegExp(filters.country, 'i');
        }

        return query;
    }

    /**
     * Generate sort options for location search
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
            case 'name':
                sortOptions.name = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'type':
                sortOptions.type = sortOrder === 'desc' ? -1 : 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        return sortOptions;
    }

    /**
     * Create geospatial query for location search
     * @param {Object} center - {lat, lng}
     * @param {number} radiusKm - Radius in kilometers
     * @returns {Object} MongoDB geospatial query
     */
    static createGeospatialQuery(center, radiusKm) {
        return {
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [center.lng, center.lat]
                    },
                    $maxDistance: radiusKm * 1000 // Convert to meters
                }
            }
        };
    }

    /**
     * Validate address object
     * @param {Object} address
     * @returns {boolean}
     */
    static validateAddress(address) {
        if (!address || typeof address !== 'object') return false;

        const required = ['street', 'city', 'country'];
        for (const field of required) {
            if (!address[field] || typeof address[field] !== 'string' || address[field].trim().length === 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Generate location name from address
     * @param {Object} address
     * @param {string} type
     * @returns {string}
     */
    static generateLocationName(address, type) {
        if (type === LocationConstants.LOCATION_TYPES.HOME) {
            return 'Home';
        } else if (type === LocationConstants.LOCATION_TYPES.WORK) {
            return 'Work';
        } else if (address.buildingName) {
            return address.buildingName;
        } else if (address.street && address.city) {
            return `${address.street}, ${address.city}`;
        } else {
            return 'Custom Location';
        }
    }

    /**
     * Check if location data is complete
     * @param {Object} location
     * @returns {boolean}
     */
    static isLocationComplete(location) {
        const requiredFields = [
            'type', 'coordinates', 'address'
        ];

        return requiredFields.every(field => {
            if (field === 'coordinates') {
                return location.coordinates &&
                       Array.isArray(location.coordinates) &&
                       location.coordinates.length === 2 &&
                       this.validateCoordinates(location.coordinates[1], location.coordinates[0]);
            }
            if (field === 'address') {
                return this.validateAddress(location.address);
            }
            return location[field];
        });
    }

    /**
     * Calculate location accuracy based on various factors
     * @param {Object} location
     * @returns {number} Accuracy in meters
     */
    static calculateAccuracy(location) {
        let accuracy = LocationConstants.DEFAULTS.ACCURACY;

        // Higher accuracy for verified locations
        if (location.isVerified) {
            accuracy = Math.min(accuracy, 5);
        }

        // Higher accuracy for complete building info
        if (location.buildingInfo && location.buildingInfo.floor) {
            accuracy = Math.min(accuracy, 1);
        }

        return accuracy;
    }
}