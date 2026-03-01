import LocationConstants from './Location.constants.mjs';

/**
 * LocationUtils - Utility helpers for Location module.
 */
export default class LocationUtils {
  static validateCoordinates(lat, lng) {
    return (
      Number.isFinite(lat)
      && Number.isFinite(lng)
      && lat >= LocationConstants.COORDINATES.MIN_LATITUDE
      && lat <= LocationConstants.COORDINATES.MAX_LATITUDE
      && lng >= LocationConstants.COORDINATES.MIN_LONGITUDE
      && lng <= LocationConstants.COORDINATES.MAX_LONGITUDE
    );
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  static calculateDistance(coord1, coord2) {
    const r = LocationConstants.SEARCH.EARTH_RADIUS_KM;
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(this.toRadians(coord1.lat))
      * Math.cos(this.toRadians(coord2.lat))
      * Math.sin(dLng / 2)
      * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return r * c;
  }

  static composeAddress(data = {}) {
    const segments = [
      data.street,
      data.city,
      data.state,
      data.zipCode,
      data.country,
    ]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);

    return segments.join(', ');
  }

  static sanitizeLocationData(locationData = {}) {
    const sanitized = { ...locationData };

    const stringFields = [
      'address',
      'street',
      'city',
      'state',
      'country',
      'zipCode',
      'placeType',
      'provider',
      'buildingName',
      'floor',
      'apartmentUnit',
      'landmark',
      'emergencyAccessNotes',
      'source',
    ];

    stringFields.forEach((field) => {
      if (typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim();
      }
    });

    if (typeof sanitized.address === 'object' && sanitized.address !== null) {
      const addr = sanitized.address;
      sanitized.street = typeof addr.street === 'string' ? addr.street.trim() : sanitized.street;
      sanitized.city = typeof addr.city === 'string' ? addr.city.trim() : sanitized.city;
      sanitized.state = typeof addr.state === 'string' ? addr.state.trim() : sanitized.state;
      sanitized.country = typeof addr.country === 'string' ? addr.country.trim() : sanitized.country;
      sanitized.zipCode = typeof addr.postalCode === 'string'
        ? addr.postalCode.trim()
        : typeof addr.zipCode === 'string'
          ? addr.zipCode.trim()
          : sanitized.zipCode;
      sanitized.address = this.composeAddress(sanitized);
    }

    const numericFields = ['accuracy', 'altitude', 'altitudeAccuracy', 'speed', 'heading'];
    numericFields.forEach((field) => {
      if (sanitized[field] !== undefined && sanitized[field] !== null && sanitized[field] !== '') {
        const parsed = Number(sanitized[field]);
        if (Number.isFinite(parsed)) {
          sanitized[field] = parsed;
        }
      }
    });

    return sanitized;
  }

  static validateAddress(address) {
    if (typeof address === 'string') {
      return address.trim().length > 0;
    }

    if (!address || typeof address !== 'object') {
      return false;
    }

    return ['street', 'city', 'state', 'country']
      .some((field) => typeof address[field] === 'string' && address[field].trim().length > 0);
  }

  static buildSearchQuery(filters = {}) {
    const query = {
      isActive: filters.isActive ?? true,
    };

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.helperId) {
      query.helperId = filters.helperId;
    }

    if (filters.placeType) {
      query.placeType = filters.placeType;
    }

    if (filters.isVerified !== undefined) {
      query.isVerified = filters.isVerified;
    }

    if (filters.city) {
      query.city = new RegExp(filters.city, 'i');
    }

    if (filters.state) {
      query.state = new RegExp(filters.state, 'i');
    }

    if (filters.country) {
      query.country = new RegExp(filters.country, 'i');
    }

    return query;
  }

  static buildSortOptions(sortBy = 'createdAt', sortOrder = 'desc') {
    const validSorts = new Set(['createdAt', 'updatedAt', 'lastUpdated', 'city', 'state']);
    const key = validSorts.has(sortBy) ? sortBy : 'createdAt';
    return { [key]: sortOrder === 'asc' ? 1 : -1 };
  }

  static formatLocationResponse(location) {
    if (!location) {
      return null;
    }

    const coordinates = Array.isArray(location.coordinates)
      ? location.coordinates
      : Array.isArray(location.coordinates?.coordinates)
        ? location.coordinates.coordinates
        : [];

    return {
      id: location._id,
      userId: location.userId,
      helperId: location.helperId,
      type: location.type,
      coordinates,
      address: location.address,
      street: location.street,
      city: location.city,
      state: location.state,
      country: location.country,
      zipCode: location.zipCode,
      placeType: location.placeType,
      buildingName: location.buildingName,
      floor: location.floor,
      apartmentUnit: location.apartmentUnit,
      landmark: location.landmark,
      emergencyAccessNotes: location.emergencyAccessNotes,
      provider: location.provider,
      source: location.source,
      accuracy: location.accuracy,
      altitude: location.altitude,
      altitudeAccuracy: location.altitudeAccuracy,
      speed: location.speed,
      heading: location.heading,
      isVerified: location.isVerified,
      isActive: location.isActive,
      lastUpdated: location.lastUpdated,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }

  static calculateAccuracy(location = {}) {
    if (typeof location.accuracy === 'number' && Number.isFinite(location.accuracy)) {
      return location.accuracy;
    }

    return LocationConstants.DEFAULTS.ACCURACY;
  }

  static async reverseGeocode(latitude, longitude) {
    if (!this.validateCoordinates(latitude, longitude)) {
      throw new Error(LocationConstants.MESSAGES.VALIDATION.INVALID_COORDINATES);
    }

    const fallback = {
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), LocationConstants.GEOCODING.TIMEOUT_MS);

      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LifeLine/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return fallback;
      }

      const data = await response.json();
      const addr = data?.address || {};

      return {
        formattedAddress: data?.display_name || fallback.formattedAddress,
        street: addr.road || addr.residential || addr.neighbourhood || '',
        city: addr.city || addr.town || addr.village || addr.county || '',
        state: addr.state || '',
        country: addr.country || '',
        postalCode: addr.postcode || '',
      };
    } catch (_error) {
      return fallback;
    }
  }
}
