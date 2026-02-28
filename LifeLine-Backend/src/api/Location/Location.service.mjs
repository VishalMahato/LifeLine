import Location from './Location.model.mjs';
import LocationUtils from './Location.utils.mjs';
import LocationConstants from './Location.constants.mjs';

/**
 * LocationService - Business logic layer for Location operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
export default class LocationService {
    /**
     * Create a new location
     * @param {Object} locationData - Location data
     * @returns {Promise<Object>} Created location
     */
    static async createLocation(locationData) {
        try {
            const {
                userId,
                type = LocationConstants.DEFAULTS.LOCATION_TYPE,
                name,
                coordinates,
                address,
                buildingInfo,
                isVerified = LocationConstants.DEFAULTS.IS_VERIFIED,
                accuracy
            } = locationData;

            // Validate required fields
            if (!userId || !coordinates || !address) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
            }

            // Validate coordinates
            if (!Array.isArray(coordinates) || coordinates.length !== 2 ||
                !LocationUtils.validateCoordinates(coordinates[1], coordinates[0])) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
            }

            // Validate location type
            if (!LocationUtils.validateLocationType(type)) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_LOCATION_TYPE);
            }

            // Validate address
            if (!LocationUtils.validateAddress(address)) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_ADDRESS);
            }

            // Sanitize input data
            const sanitizedData = LocationUtils.sanitizeLocationData(locationData);

            // Generate name if not provided
            const locationName = name || LocationUtils.generateLocationName(address, type);

            // Calculate accuracy
            const locationAccuracy = accuracy || LocationUtils.calculateAccuracy(sanitizedData);

            // Create location
            const location = new Location({
                userId,
                type,
                name: locationName,
                coordinates: {
                    type: 'Point',
                    coordinates: [coordinates[0], coordinates[1]] // [lng, lat]
                },
                address: sanitizedData.address,
                buildingInfo: sanitizedData.buildingInfo,
                isVerified,
                accuracy: locationAccuracy,
                lastUpdated: new Date()
            });

            await location.save();

            return LocationUtils.formatLocationResponse(location);
        } catch (error) {
            throw new Error(`Failed to create location: ${error.message}`);
        }
    }

    /**
     * Get location by ID
     * @param {string} locationId - Location ID
     * @returns {Promise<Object>} Location data
     */
    static async getLocationById(locationId) {
        try {
            const location = await Location.findById(locationId);
            if (!location) {
                throw new Error(LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND);
            }

            return LocationUtils.formatLocationResponse(location);
        } catch (error) {
            throw new Error(`Failed to get location: ${error.message}`);
        }
    }

    /**
     * Get locations by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Array>} User's locations
     */
    static async getLocationsByUserId(userId) {
        try {
            const locations = await Location.find({ userId }).sort({ createdAt: -1 });
            return locations.map(location => LocationUtils.formatLocationResponse(location));
        } catch (error) {
            throw new Error(`Failed to get user locations: ${error.message}`);
        }
    }

    /**
     * Update location
     * @param {string} locationId - Location ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated location
     */
    static async updateLocation(locationId, updateData) {
        try {
            const location = await Location.findById(locationId);
            if (!location) {
                throw new Error(LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND);
            }

            // Validate coordinates if being updated
            if (updateData.coordinates) {
                if (!Array.isArray(updateData.coordinates) || updateData.coordinates.length !== 2 ||
                    !LocationUtils.validateCoordinates(updateData.coordinates[1], updateData.coordinates[0])) {
                    throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
                }
                updateData.coordinates = {
                    type: 'Point',
                    coordinates: [updateData.coordinates[0], updateData.coordinates[1]]
                };
            }

            // Validate location type if being updated
            if (updateData.type && !LocationUtils.validateLocationType(updateData.type)) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_LOCATION_TYPE);
            }

            // Validate address if being updated
            if (updateData.address && !LocationUtils.validateAddress(updateData.address)) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_ADDRESS);
            }

            // Sanitize update data
            const sanitizedData = LocationUtils.sanitizeLocationData(updateData);

            // Update fields
            const allowedUpdates = [
                'type', 'name', 'coordinates', 'address', 'buildingInfo', 'isVerified', 'accuracy'
            ];

            allowedUpdates.forEach(field => {
                if (sanitizedData[field] !== undefined) {
                    location[field] = sanitizedData[field];
                }
            });

            location.lastUpdated = new Date();

            await location.save();

            return LocationUtils.formatLocationResponse(location);
        } catch (error) {
            throw new Error(`Failed to update location: ${error.message}`);
        }
    }

    /**
     * Update current location (GPS-based)
     * @param {string} userId - User ID
     * @param {Object} locationData - {coordinates, accuracy}
     * @returns {Promise<Object>} Updated or created current location
     */
    static async updateCurrentLocation(userId, locationData) {
        try {
            const { coordinates, accuracy } = locationData;

            if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2 ||
                !LocationUtils.validateCoordinates(coordinates[1], coordinates[0])) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
            }

            // Find existing current location or create new one
            let currentLocation = await Location.findOne({
                userId,
                type: LocationConstants.LOCATION_TYPES.CURRENT
            });

            if (currentLocation) {
                // Update existing
                currentLocation.coordinates = {
                    type: 'Point',
                    coordinates: [coordinates[0], coordinates[1]]
                };
                currentLocation.accuracy = accuracy || LocationUtils.calculateAccuracy(currentLocation);
                currentLocation.lastUpdated = new Date();
                await currentLocation.save();
            } else {
                // Create new current location
                currentLocation = await this.createLocation({
                    userId,
                    type: LocationConstants.LOCATION_TYPES.CURRENT,
                    name: 'Current Location',
                    coordinates,
                    address: {
                        street: 'GPS Location',
                        city: 'Unknown',
                        state: 'Unknown',
                        country: 'Unknown'
                    },
                    accuracy
                });
            }

            return LocationUtils.formatLocationResponse(currentLocation);
        } catch (error) {
            throw new Error(`Failed to update current location: ${error.message}`);
        }
    }

    /**
     * Search locations within radius
     * @param {Object} center - {lat, lng}
     * @param {number} radiusKm - Radius in kilometers
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Locations within radius
     */
    static async searchLocationsWithinRadius(center, radiusKm = LocationConstants.SEARCH.DEFAULT_DISTANCE_KM, filters = {}) {
        try {
            if (!center || !center.lat || !center.lng ||
                !LocationUtils.validateCoordinates(center.lat, center.lng)) {
                throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
            }

            const maxDistance = Math.min(radiusKm, LocationConstants.SEARCH.MAX_DISTANCE_KM);
            const geospatialQuery = LocationUtils.createGeospatialQuery(center, maxDistance);

            const query = {
                ...geospatialQuery,
                ...LocationUtils.buildSearchQuery(filters)
            };

            const locations = await Location.find(query).limit(50);

            // Add distance to each location
            const locationsWithDistance = locations.map(location => {
                const formatted = LocationUtils.formatLocationResponse(location);
                formatted.distance = LocationUtils.calculateDistance(center, {
                    lat: location.coordinates.coordinates[1],
                    lng: location.coordinates.coordinates[0]
                });
                return formatted;
            });

            // Sort by distance
            locationsWithDistance.sort((a, b) => a.distance - b.distance);

            return locationsWithDistance;
        } catch (error) {
            throw new Error(`Failed to search locations: ${error.message}`);
        }
    }

    /**
     * Search locations with filters
     * @param {Object} filters - Search filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Object>} Search results
     */
    static async searchLocations(filters = {}, options = {}) {
        try {
            const {
                page = LocationConstants.PAGINATION.DEFAULT_PAGE,
                limit = LocationConstants.PAGINATION.DEFAULT_LIMIT,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const query = LocationUtils.buildSearchQuery(filters);
            const sortOptions = LocationUtils.buildSortOptions(sortBy, sortOrder);

            const skip = (page - 1) * limit;

            const [locations, total] = await Promise.all([
                Location.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit),
                Location.countDocuments(query)
            ]);

            const formattedLocations = locations.map(location => LocationUtils.formatLocationResponse(location));

            return {
                locations: formattedLocations,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to search locations: ${error.message}`);
        }
    }

    /**
     * Verify location (Admin function)
     * @param {string} locationId - Location ID
     * @param {boolean} isVerified - Verification status
     * @returns {Promise<Object>} Updated location
     */
    static async verifyLocation(locationId, isVerified) {
        try {
            const location = await Location.findByIdAndUpdate(
                locationId,
                {
                    isVerified,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!location) {
                throw new Error(LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND);
            }

            return LocationUtils.formatLocationResponse(location);
        } catch (error) {
            throw new Error(`Failed to verify location: ${error.message}`);
        }
    }

    /**
     * Delete location
     * @param {string} locationId - Location ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteLocation(locationId) {
        try {
            const result = await Location.findByIdAndDelete(locationId);
            return !!result;
        } catch (error) {
            throw new Error(`Failed to delete location: ${error.message}`);
        }
    }

    /**
     * Get location statistics for user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Location statistics
     */
    static async getLocationStats(userId) {
        try {
            const locations = await Location.find({ userId });

            const stats = {
                totalLocations: locations.length,
                verifiedLocations: locations.filter(loc => loc.isVerified).length,
                locationTypes: {},
                hasCurrentLocation: locations.some(loc => loc.type === LocationConstants.LOCATION_TYPES.CURRENT),
                averageAccuracy: 0
            };

            // Count location types
            locations.forEach(location => {
                stats.locationTypes[location.type] = (stats.locationTypes[location.type] || 0) + 1;
            });

            // Calculate average accuracy
            if (locations.length > 0) {
                const totalAccuracy = locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0);
                stats.averageAccuracy = Math.round(totalAccuracy / locations.length);
            }

            return stats;
        } catch (error) {
            throw new Error(`Failed to get location stats: ${error.message}`);
        }
    }
}