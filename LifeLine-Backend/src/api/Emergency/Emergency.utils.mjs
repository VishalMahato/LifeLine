import EmergencyConstants from './Emergency.constants.mjs';

/**
 * Emergency Utils for LifeLine Emergency Response System
 * Helper functions for emergency processing, validation, and calculations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export class EmergencyUtils {
  /**
   * Validate emergency data
   * @param {Object} data - Emergency data
   * @returns {Object} Validation result
   */
  static validateEmergencyData(data) {
    const errors = [];

    if (!data.type) {
      errors.push({
        field: 'type',
        message: EmergencyConstants.MESSAGES.VALIDATION.TYPE_REQUIRED,
      });
    } else if (!Object.values(EmergencyConstants.EMERGENCY_TYPES).includes(data.type)) {
      errors.push({
        field: 'type',
        message: EmergencyConstants.MESSAGES.VALIDATION.INVALID_TYPE,
      });
    }

    if (!data.title) {
      errors.push({
        field: 'title',
        message: EmergencyConstants.MESSAGES.VALIDATION.TITLE_REQUIRED,
      });
    } else if (data.title.length > 100) {
      errors.push({
        field: 'title',
        message: EmergencyConstants.MESSAGES.VALIDATION.TITLE_TOO_LONG,
      });
    }

    if (!data.description) {
      errors.push({
        field: 'description',
        message: EmergencyConstants.MESSAGES.VALIDATION.DESCRIPTION_REQUIRED,
      });
    } else if (data.description.length > 500) {
      errors.push({
        field: 'description',
        message: EmergencyConstants.MESSAGES.VALIDATION.DESCRIPTION_TOO_LONG,
      });
    }

    if (!data.location || !data.location.coordinates || !data.location.address) {
      errors.push({
        field: 'location',
        message: EmergencyConstants.MESSAGES.VALIDATION.LOCATION_REQUIRED,
      });
    } else {
      const [longitude, latitude] = data.location.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        errors.push({
          field: 'location',
          message: EmergencyConstants.MESSAGES.ERROR.INVALID_LOCATION,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create emergency payload from template
   * @param {string} type - Emergency type
   * @param {Object} customData - Custom emergency data
   * @returns {Object} Emergency payload
   */
  static createEmergencyFromTemplate(type, customData = {}) {
    const template = EmergencyConstants.EMERGENCY_TEMPLATES[type];
    if (!template) {
      throw new Error(`Unsupported emergency type: ${type}`);
    }

    return {
      type,
      title: customData.title || template.title,
      description: customData.description || template.description,
      priority: customData.priority || template.priority,
      ...customData,
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Array} coord1 - [longitude, latitude]
   * @param {Array} coord2 - [longitude, latitude]
   * @returns {number} Distance in meters
   */
  static calculateDistance(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if coordinates are within acceptable accuracy
   * @param {number} accuracy - Location accuracy in meters
   * @returns {boolean} Whether accuracy is acceptable
   */
  static isLocationAccurate(accuracy) {
    return accuracy <= EmergencyConstants.TIMEOUTS.LOCATION_ACCURACY;
  }

  /**
   * Calculate optimal search radius based on emergency type and time
   * @param {string} emergencyType - Type of emergency
   * @param {number} timeElapsed - Time elapsed since emergency in minutes
   * @returns {number} Search radius in meters
   */
  static calculateSearchRadius(emergencyType, timeElapsed = 0) {
    let baseRadius = EmergencyConstants.DISTANCES.DEFAULT_SEARCH_RADIUS;

    // Adjust based on emergency type
    const typeMultipliers = {
      [EmergencyConstants.EMERGENCY_TYPES.MEDICAL]: 1.5,
      [EmergencyConstants.EMERGENCY_TYPES.ACCIDENT]: 1.4,
      [EmergencyConstants.EMERGENCY_TYPES.FIRE]: 1.5,
      [EmergencyConstants.EMERGENCY_TYPES.CRIME]: 1.2,
      [EmergencyConstants.EMERGENCY_TYPES.NATURAL_DISASTER]: 1.5,
      [EmergencyConstants.EMERGENCY_TYPES.OTHER]: 1.0,
    };

    baseRadius *= typeMultipliers[emergencyType] || 1.0;

    // Increase radius over time (expand search area)
    const timeMultiplier = 1 + timeElapsed / 10; // Increase by 10% every minute
    baseRadius *= Math.min(timeMultiplier, 3); // Max 3x increase

    return Math.min(baseRadius, EmergencyConstants.DISTANCES.SEARCH_RADIUS_MAX);
  }

  /**
   * Determine emergency priority based on type and context
   * @param {string} type - Emergency type
   * @param {Object} context - Additional context
   * @returns {string} Priority level
   */
  static determinePriority(type, context = {}) {
    const typePriorities = {
      [EmergencyConstants.EMERGENCY_TYPES.MEDICAL]:
        EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL,
      [EmergencyConstants.EMERGENCY_TYPES.ACCIDENT]:
        EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL,
      [EmergencyConstants.EMERGENCY_TYPES.FIRE]: EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL,
      [EmergencyConstants.EMERGENCY_TYPES.CRIME]: EmergencyConstants.EMERGENCY_PRIORITIES.HIGH,
      [EmergencyConstants.EMERGENCY_TYPES.NATURAL_DISASTER]:
        EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL,
      [EmergencyConstants.EMERGENCY_TYPES.OTHER]: EmergencyConstants.EMERGENCY_PRIORITIES.MEDIUM,
    };

    let priority = typePriorities[type] || EmergencyConstants.EMERGENCY_PRIORITIES.MEDIUM;

    // Adjust based on context
    if (context.isReoccurring) {
      priority = this.escalatePriority(priority);
    }

    if (context.timeSensitive) {
      priority = this.escalatePriority(priority);
    }

    return priority;
  }

  /**
   * Escalate priority level
   * @param {string} currentPriority - Current priority
   * @returns {string} Escalated priority
   */
  static escalatePriority(currentPriority) {
    const escalationMap = {
      [EmergencyConstants.EMERGENCY_PRIORITIES.LOW]: EmergencyConstants.EMERGENCY_PRIORITIES.MEDIUM,
      [EmergencyConstants.EMERGENCY_PRIORITIES.MEDIUM]:
        EmergencyConstants.EMERGENCY_PRIORITIES.HIGH,
      [EmergencyConstants.EMERGENCY_PRIORITIES.HIGH]:
        EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL,
      [EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL]:
        EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL,
    };

    return escalationMap[currentPriority] || currentPriority;
  }

  /**
   * Check if emergency has timed out
   * @param {Date} createdAt - Emergency creation time
   * @param {number} timeoutMinutes - Timeout in minutes
   * @returns {boolean} Whether emergency has timed out
   */
  static hasTimedOut(createdAt, timeoutMinutes = EmergencyConstants.DEFAULTS.TIMEOUT_MINUTES) {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    return Date.now() - createdAt.getTime() > timeoutMs;
  }

  /**
   * Calculate response time metrics
   * @param {Object} responseMetrics - Response metrics from emergency
   * @returns {Object} Calculated metrics
   */
  static calculateResponseMetrics(responseMetrics) {
    const metrics = {
      totalResponseTime: null,
      timeToFirstAssignment: null,
      timeToFirstAcceptance: null,
      timeToFirstArrival: null,
      averageResponseTime: null,
    };

    if (responseMetrics.sosTriggeredAt) {
      const sosTime = responseMetrics.sosTriggeredAt.getTime();

      if (responseMetrics.firstHelperAssignedAt) {
        metrics.timeToFirstAssignment = responseMetrics.firstHelperAssignedAt.getTime() - sosTime;
      }

      if (responseMetrics.firstHelperAcceptedAt) {
        metrics.timeToFirstAcceptance = responseMetrics.firstHelperAcceptedAt.getTime() - sosTime;
      }

      if (responseMetrics.firstHelperArrivedAt) {
        metrics.timeToFirstArrival = responseMetrics.firstHelperArrivedAt.getTime() - sosTime;
      }

      if (responseMetrics.resolvedAt) {
        metrics.totalResponseTime = responseMetrics.resolvedAt.getTime() - sosTime;
      }
    }

    return metrics;
  }

  /**
   * Generate emergency code for tracking
   * @param {string} emergencyId - Emergency ID
   * @returns {string} Emergency code
   */
  static generateEmergencyCode(emergencyId) {
    const timestamp = Date.now().toString(36);
    const shortId = emergencyId.toString().slice(-4);
    return `EM-${timestamp}-${shortId}`.toUpperCase();
  }

  /**
   * Check if emergency requires immediate attention
   * @param {string} priority - Emergency priority
   * @param {string} type - Emergency type
   * @returns {boolean} Whether immediate attention is required
   */
  static requiresImmediateAttention(priority, type) {
    const criticalTypes = [
      EmergencyConstants.EMERGENCY_TYPES.MEDICAL,
      EmergencyConstants.EMERGENCY_TYPES.ACCIDENT,
      EmergencyConstants.EMERGENCY_TYPES.FIRE,
      EmergencyConstants.EMERGENCY_TYPES.CRIME,
    ];

    return (
      priority === EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL || criticalTypes.includes(type)
    );
  }

  /**
   * Get emergency severity score
   * @param {Object} emergency - Emergency object
   * @returns {number} Severity score (0-100)
   */
  static getSeverityScore(emergency) {
    let score = 0;

    // Priority scoring
    const priorityScores = {
      [EmergencyConstants.EMERGENCY_PRIORITIES.CRITICAL]: 100,
      [EmergencyConstants.EMERGENCY_PRIORITIES.HIGH]: 75,
      [EmergencyConstants.EMERGENCY_PRIORITIES.MEDIUM]: 50,
      [EmergencyConstants.EMERGENCY_PRIORITIES.LOW]: 25,
    };
    score += priorityScores[emergency.priority] || 0;

    // Type scoring
    const typeScores = {
      [EmergencyConstants.EMERGENCY_TYPES.MEDICAL]: 20,
      [EmergencyConstants.EMERGENCY_TYPES.ACCIDENT]: 20,
      [EmergencyConstants.EMERGENCY_TYPES.FIRE]: 20,
      [EmergencyConstants.EMERGENCY_TYPES.CRIME]: 15,
      [EmergencyConstants.EMERGENCY_TYPES.NATURAL_DISASTER]: 25,
    };
    score += typeScores[emergency.type] || 0;

    // Time factor (higher score for more recent emergencies)
    const hoursElapsed = (Date.now() - emergency.createdAt.getTime()) / (1000 * 60 * 60);
    const timeBonus = Math.max(0, 10 - hoursElapsed);
    score += timeBonus;

    return Math.min(score, 100);
  }

  /**
   * Format emergency location for display
   * @param {Object} location - Location object
   * @returns {string} Formatted location string
   */
  static formatLocation(location) {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);

    return parts.join(', ');
  }

  /**
   * Create emergency summary for notifications
   * @param {Object} emergency - Emergency object
   * @returns {string} Emergency summary
   */
  static createEmergencySummary(emergency) {
    const location = this.formatLocation(emergency.location);
    return `${emergency.title}: ${emergency.description} at ${location}`;
  }
}

export default EmergencyUtils;
