import mongoose from 'mongoose';
import Location from './Location.model.mjs';
import LocationUtils from './Location.utils.mjs';
import LocationConstants from './Location.constants.mjs';
import Auth from '../Auth/v1/Auth.model.mjs';
import User from '../User/User.Schema.mjs';
import Helper from '../Helper/Helper.model.mjs';

/**
 * LocationService - Business logic for Location operations.
 */
export default class LocationService {
  static normalizeCoordinates(data = {}) {
    if (Array.isArray(data.coordinates) && data.coordinates.length === 2) {
      const lng = Number(data.coordinates[0]);
      const lat = Number(data.coordinates[1]);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null;
    }

    if (
      data.coordinates &&
      typeof data.coordinates === 'object' &&
      Array.isArray(data.coordinates.coordinates) &&
      data.coordinates.coordinates.length === 2
    ) {
      const lng = Number(data.coordinates.coordinates[0]);
      const lat = Number(data.coordinates.coordinates[1]);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null;
    }

    if (data.longitude !== undefined && data.latitude !== undefined) {
      const lng = Number(data.longitude);
      const lat = Number(data.latitude);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null;
    }

    return null;
  }

  static async resolveProfileContext(ownerId) {
    if (!ownerId) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
    }

    const normalizedId = String(ownerId);
    const buildContext = (role, profileId, authId = null) => {
      const isHelper = role === 'helper';
      return {
        role,
        profileId,
        authId,
        ownerQuery: isHelper ? { helperId: profileId } : { userId: profileId },
        ownerFields: isHelper
          ? { helperId: profileId, userId: undefined }
          : { userId: profileId, helperId: undefined },
      };
    };

    let authRecord = await Auth.findById(normalizedId).select('_id role userId helperId');
    if (authRecord) {
      let profileId = authRecord.role === 'helper' ? authRecord.helperId : authRecord.userId;

      if (!profileId) {
        if (authRecord.role === 'helper') {
          const helperProfile = await Helper.findOne({ authId: authRecord._id }).select('_id');
          profileId = helperProfile?._id;
        } else {
          const userProfile = await User.findOne({ authId: authRecord._id }).select('_id');
          profileId = userProfile?._id;
        }
      }

      if (!profileId) {
        throw new Error('Profile not found. Please complete profile setup before saving location.');
      }

      return buildContext(authRecord.role, profileId, authRecord._id);
    }

    authRecord = await Auth.findOne({
      $or: [{ userId: normalizedId }, { helperId: normalizedId }],
    }).select('_id role userId helperId');

    if (authRecord) {
      const profileId = authRecord.role === 'helper' ? authRecord.helperId : authRecord.userId;
      if (profileId) {
        return buildContext(authRecord.role, profileId, authRecord._id);
      }
    }

    if (mongoose.Types.ObjectId.isValid(normalizedId)) {
      const [userProfile, helperProfile] = await Promise.all([
        User.findById(normalizedId).select('_id'),
        Helper.findById(normalizedId).select('_id'),
      ]);

      if (helperProfile) {
        return buildContext('helper', helperProfile._id);
      }

      if (userProfile) {
        return buildContext('user', userProfile._id);
      }
    }

