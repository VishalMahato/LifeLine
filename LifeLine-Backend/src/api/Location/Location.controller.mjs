import LocationService from './Location.service.mjs';
import LocationConstants from './Location.constants.mjs';

/**
 * LocationController - API handlers for Location operations.
 */
export default class LocationController {
  static async createLocation(req, res) {
    try {
      const locationData = {
        ...req.body,
        userId: req.user?.userId || req.body.userId,
      };

      const location = await LocationService.createLocation(locationData);

      res.status(201).json({
        success: true,
        message: LocationConstants.MESSAGES.SUCCESS.LOCATION_CREATED,
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async createLocationFromCoordinates(req, res) {
    try {
      const locationData = {
        ...req.body,
        userId: req.user?.userId || req.body.userId,
      };

      const location = await LocationService.createLocationFromCoordinates(locationData);

      res.status(201).json({
        success: true,
        message: 'Location created from coordinates',
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getLocation(req, res) {
    try {
      const location = await LocationService.getLocationById(req.params.id);

      res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getUserLocations(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const locations = await LocationService.getLocationsByUserId(userId);

      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateLocation(req, res) {
    try {
      const location = await LocationService.updateLocation(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: LocationConstants.MESSAGES.SUCCESS.LOCATION_UPDATED,
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateLocationAddress(req, res) {
    try {
      const location = await LocationService.updateLocationAddress(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Address updated',
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateCurrentLocation(req, res) {
    try {
      const userId = req.user?.userId || req.body.userId;
      const location = await LocationService.updateCurrentLocation(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Current location updated',
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async searchNearbyLocations(req, res) {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) {
        throw new Error('Latitude and longitude are required');
      }

      const center = {
        lat: Number(lat),
        lng: Number(lng),
      };

      const locations = await LocationService.searchLocationsWithinRadius(
        center,
        Number(radius) || LocationConstants.SEARCH.DEFAULT_DISTANCE_KM,
        {
          placeType: req.query.placeType,
          isVerified: req.query.verified === 'true' ? true : undefined,
        },
      );

      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async searchNearbyHelpers(req, res) {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) {
        throw new Error('Latitude and longitude are required');
      }

      const center = {
        lat: Number(lat),
        lng: Number(lng),
      };

      const helpers = await LocationService.searchNearbyHelpers(
        center,
        Number(radius) || LocationConstants.SEARCH.DEFAULT_DISTANCE_KM,
      );

      res.status(200).json({
        success: true,
        data: helpers,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async searchLocations(req, res) {
    try {
      const result = await LocationService.searchLocations(
        {
          userId: req.query.userId,
          helperId: req.query.helperId,
          placeType: req.query.placeType,
          isVerified: req.query.verified ? req.query.verified === 'true' : undefined,
          city: req.query.city,
          state: req.query.state,
          country: req.query.country,
          isActive: req.query.isActive ? req.query.isActive === 'true' : true,
        },
        {
          page: req.query.page,
          limit: req.query.limit,
          sortBy: req.query.sortBy,
          sortOrder: req.query.sortOrder,
        },
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async verifyLocation(req, res) {
    try {
      const { isVerified } = req.body;
      const location = await LocationService.verifyLocation(req.params.id, isVerified);

      res.status(200).json({
        success: true,
        message: LocationConstants.MESSAGES.SUCCESS.LOCATION_VERIFIED,
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getLocationStats(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const stats = await LocationService.getLocationStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteLocation(req, res) {
    try {
      const deleted = await LocationService.deleteLocation(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: LocationConstants.MESSAGES.ERROR.LOCATION_NOT_FOUND,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Location deleted',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
