/**
 * Emergency Constants for LifeLine Emergency Response System
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

export const EMERGENCY_TYPES = {
  MEDICAL: 'medical',
  ACCIDENT: 'accident',
  FIRE: 'fire',
  CRIME: 'crime',
  NATURAL_DISASTER: 'natural_disaster',
  OTHER: 'other',
};

export const EMERGENCY_STATUSES = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
};

export const EMERGENCY_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const HELPER_ASSIGNMENT_STATUSES = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  ARRIVING: 'arriving',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
};

export const COMMUNICATION_LOG_TYPES = {
  SOS_SENT: 'sos_sent',
  HELPER_REQUESTED: 'helper_requested',
  HELPER_ACCEPTED: 'helper_accepted',
  HELPER_ARRIVED: 'helper_arrived',
  STATUS_UPDATE: 'status_update',
  MESSAGE: 'message',
};

export const RESOLUTION_TYPES = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  NO_HELPERS: 'no_helpers',
};

export const LOCATION_PROVIDERS = {
  GPS: 'gps',
  NETWORK: 'network',
  MANUAL: 'manual',
};

export const ACTOR_TYPES = {
  USER: 'user',
  HELPER: 'helper',
  SYSTEM: 'system',
};

export const MESSAGES = {
  VALIDATION: {
    TYPE_REQUIRED: 'Emergency type is required',
    TITLE_REQUIRED: 'Emergency title is required',
    DESCRIPTION_REQUIRED: 'Emergency description is required',
    LOCATION_REQUIRED: 'Location information is required',
    INVALID_TYPE: 'Invalid emergency type',
    INVALID_STATUS: 'Invalid emergency status',
    INVALID_PRIORITY: 'Invalid emergency priority',
    TITLE_TOO_LONG: 'Title must be less than 100 characters',
    DESCRIPTION_TOO_LONG: 'Description must be less than 500 characters',
  },
  SUCCESS: {
    EMERGENCY_CREATED: 'Emergency alert created successfully',
    EMERGENCY_RESOLVED: 'Emergency resolved successfully',
    HELPER_ASSIGNED: 'Helper assigned successfully',
    HELPER_ACCEPTED: 'Helper request accepted',
    SOS_TRIGGERED: 'SOS emergency triggered successfully',
  },
  ERROR: {
    EMERGENCY_NOT_FOUND: 'Emergency not found',
    UNAUTHORIZED: 'Unauthorized to access this emergency',
    HELPER_ALREADY_ASSIGNED: 'Helper already assigned to this emergency',
    EMERGENCY_ALREADY_RESOLVED: 'Emergency is already resolved',
    NO_HELPERS_AVAILABLE: 'No helpers available in the area',
    INVALID_LOCATION: 'Invalid location coordinates',
  },
};

export const DEFAULTS = {
  TYPE: EMERGENCY_TYPES.MEDICAL,
  STATUS: EMERGENCY_STATUSES.ACTIVE,
  PRIORITY: EMERGENCY_PRIORITIES.HIGH,
  MAX_HELPERS: 3,
  SEARCH_RADIUS: 5000, // 5km
  TIMEOUT_MINUTES: 30,
  AUTO_ASSIGN_HELPERS: true,
  NOTIFY_GUARDIANS: true,
  EXPIRATION_HOURS: 24,
};

export const TIMEOUTS = {
  HELPER_RESPONSE: 5 * 60 * 1000, // 5 minutes for helper to respond
  EMERGENCY_TIMEOUT: 30 * 60 * 1000, // 30 minutes total emergency timeout
  LOCATION_ACCURACY: 100, // 100 meters acceptable accuracy
};

export const DISTANCES = {
  SEARCH_RADIUS_MIN: 1000, // 1km minimum search radius
  SEARCH_RADIUS_MAX: 50000, // 50km maximum search radius
  DEFAULT_SEARCH_RADIUS: 5000, // 5km default
};

export const RATE_LIMITS = {
  SOS_TRIGGER: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 3, // Max 3 SOS triggers per minute
  },
  EMERGENCY_UPDATE: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10,
  },
  HELPER_RESPONSE: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 5,
  },
};

export const NOTIFICATION_TRIGGERS = {
  SOS_TRIGGERED: 'sos_alert',
  HELPER_ASSIGNED: 'helper_request',
  HELPER_ACCEPTED: 'helper_accepted',
  HELPER_ARRIVING: 'helper_arriving',
  HELPER_ARRIVED: 'helper_arrived',
  EMERGENCY_RESOLVED: 'emergency_resolved',
  GUARDIAN_ALERT: 'guardian_alert',
};

export const EMERGENCY_TEMPLATES = {
  MEDICAL: {
    title: 'Medical Emergency',
    description: 'Medical emergency requiring immediate assistance',
    priority: EMERGENCY_PRIORITIES.CRITICAL,
  },
  ACCIDENT: {
    title: 'Road Accident',
    description: 'Road accident requiring emergency response',
    priority: EMERGENCY_PRIORITIES.CRITICAL,
  },
  FIRE: {
    title: 'Fire Emergency',
    description: 'Fire emergency requiring immediate response',
    priority: EMERGENCY_PRIORITIES.CRITICAL,
  },
  CRIME: {
    title: 'Crime in Progress',
    description: 'Crime in progress requiring law enforcement',
    priority: EMERGENCY_PRIORITIES.HIGH,
  },
  NATURAL_DISASTER: {
    title: 'Natural Disaster',
    description: 'Natural disaster requiring emergency response',
    priority: EMERGENCY_PRIORITIES.CRITICAL,
  },
};

export const RESPONSE_TIME_TARGETS = {
  CRITICAL: 5 * 60 * 1000, // 5 minutes
  HIGH: 10 * 60 * 1000, // 10 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LOW: 30 * 60 * 1000, // 30 minutes
};

const EmergencyConstants = {
  EMERGENCY_TYPES,
  EMERGENCY_STATUSES,
  EMERGENCY_PRIORITIES,
  HELPER_ASSIGNMENT_STATUSES,
  COMMUNICATION_LOG_TYPES,
  RESOLUTION_TYPES,
  LOCATION_PROVIDERS,
  ACTOR_TYPES,
  MESSAGES,
  DEFAULTS,
  TIMEOUTS,
  DISTANCES,
  RATE_LIMITS,
  NOTIFICATION_TRIGGERS,
  EMERGENCY_TEMPLATES,
  RESPONSE_TIME_TARGETS,
};

export default EmergencyConstants;
