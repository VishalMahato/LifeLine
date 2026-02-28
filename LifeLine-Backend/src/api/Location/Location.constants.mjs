/**
 * LocationConstants - Centralized constants for Location module
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export default class LocationConstants {
    // Location Types
    static LOCATION_TYPES = {
        HOME: 'home',
        WORK: 'work',
        HOSPITAL: 'hospital',
        POLICE_STATION: 'police_station',
        FIRE_STATION: 'fire_station',
        PHARMACY: 'pharmacy',
        CURRENT: 'current',
        CUSTOM: 'custom'
    };

    // Coordinate Validation
    static COORDINATES = {
        MIN_LATITUDE: -90,
        MAX_LATITUDE: 90,
        MIN_LONGITUDE: -180,
        MAX_LONGITUDE: 180
    };

    // Validation Messages
    static MESSAGES = {
        VALIDATION: {
            INVALID_COORDINATES: 'Invalid latitude or longitude coordinates',
            INVALID_LOCATION_TYPE: 'Invalid location type',
            MISSING_REQUIRED_FIELDS: 'Missing required fields',
            INVALID_ADDRESS: 'Invalid address format'
        },
        SUCCESS: {
            LOCATION_CREATED: 'Location created successfully',
            LOCATION_UPDATED: 'Location updated successfully',
            LOCATION_VERIFIED: 'Location verified successfully'
        },
        ERROR: {
            LOCATION_NOT_FOUND: 'Location not found',
            UNAUTHORIZED: 'Unauthorized access',
            UPDATE_FAILED: 'Update failed',
            INVALID_DATA: 'Invalid data provided'
        }
    };

    // Default Values
    static DEFAULTS = {
        LOCATION_TYPE: this.LOCATION_TYPES.CUSTOM,
        IS_VERIFIED: false,
        ACCURACY: 10 // meters
    };

    // Rate Limiting
    static RATE_LIMITS = {
        CREATE_LOCATION: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 requests per 15 minutes
        UPDATE_LOCATION: { windowMs: 15 * 60 * 1000, max: 20 },
        SEARCH_LOCATIONS: { windowMs: 15 * 60 * 1000, max: 50 }
    };

    // Pagination
    static PAGINATION = {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    };

    // Search and Distance
    static SEARCH = {
        MAX_DISTANCE_KM: 50,
        DEFAULT_DISTANCE_KM: 10,
        EARTH_RADIUS_KM: 6371
    };

    // Geocoding
    static GEOCODING = {
        MAX_RETRIES: 3,
        TIMEOUT_MS: 5000
    };
}