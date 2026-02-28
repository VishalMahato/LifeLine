import EmergencyService from './Emergency.service.mjs';
import EmergencyConstants from './Emergency.constants.mjs';

/**
 * Emergency Controller for LifeLine Emergency Response System
 * Handles HTTP requests for emergency operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export class EmergencyController {
  /**
   * Trigger SOS emergency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async triggerSOS(req, res) {
    try {
      const userId = req.user.userId;
      const sosData = {
        title: req.body.title,
        message: req.body.message,
        location: {
          coordinates: [req.body.longitude, req.body.latitude],
          address: req.body.address,
          accuracy: req.body.accuracy,
          provider: req.body.provider || 'gps',
        },
        medicalInfo: req.body.medicalInfo,
        settings: req.body.settings,
      };

      const result = await EmergencyService.triggerSOS(sosData, userId);

      res.status(201).json(result);
    } catch (error) {
      console.error('SOS trigger error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger SOS emergency',
        error: error.message,
      });
    }
  }

  /**
   * Create emergency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createEmergency(req, res) {
    try {
      const userId = req.user.userId;
      const emergencyData = req.body;

      const result = await EmergencyService.createEmergency(emergencyData, userId);

      res.status(201).json(result);
    } catch (error) {
      console.error('Create emergency error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create emergency',
        error: error.message,
      });
    }
  }

  /**
   * Get emergency by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getEmergency(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const result = await EmergencyService.getEmergency(id, userId, userRole);

      res.json(result);
    } catch (error) {
      console.error('Get emergency error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to get emergency',
        error: error.message,
      });
    }
  }

  /**
   * Get user's emergencies
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserEmergencies(req, res) {
    try {
      const userId = req.user.userId;
      const filters = {
        status: req.query.status,
        type: req.query.type,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
      };

      const result = await EmergencyService.getUserEmergencies(userId, filters);

      res.json(result);
    } catch (error) {
      console.error('Get user emergencies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get emergencies',
        error: error.message,
      });
    }
  }

  /**
   * Get nearby emergencies (for helpers)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getNearbyEmergencies(req, res) {
    try {
      const { latitude, longitude, radius } = req.query;
      const helperId = req.user.userId;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const result = await EmergencyService.getNearbyEmergencies(
        parseFloat(longitude),
        parseFloat(latitude),
        parseFloat(radius) || 5000,
        helperId,
      );

      res.json(result);
    } catch (error) {
      console.error('Get nearby emergencies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get nearby emergencies',
        error: error.message,
      });
    }
  }

  /**
   * Accept helper request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async acceptHelperRequest(req, res) {
    try {
      const { id } = req.params;
      const helperId = req.user.userId;

      const result = await EmergencyService.acceptHelperRequest(id, helperId);

      res.json(result);
    } catch (error) {
      console.error('Accept helper request error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to accept helper request',
        error: error.message,
      });
    }
  }

  /**
   * Mark helper as arrived
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async markHelperArrived(req, res) {
    try {
      const { id } = req.params;
      const helperId = req.user.userId;

      const result = await EmergencyService.markHelperArrived(id, helperId);

      res.json(result);
    } catch (error) {
      console.error('Mark helper arrived error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to mark helper as arrived',
        error: error.message,
      });
    }
  }

  /**
   * Resolve emergency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async resolveEmergency(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const resolutionData = req.body;

      const resolvedBy = {
        userId,
        type: req.user.role === 'helper' ? 'helper' : 'user',
      };

      const result = await EmergencyService.resolveEmergency(id, resolutionData, resolvedBy);

      res.json(result);
    } catch (error) {
      console.error('Resolve emergency error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to resolve emergency',
        error: error.message,
      });
    }
  }

  /**
   * Update emergency status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateEmergency(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;
      const userRole = req.user.role;

      // Get emergency first to check access
      const emergencyResult = await EmergencyService.getEmergency(id, userId, userRole);
      if (!emergencyResult.success) {
        return res.status(403).json(emergencyResult);
      }

      // For now, only allow status updates
      // In a full implementation, this would be more comprehensive
      if (
        updateData.status &&
        updateData.status === EmergencyConstants.EMERGENCY_STATUSES.CANCELLED
      ) {
        const resolutionData = {
          resolutionType: EmergencyConstants.RESOLUTION_TYPES.CANCELLED,
          notes: updateData.cancellationReason || 'Emergency cancelled by user',
        };

        const result = await EmergencyService.resolveEmergency(id, resolutionData, {
          userId,
          type: 'user',
        });

        return res.json(result);
      }

      res.status(400).json({
        success: false,
        message: 'Invalid update operation',
      });
    } catch (error) {
      console.error('Update emergency error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update emergency',
        error: error.message,
      });
    }
  }

  /**
   * Get emergency statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const result = await EmergencyService.getEmergencyStatistics(start, end);

      res.json(result);
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message,
      });
    }
  }

  /**
   * Send SOS alert (alternative endpoint for notifications integration)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async sendSOSAlert(req, res) {
    try {
      const userId = req.user.userId;
      const alertData = {
        userId,
        emergencyId: req.body.emergencyId,
        location: req.body.location,
        message: req.body.message,
        channels: req.body.channels || {
          push: true,
          sms: true,
          email: false,
        },
      };

      // This would integrate with Notification service
      // For now, trigger the SOS emergency
      const result = await EmergencyService.triggerSOS(
        {
          title: 'SOS Emergency Alert',
          message: alertData.message || 'Emergency SOS triggered - immediate assistance required',
          location: alertData.location,
        },
        userId,
      );

      res.status(201).json({
        success: true,
        message: 'SOS alert sent successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Send SOS alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send SOS alert',
        error: error.message,
      });
    }
  }

  /**
   * Send helper request (alternative endpoint for notifications integration)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async sendHelperRequest(req, res) {
    try {
      const { emergencyId, helperIds } = req.body;

      // Assign helpers to emergency
      await EmergencyService.assignNearbyHelpers(emergencyId);

      // This would integrate with Notification service to send to specific helpers
      // For now, just return success
      res.json({
        success: true,
        message: 'Helper request sent successfully',
        data: {
          emergencyId,
          helpersRequested: helperIds?.length || 0,
        },
      });
    } catch (error) {
      console.error('Send helper request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send helper request',
        error: error.message,
      });
    }
  }
}

export default EmergencyController;
