import mongoose from 'mongoose';

/**
 * Emergency Schema for LifeLine Emergency Response System
 * Handles emergency incidents, SOS alerts, and helper coordination
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
const emergencySchema = new mongoose.Schema(
  {
    // Emergency Type
    type: {
      type: String,
      enum: [
        'medical', // Medical emergency
        'accident', // Road accident
        'fire', // Fire emergency
        'crime', // Crime in progress
        'natural_disaster', // Earthquake, flood, etc.
        'other', // Other emergencies
      ],
      required: true,
      default: 'medical',
    },

    // Emergency Status
    status: {
      type: String,
      enum: [
        'active', // Emergency is ongoing
        'resolved', // Emergency has been resolved
        'cancelled', // Emergency was cancelled
        'timeout', // Emergency timed out
      ],
      default: 'active',
    },

    // Priority Level
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'high',
    },

    // Location Information
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: String,
      state: String,
      country: String,
      zipCode: String,
      accuracy: Number, // Location accuracy in meters
      provider: {
        type: String,
        enum: ['gps', 'network', 'manual'],
        default: 'gps',
      },
    },

    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
      index: true,
    },

    // Emergency Details
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Medical Information (if applicable)
    medicalInfo: {
      bloodType: String,
      allergies: [String],
      medicalConditions: [String],
      medications: [String],
      emergencyContacts: [
        {
          name: String,
          phoneNumber: String,
          relationship: String,
        },
      ],
    },

    // Helper Assignments
    assignedHelpers: [
      {
        helperId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Auth',
        },
        status: {
          type: String,
          enum: ['requested', 'accepted', 'arriving', 'arrived', 'completed'],
          default: 'requested',
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        acceptedAt: Date,
        arrivedAt: Date,
        completedAt: Date,
        notes: String,
      },
    ],

    // Response Metrics
    responseMetrics: {
      sosTriggeredAt: {
        type: Date,
        default: Date.now,
      },
      firstHelperAssignedAt: Date,
      firstHelperAcceptedAt: Date,
      firstHelperArrivedAt: Date,
      resolvedAt: Date,
      totalHelpersRequested: {
        type: Number,
        default: 0,
      },
      totalHelpersAccepted: {
        type: Number,
        default: 0,
      },
      totalHelpersArrived: {
        type: Number,
        default: 0,
      },
    },

    // Communication Log
    communicationLog: [
      {
        type: {
          type: String,
          enum: [
            'sos_sent',
            'helper_requested',
            'helper_accepted',
            'helper_arrived',
            'status_update',
            'message',
          ],
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        actor: {
          userId: mongoose.Schema.Types.ObjectId,
          type: {
            type: String,
            enum: ['user', 'helper', 'system'],
          },
        },
      },
    ],

    // Emergency Settings
    settings: {
      autoAssignHelpers: {
        type: Boolean,
        default: true,
      },
      maxHelpers: {
        type: Number,
        default: 3,
      },
      searchRadius: {
        type: Number, // in meters
        default: 5000,
      },
      timeoutMinutes: {
        type: Number,
        default: 30,
      },
      notifyGuardians: {
        type: Boolean,
        default: true,
      },
    },

    // Resolution Details
    resolution: {
      resolvedBy: {
        userId: mongoose.Schema.Types.ObjectId,
        type: String, // 'user', 'helper', 'system'
      },
      resolutionType: {
        type: String,
        enum: ['completed', 'cancelled', 'timeout', 'no_helpers'],
      },
      notes: String,
      resolvedAt: Date,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
    },

    // Metadata
    tags: [String],
    isTest: {
      type: Boolean,
      default: false,
    },

    // Expiration
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      },
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
emergencySchema.index({ 'location.coordinates': '2dsphere' });
emergencySchema.index({ userId: 1, status: 1, createdAt: -1 });
emergencySchema.index({ status: 1, priority: 1, createdAt: -1 });
emergencySchema.index({ 'assignedHelpers.helperId': 1, status: 1 });

// Virtual for duration
emergencySchema.virtual('duration').get(function () {
  if (this.responseMetrics?.resolvedAt && this.responseMetrics?.sosTriggeredAt) {
    return (
      this.responseMetrics.resolvedAt.getTime() - this.responseMetrics.sosTriggeredAt.getTime()
    );
  }
  if (!this.responseMetrics?.sosTriggeredAt) {
    return null;
  }
  return Date.now() - this.responseMetrics.sosTriggeredAt.getTime();
});

// Virtual for active helpers count
emergencySchema.virtual('activeHelpersCount').get(function () {
  return this.assignedHelpers.filter((helper) =>
    ['accepted', 'arriving', 'arrived'].includes(helper.status),
  ).length;
});

// Method to assign helper
emergencySchema.methods.assignHelper = function (helperId) {
  const existingAssignment = this.assignedHelpers.find(
    (helper) => helper.helperId.toString() === helperId.toString(),
  );

  if (existingAssignment) {
    return existingAssignment;
  }

  const assignment = {
    helperId,
    status: 'requested',
    assignedAt: new Date(),
  };

  this.assignedHelpers.push(assignment);
  if (!this.responseMetrics.firstHelperAssignedAt) {
    this.responseMetrics.firstHelperAssignedAt = assignment.assignedAt;
  }
  this.responseMetrics.totalHelpersRequested += 1;

  return assignment;
};

// Method to accept helper assignment
emergencySchema.methods.acceptHelper = function (helperId) {
  const assignment = this.assignedHelpers.find(
    (helper) => helper.helperId.toString() === helperId.toString(),
  );

  if (assignment && assignment.status === 'requested') {
    assignment.status = 'accepted';
    assignment.acceptedAt = new Date();

    if (!this.responseMetrics.firstHelperAcceptedAt) {
      this.responseMetrics.firstHelperAcceptedAt = new Date();
    }

    this.responseMetrics.totalHelpersAccepted += 1;
    this.addToCommunicationLog('helper_accepted', `Helper ${helperId} accepted the request`, {
      userId: helperId,
      type: 'helper',
    });
  }

  return assignment;
};

// Method to mark helper as arrived
emergencySchema.methods.helperArrived = function (helperId) {
  const assignment = this.assignedHelpers.find(
    (helper) => helper.helperId.toString() === helperId.toString(),
  );

  if (assignment && ['accepted', 'arriving'].includes(assignment.status)) {
    assignment.status = 'arrived';
    assignment.arrivedAt = new Date();

    if (!this.responseMetrics.firstHelperArrivedAt) {
      this.responseMetrics.firstHelperArrivedAt = new Date();
    }

    this.responseMetrics.totalHelpersArrived += 1;
    this.addToCommunicationLog('helper_arrived', `Helper ${helperId} arrived at location`, {
      userId: helperId,
      type: 'helper',
    });
  }

  return assignment;
};

// Method to resolve emergency
emergencySchema.methods.resolve = function (resolvedBy, resolutionType = 'completed', notes = '') {
  const resolvedAt = new Date();
  this.status = 'resolved';
  this.resolution = {
    resolvedBy,
    resolutionType,
    notes,
    resolvedAt,
  };
  this.responseMetrics.resolvedAt = resolvedAt;

  this.addToCommunicationLog('status_update', `Emergency resolved: ${resolutionType}`, {
    userId: resolvedBy.userId,
    type: resolvedBy.type,
  });
};

// Method to add to communication log
emergencySchema.methods.addToCommunicationLog = function (type, message, actor) {
  this.communicationLog.push({
    type,
    message,
    actor,
    timestamp: new Date(),
  });
};

// Static method to find nearby emergencies
emergencySchema.statics.findNearby = function (
  longitude,
  latitude,
  maxDistance = 5000,
  status = 'active',
) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    status: status,
  });
};

// Static method to get emergency statistics
emergencySchema.statics.getStatistics = async function (startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEmergencies: { $sum: 1 },
        resolvedEmergencies: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
        activeEmergencies: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
        averageResponseTime: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $ne: ['$responseMetrics.sosTriggeredAt', null] },
                  { $ne: ['$responseMetrics.resolvedAt', null] },
                ],
              },
              {
                $subtract: ['$responseMetrics.resolvedAt', '$responseMetrics.sosTriggeredAt'],
              },
              null,
            ],
          },
        },
        byType: {
          $push: '$type',
        },
        byPriority: {
          $push: '$priority',
        },
      },
    },
  ]);
};

// Pre-save middleware
emergencySchema.pre('save', function (next) {
  // Update response metrics
  this.responseMetrics.totalHelpersRequested = this.assignedHelpers.length;
  this.responseMetrics.totalHelpersAccepted = this.assignedHelpers.filter(
    (helper) => helper.status !== 'requested',
  ).length;
  this.responseMetrics.totalHelpersArrived = this.assignedHelpers.filter(
    (helper) => helper.status === 'arrived',
  ).length;

  next();
});

const Emergency = mongoose.model('Emergency', emergencySchema);

export default Emergency;