    throw new Error(
      'Profile not found. Please create a user or helper profile before setting location.',
    );
  }

  static buildCreatePayload(data = {}, coordinates) {
    const sanitized = LocationUtils.sanitizeLocationData(data);

    const payload = {
      userId: sanitized.userId,
      helperId: sanitized.helperId,
      type: 'Point',
      coordinates,
      address: sanitized.address || LocationUtils.composeAddress(sanitized),
      street: sanitized.street,
      city: sanitized.city,
      state: sanitized.state,
      country: sanitized.country || 'India',
      zipCode: sanitized.zipCode,
      buildingName: sanitized.buildingName,
      floor: sanitized.floor,
      apartmentUnit: sanitized.apartmentUnit,
      landmark: sanitized.landmark,
      placeType: sanitized.placeType || 'other',
      accuracy: LocationUtils.calculateAccuracy(sanitized),
      altitude: sanitized.altitude,
      altitudeAccuracy: sanitized.altitudeAccuracy,
      speed: sanitized.speed,
      heading: sanitized.heading,
      provider: sanitized.provider || 'manual',
      emergencyAccessNotes: sanitized.emergencyAccessNotes,
      isVerified: Boolean(sanitized.isVerified),
      lastUpdated: new Date(),
      isActive: sanitized.isActive ?? true,
      source: sanitized.source || 'app',
    };

    return payload;
  }

  static async createLocation(locationData) {
    const { userId } = locationData;

    if (!userId) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
    }

    const coordinates = this.normalizeCoordinates(locationData);
    if (!coordinates || !LocationUtils.validateCoordinates(coordinates[1], coordinates[0])) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
    }

    const context = await this.resolveProfileContext(userId);
    const existingLocation = await Location.findOne({
      ...context.ownerQuery,
      isActive: true,
    }).sort({ lastUpdated: -1 });

    if (existingLocation) {
      return LocationUtils.formatLocationResponse(existingLocation);
    }

    const payload = this.buildCreatePayload(
      {
        ...locationData,
        ...context.ownerFields,
      },
      coordinates,
    );

    if (!LocationUtils.validateAddress(payload.address)) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_ADDRESS);
    }

    const location = new Location(payload);
    await location.save();

    return LocationUtils.formatLocationResponse(location);
  }

  static async createLocationFromCoordinates(locationData) {
    const { userId } = locationData;
    const coordinates = this.normalizeCoordinates(locationData);

    if (!userId || !coordinates) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
    }

    if (!LocationUtils.validateCoordinates(coordinates[1], coordinates[0])) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
    }

    const context = await this.resolveProfileContext(userId);
    const existingLocation = await Location.findOne({
      ...context.ownerQuery,
      isActive: true,
    }).sort({ lastUpdated: -1 });

    if (existingLocation) {
      return LocationUtils.formatLocationResponse(existingLocation);
    }

    const geocode = await LocationUtils.reverseGeocode(coordinates[1], coordinates[0]);

    const payload = this.buildCreatePayload(
      {
        ...locationData,
        ...context.ownerFields,
        address: locationData.address || geocode.formattedAddress,
        street: locationData.street || geocode.street,
        city: locationData.city || geocode.city,
        state: locationData.state || geocode.state,
        country: locationData.country || geocode.country,
        zipCode: locationData.zipCode || geocode.postalCode,
      },
      coordinates,
    );

    const location = new Location(payload);
    await location.save();

    return LocationUtils.formatLocationResponse(location);
  }

  static async getLocationById(locationId) {
    const location = await Location.findById(locationId);
    if (!location) {
      throw new Error(LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    return LocationUtils.formatLocationResponse(location);
  }

  static async getLocationsByUserId(userId) {
    if (!userId) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
    }

    const context = await this.resolveProfileContext(userId);
    const locations = await Location.find({
      ...context.ownerQuery,
      isActive: true,
    }).sort({ createdAt: -1 });

    return locations.map((location) => LocationUtils.formatLocationResponse(location));
  }

  static async updateLocation(locationId, updateData) {
    const location = await Location.findById(locationId);
    if (!location) {
      throw new Error(LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    const sanitized = LocationUtils.sanitizeLocationData(updateData);
    const coordinates = this.normalizeCoordinates(sanitized);

    if (coordinates) {
      if (!LocationUtils.validateCoordinates(coordinates[1], coordinates[0])) {
        throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
      }
      location.coordinates = coordinates;
    }

    const updatableFields = [
      'address',
      'street',
      'city',
      'state',
      'country',
      'zipCode',
      'buildingName',
      'floor',
      'apartmentUnit',
      'landmark',
      'placeType',
      'accuracy',
      'altitude',
      'altitudeAccuracy',
      'speed',
      'heading',
      'provider',
      'emergencyAccessNotes',
      'source',
      'isVerified',
      'isActive',
      'helperId',
      'userId',
    ];

    updatableFields.forEach((field) => {
      if (sanitized[field] !== undefined) {
        location[field] = sanitized[field];
      }
    });

    if (!location.address) {
      location.address = LocationUtils.composeAddress(location);
    }

    location.lastUpdated = new Date();
    await location.save();

    return LocationUtils.formatLocationResponse(location);
  }

  static async updateLocationAddress(locationId, updateData) {
    const location = await Location.findById(locationId);
    if (!location) {
      throw new Error(LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    const sanitized = LocationUtils.sanitizeLocationData(updateData);
    const fields = ['address', 'street', 'city', 'state', 'country', 'zipCode', 'landmark'];

    fields.forEach((field) => {
      if (sanitized[field] !== undefined) {
        location[field] = sanitized[field];
      }
    });

    if (!location.address) {
      location.address = LocationUtils.composeAddress(location);
    }

    location.lastUpdated = new Date();
    await location.save();

    return LocationUtils.formatLocationResponse(location);
  }

  static async updateCurrentLocation(userId, locationData) {
    if (!userId) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
    }

    const coordinates = this.normalizeCoordinates(locationData);
    if (!coordinates || !LocationUtils.validateCoordinates(coordinates[1], coordinates[0])) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
    }

    const context = await this.resolveProfileContext(userId);
    const now = new Date();
    let location = await Location.findOne({
      ...context.ownerQuery,
      placeType: 'current',
      isActive: true,
    });

    if (location) {
      location.coordinates = coordinates;
      if (locationData.accuracy !== undefined) {
        location.accuracy = Number(locationData.accuracy);
      }
      if (locationData.provider) {
        location.provider = locationData.provider;
      }
      location.lastUpdated = now;
      await location.save();
      return LocationUtils.formatLocationResponse(location);
    }

    const payload = this.buildCreatePayload(
      {
        ...locationData,
        ...context.ownerFields,
        placeType: 'current',
        address: locationData.address || 'GPS Location',
        source: locationData.source || 'sos',
      },
      coordinates,
    );

    location = new Location(payload);
    await location.save();

    return LocationUtils.formatLocationResponse(location);
  }

  static async searchLocationsWithinRadius(
    center,
    radiusKm = LocationConstants.SEARCH.DEFAULT_DISTANCE_KM,
    filters = {},
  ) {
    const lat = Number(center?.lat);
    const lng = Number(center?.lng);

    if (!LocationUtils.validateCoordinates(lat, lng)) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
    }

    const clampedRadius = Math.max(
      0.1,
      Math.min(Number(radiusKm) || 10, LocationConstants.SEARCH.MAX_DISTANCE_KM),
    );
    const query = {
      ...LocationUtils.buildSearchQuery(filters),
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: clampedRadius * 1000,
        },
      },
    };

    const locations = await Location.find(query).limit(100);

    return locations.map((location) => {
      const formatted = LocationUtils.formatLocationResponse(location);
      if (Array.isArray(formatted.coordinates) && formatted.coordinates.length === 2) {
        formatted.distance = LocationUtils.calculateDistance(
          { lat, lng },
          { lat: formatted.coordinates[1], lng: formatted.coordinates[0] },
        );
      }
      return formatted;
    });
  }

  static async searchNearbyHelpers(
    center,
    radiusKm = LocationConstants.SEARCH.DEFAULT_DISTANCE_KM,
  ) {
    const lat = Number(center?.lat);
    const lng = Number(center?.lng);

    if (!LocationUtils.validateCoordinates(lat, lng)) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
    }

    const clampedRadius = Math.max(
      0.1,
      Math.min(Number(radiusKm) || 10, LocationConstants.SEARCH.MAX_DISTANCE_KM),
    );

    const locations = await Location.find({
      helperId: { $exists: true, $ne: null },
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: clampedRadius * 1000,
        },
      },
    })
      .populate({
        path: 'helperId',
        populate: {
          path: 'authId',
          select: 'name profileImage',
        },
      })
      .limit(100);

    return locations.map((location) => {
      const formatted = LocationUtils.formatLocationResponse(location);

      if (Array.isArray(formatted.coordinates) && formatted.coordinates.length === 2) {
        formatted.distance = LocationUtils.calculateDistance(
          { lat, lng },
          { lat: formatted.coordinates[1], lng: formatted.coordinates[0] },
        );
      }

      const helperProfile = location?.helperId?.authId;
      if (helperProfile) {
        formatted.helperName = helperProfile.name;
        formatted.helperImage = helperProfile.profileImage;
      }

      return formatted;
    });
  }

  static async searchLocations(filters = {}, options = {}) {
    const query = LocationUtils.buildSearchQuery(filters);
    const page = Math.max(1, Number(options.page) || LocationConstants.PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, Number(options.limit) || LocationConstants.PAGINATION.DEFAULT_LIMIT),
      LocationConstants.PAGINATION.MAX_LIMIT,
    );

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    const sort = LocationUtils.buildSortOptions(sortBy, sortOrder);

    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      Location.find(query).sort(sort).skip(skip).limit(limit),
      Location.countDocuments(query),
    ]);

    return {
      locations: locations.map((location) => LocationUtils.formatLocationResponse(location)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async verifyLocation(locationId, isVerified) {
    const location = await Location.findByIdAndUpdate(
      locationId,
      {
        isVerified: Boolean(isVerified),
        lastUpdated: new Date(),
      },
      { new: true },
    );

    if (!location) {
      throw new Error(LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    return LocationUtils.formatLocationResponse(location);
  }

  static async deleteLocation(locationId) {
    const deleted = await Location.findByIdAndDelete(locationId);
    return Boolean(deleted);
  }

  static async getLocationStats(userId) {
    if (!userId) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
    }

    const context = await this.resolveProfileContext(userId);
    const locations = await Location.find({
      ...context.ownerQuery,
      isActive: true,
    }).sort({ lastUpdated: -1 });

    const stats = {
      totalLocations: locations.length,
      verifiedLocations: locations.filter((loc) => Boolean(loc.isVerified)).length,
      hasCurrentLocation: locations.some((loc) => loc.placeType === 'current'),
      byPlaceType: {},
      lastUpdated: locations[0]?.lastUpdated || null,
    };

    locations.forEach((location) => {
      const key = location.placeType || 'unknown';
      stats.byPlaceType[key] = (stats.byPlaceType[key] || 0) + 1;
    });

    return stats;
  }
}
