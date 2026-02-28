import Emergency from './Emergency.model.mjs';
import EmergencyConstants from './Emergency.constants.mjs';
import EmergencyUtils from './Emergency.utils.mjs';

/**
 * Emergency Service for LifeLine Emergency Response System
 * Handles emergency creation, helper assignment, and resolution
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export class EmergencyService {
  /**
   * Create a new emergency
   * @param {Object} emergencyData - Emergency data
   * @param {string} userId - User who triggered the emergency
   * @returns {Promise<Object>} Created emergency
   */
  static async createEmergency(emergencyData, userId) {
    try {
      // Validate emergency data
      const validation = EmergencyUtils.validateEmergencyData(emergencyData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
      }

      // Create emergency object
      const emergency = new Emergency({
        ...emergencyData,
        userId,
        status: EmergencyConstants.EMERGENCY_STATUSES.ACTIVE,
        priority: emergencyData.priority || EmergencyUtils.determinePriority(emergencyData.type),
        responseMetrics: {
          sosTriggeredAt: new Date(),
        },
      });

      // Add to communication log
      emergency.addToCommunicationLog(
        EmergencyConstants.COMMUNICATION_LOG_TYPES.SOS_SENT,
        'Emergency SOS triggered',
        { userId, type: EmergencyConstants.ACTOR_TYPES.USER },
      );

      await emergency.save();

      return {
        success: true,
        message: EmergencyConstants.MESSAGES.SUCCESS.EMERGENCY_CREATED,
        data: emergency,
      };
    } catch (error) {
      throw new Error(`Failed to create emergency: ${error.message}`);
    }
  }

  /**
   * Trigger SOS emergency
   * @param {Object} sosData - SOS emergency data
   * @param {string} userId - User who triggered SOS
   * @returns {Promise<Object>} Emergency response with notifications
   */
  static async triggerSOS(sosData, userId) {
    try {
      const emergencyData = {
        type: EmergencyConstants.EMERGENCY_TYPES.MEDICAL,
        title: sosData.title || 'SOS Emergency Alert',
        description: sosData.message || 'Emergency SOS triggered - immediate assistance required',
        location: sosData.location,
        priority: EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL,
        medicalInfo: sosData.medicalInfo || {},
        settings: {
          autoAssignHelpers: true,
          notifyGuardians: true,
          ...sosData.settings,
        },
      };

      // Create emergency
      const emergencyResult = await this.createEmergency(emergencyData, userId);
      const emergency = emergencyResult.data;

      // Auto-assign helpers if enabled
      if (emergency.settings.autoAssignHelpers) {
        await this.assignNearbyHelpers(emergency._id);
      }

      // Send notifications
      const notifications = await this.sendEmergencyNotifications(emergency);

      return {
        success: true,
        message: EmergencyConstants.MESSAGES.SUCCESS.SOS_TRIGGERED,
        data: {
          emergency,
          notificationsSent: notifications.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to trigger SOS: ${error.message}`);
    }
  }

  /**
   * Assign nearby helpers to emergency
   * @param {string} emergencyId - Emergency ID
   * @returns {Promise<Array>} Assigned helpers
   */
  static async assignNearbyHelpers(emergencyId) {
    try {
      const emergency = await Emergency.findById(emergencyId);
      if (!emergency) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.EMERGENCY_NOT_FOUND);
      }

      const [longitude, latitude] = emergency.location.coordinates;
      const searchRadius = EmergencyUtils.calculateSearchRadius(emergency.type);

      // Find nearby available helpers
      // Note: This would integrate with Helper service to find available helpers
      const nearbyHelpers = await this.findNearbyAvailableHelpers(
        longitude,
        latitude,
        searchRadius,
        emergency.settings.maxHelpers,
      );

      const assignedHelpers = [];

      for (const helper of nearbyHelpers) {
        try {
          const assignment = emergency.assignHelper(helper._id);
          assignedHelpers.push(assignment);

          // Send notification to helper
          await this.sendHelperRequestNotification(emergency, helper);
        } catch (error) {
          console.error(`Failed to assign helper ${helper._id}:`, error);
        }
      }

      await emergency.save();

      return assignedHelpers;
    } catch (error) {
      throw new Error(`Failed to assign helpers: ${error.message}`);
    }
  }

  /**
   * Accept helper request
   * @param {string} emergencyId - Emergency ID
   * @param {string} helperId - Helper ID
   * @returns {Promise<Object>} Acceptance result
   */
  static async acceptHelperRequest(emergencyId, helperId) {
    try {
      const emergency = await Emergency.findById(emergencyId);
      if (!emergency) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.EMERGENCY_NOT_FOUND);
      }

      if (emergency.status !== EmergencyConstants.EMERGENCY_STATUSES.ACTIVE) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.EMERGENCY_ALREADY_RESOLVED);
      }

      const assignment = emergency.acceptHelper(helperId);
      if (!assignment) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.HELPER_ALREADY_ASSIGNED);
      }

      await emergency.save();

      // Send notifications
      await this.sendHelperAcceptedNotifications(emergency, helperId);

      return {
        success: true,
        message: EmergencyConstants.MESSAGES.SUCCESS.HELPER_ACCEPTED,
        data: assignment,
      };
    } catch (error) {
      throw new Error(`Failed to accept helper request: ${error.message}`);
    }
  }

  /**
   * Mark helper as arrived
   * @param {string} emergencyId - Emergency ID
   * @param {string} helperId - Helper ID
   * @returns {Promise<Object>} Arrival result
   */
  static async markHelperArrived(emergencyId, helperId) {
    try {
      const emergency = await Emergency.findById(emergencyId);
      if (!emergency) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.EMERGENCY_NOT_FOUND);
      }

      const assignment = emergency.helperArrived(helperId);
      if (!assignment) {
        throw new Error('Helper not assigned to this emergency');
      }

      await emergency.save();

      // Send notifications
      await this.sendHelperArrivedNotifications(emergency, helperId);

      return {
        success: true,
        message: 'Helper marked as arrived',
        data: assignment,
      };
    } catch (error) {
      throw new Error(`Failed to mark helper arrived: ${error.message}`);
    }
  }

  /**
   * Resolve emergency
   * @param {string} emergencyId - Emergency ID
   * @param {Object} resolutionData - Resolution data
   * @param {string} resolvedBy - User who resolved
   * @returns {Promise<Object>} Resolution result
   */
  static async resolveEmergency(emergencyId, resolutionData, resolvedBy) {
    try {
      const emergency = await Emergency.findById(emergencyId);
      if (!emergency) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.EMERGENCY_NOT_FOUND);
      }

      emergency.resolve(
        resolvedBy,
        resolutionData.resolutionType || EmergencyConstants.RESOLUTION_TYPES.COMPLETED,
        resolutionData.notes,
      );

      if (resolutionData.rating) {
        emergency.resolution.rating = resolutionData.rating;
        emergency.resolution.feedback = resolutionData.feedback;
      }

      await emergency.save();

      // Send resolution notifications
      await this.sendEmergencyResolvedNotifications(emergency);

      return {
        success: true,
        message: EmergencyConstants.MESSAGES.SUCCESS.EMERGENCY_RESOLVED,
        data: emergency,
      };
    } catch (error) {
      throw new Error(`Failed to resolve emergency: ${error.message}`);
    }
  }

  /**
   * Get emergency by ID
   * @param {string} emergencyId - Emergency ID
   * @param {string} userId - User requesting access
   * @param {string} userRole - Requesting user's role
   * @returns {Promise<Object>} Emergency data
   */
  static async getEmergency(emergencyId, userId, userRole = null) {
    try {
      const emergency = await Emergency.findById(emergencyId)
        .populate('userId', 'name email phoneNumber')
        .populate('assignedHelpers.helperId', 'name email phoneNumber');

      if (!emergency) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.EMERGENCY_NOT_FOUND);
      }

      // Check if user has access (owner, assigned helper, or admin)
      const hasAccess = this.checkEmergencyAccess(emergency, userId, userRole);
      if (!hasAccess) {
        throw new Error(EmergencyConstants.MESSAGES.ERROR.UNAUTHORIZED);
      }

      return {
        success: true,
        data: emergency,
      };
    } catch (error) {
      throw new Error(`Failed to get emergency: ${error.message}`);
    }
  }

  /**
   * Get user's emergencies
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} User's emergencies
   */
  static async getUserEmergencies(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      const emergencies = await Emergency.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 20)
        .skip(filters.offset || 0);

      return {
        success: true,
        data: emergencies,
      };
    } catch (error) {
      throw new Error(`Failed to get user emergencies: ${error.message}`);
    }
  }

  /**
   * Get nearby emergencies (for helpers)
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} radius - Search radius in meters
   * @param {string} helperId - Helper ID (to exclude own emergencies)
   * @returns {Promise<Array>} Nearby emergencies
   */
  static async getNearbyEmergencies(longitude, latitude, radius = 5000, helperId) {
    try {
      const emergencies = await Emergency.findNearby(longitude, latitude, radius);

      // Filter out emergencies where helper is already assigned or is the owner
      const filteredEmergencies = emergencies.filter((emergency) => {
        const normalizedHelperId = String(helperId);
        const isOwner = String(emergency.userId) === normalizedHelperId;
        const isAssigned = emergency.assignedHelpers.some(
          (assignment) => String(assignment.helperId) === normalizedHelperId,
        );
        return !isOwner && !isAssigned;
      });

      return {
        success: true,
        data: filteredEmergencies,
      };
    } catch (error) {
      throw new Error(`Failed to get nearby emergencies: ${error.message}`);
    }
  }

  /**
   * Get emergency statistics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Statistics
   */
  static async getEmergencyStatistics(startDate, endDate) {
    try {
      const stats = await Emergency.getStatistics(startDate, endDate);

      return {
        success: true,
        data: stats[0] || {
          totalEmergencies: 0,
          resolvedEmergencies: 0,
          activeEmergencies: 0,
          averageResponseTime: 0,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  // Helper methods

  /**
   * Find nearby available helpers
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} radius - Search radius
   * @param {number} limit - Maximum helpers to return
   * @returns {Promise<Array>} Available helpers
   */
  static async findNearbyAvailableHelpers(longitude, latitude, radius, limit) {
    // This would integrate with Helper service
    // For now, return mock data
    return [];
  }

  /**
   * Send emergency notifications
   * @param {Object} emergency - Emergency object
   * @returns {Promise<Array>} Sent notifications
   */
  static async sendEmergencyNotifications(emergency) {
    // This would integrate with Notification service
    // For now, return mock data
    return [];
  }

  /**
   * Send helper request notification
   * @param {Object} emergency - Emergency object
   * @param {Object} helper - Helper object
   * @returns {Promise<Object>} Notification result
   */
  static async sendHelperRequestNotification(emergency, helper) {
    // This would integrate with Notification service
    return {};
  }

  /**
   * Send helper accepted notifications
   * @param {Object} emergency - Emergency object
   * @param {string} helperId - Helper ID
   * @returns {Promise<Array>} Sent notifications
   */
  static async sendHelperAcceptedNotifications(emergency, helperId) {
    // This would integrate with Notification service
    return [];
  }

  /**
   * Send helper arrived notifications
   * @param {Object} emergency - Emergency object
   * @param {string} helperId - Helper ID
   * @returns {Promise<Array>} Sent notifications
   */
  static async sendHelperArrivedNotifications(emergency, helperId) {
    // This would integrate with Notification service
    return [];
  }

  /**
   * Send emergency resolved notifications
   * @param {Object} emergency - Emergency object
   * @returns {Promise<Array>} Sent notifications
   */
  static async sendEmergencyResolvedNotifications(emergency) {
    // This would integrate with Notification service
    return [];
  }

  /**
   * Check if user has access to emergency
   * @param {Object} emergency - Emergency object
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {boolean} Access granted
   */
  static checkEmergencyAccess(emergency, userId, userRole = null) {
    const normalizedUserId = String(userId);
    const ownerId = String(emergency.userId?._id || emergency.userId);

    if (userRole === 'admin') {
      return true;
    }

    // Owner has access
    if (ownerId === normalizedUserId) {
      return true;
    }

    // Assigned helpers have access
    const isAssignedHelper = emergency.assignedHelpers.some(
      (assignment) => String(assignment.helperId?._id || assignment.helperId) === normalizedUserId,
    );
    if (isAssignedHelper) {
      return true;
    }

    return false;
  }
}

export default EmergencyService;
