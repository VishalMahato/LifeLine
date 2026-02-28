import mongoose from 'mongoose';

/**
 * Notification Schema for LifeLine
 * Handles all emergency alerts and system notifications
 * Multi-channel delivery: Push, SMS, Email
 */
const notificationSchema = new mongoose.Schema(
  {
    // Notification Type
    type: {
      type: String,
      enum: [
        'sos_alert', // Emergency SOS triggered
        'helper_request', // Request sent to nearby helper
        'helper_accepted', // Helper accepted the request
        'helper_arriving', // Helper is on the way
        'helper_arrived', // Helper has arrived
        'emergency_resolved', // Emergency has been resolved
        'guardian_alert', // Alert sent to guardian/family
        'blood_request', // Blood donation request
        'status_update', // General status update
        'profile_update', // Profile completion reminder
        'verification', // Verification notifications
        'system', // System notifications
        'community', // Community updates
      ],
      required: true,
      index: true,
    },

    // Priority Level
    priority: {
      type: String,
      enum: ['critical', 'high', 'normal', 'low'],
      default: 'normal',
      index: true,
    },

    // Title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Message Body
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Additional Data (JSON payload)
    data: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Sender Information
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: ['user', 'helper', 'system', 'admin'],
        default: 'system',
      },
    },

    // Recipient Information
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      type: {
        type: String,
        enum: ['user', 'helper', 'guardian'],
        required: true,
      },
    },

    // Delivery Channels
    channels: {
      push: {
        enabled: {
          type: Boolean,
          default: true,
        },
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
          default: 'pending',
        },
        sentAt: {
          type: Date,
        },
        deliveredAt: {
          type: Date,
        },
        readAt: {
          type: Date,
        },
        errorMessage: {
          type: String,
        },
        token: {
          type: String, // FCM/APNS token
        },
      },

      sms: {
        enabled: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'failed'],
          default: 'pending',
        },
        phoneNumber: {
          type: String,
        },
        sentAt: {
          type: Date,
        },
        deliveredAt: {
          type: Date,
        },
        errorMessage: {
          type: String,
        },
        messageId: {
          type: String, // SMS provider message ID
        },
      },

      email: {
        enabled: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'failed', 'opened'],
          default: 'pending',
        },
        email: {
          type: String,
        },
        sentAt: {
          type: Date,
        },
        deliveredAt: {
          type: Date,
        },
        openedAt: {
          type: Date,
        },
        errorMessage: {
          type: String,
        },
      },
    },

    // Retry Logic
    retryCount: {
      type: Number,
      default: 0,
      max: 3,
    },

    maxRetries: {
      type: Number,
      default: 3,
    },

    nextRetryAt: {
      type: Date,
    },

    // Emergency Reference
    emergencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
      index: true,
    },

    // Action Buttons (for interactive notifications)
    actions: [
      {
        label: {
          type: String,
          trim: true,
        },
        action: {
          type: String,
          enum: ['accept', 'decline', 'view', 'navigate', 'call', 'share'],
        },
        url: {
          type: String,
        },
      },
    ],

    // User Interaction
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
    },

    isClicked: {
      type: Boolean,
      default: false,
    },

    clickedAt: {
      type: Date,
    },

    // Notification TTL (Time To Live)
    expiresAt: {
      type: Date,
      index: { expires: 0 }, // Auto-delete after expiration
    },

    // Scheduling
    scheduledFor: {
      type: Date,
      index: true,
    },

    isSent: {
      type: Boolean,
      default: false,
      index: true,
    },

    sentAt: {
      type: Date,
    },

    // Sound & Vibration
    sound: {
      type: String,
      enum: ['default', 'emergency', 'alert', 'none'],
      default: 'default',
    },

    vibrate: {
      type: Boolean,
      default: true,
    },

    // Badge count (for app icon)
    badge: {
      type: Number,
      default: 1,
    },

    // Category (for notification grouping)
    category: {
      type: String,
      enum: ['emergency', 'helper', 'community', 'system', 'other'],
      default: 'other',
    },

    // Image/Icon URL
    imageUrl: {
      type: String,
    },

    iconUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Compound Indexes
notificationSchema.index({ 'recipient.userId': 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1, isSent: 1 });
notificationSchema.index({ emergencyId: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isSent: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = Date.now();
  if (this.channels.push.status === 'delivered') {
    this.channels.push.status = 'read';
    this.channels.push.readAt = Date.now();
  }
  return this.save();
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function () {
  this.isClicked = true;
  this.clickedAt = Date.now();
  if (!this.isRead) {
    this.markAsRead();
  }
  return this.save();
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function (channel, status, additionalData = {}) {
  if (!this.channels[channel]) {
    throw new Error(`Invalid channel: ${channel}`);
  }

  this.channels[channel].status = status;

  if (status === 'sent') {
    this.channels[channel].sentAt = Date.now();
  } else if (status === 'delivered') {
    this.channels[channel].deliveredAt = Date.now();
  } else if (status === 'read' && channel === 'push') {
    this.channels[channel].readAt = Date.now();
  } else if (status === 'opened' && channel === 'email') {
    this.channels[channel].openedAt = Date.now();
  } else if (status === 'failed') {
    this.channels[channel].errorMessage = additionalData.errorMessage || 'Unknown error';
    this.retryCount += 1;
    if (this.retryCount < this.maxRetries) {
      this.nextRetryAt = new Date(Date.now() + Math.pow(2, this.retryCount) * 60000); // Exponential backoff
    }
  }

  return this.save();
};

// Method to check if notification should be retried
notificationSchema.methods.shouldRetry = function () {
  return this.retryCount < this.maxRetries && this.nextRetryAt && this.nextRetryAt <= new Date();
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadForUser = async function (userId) {
  return this.find({
    'recipient.userId': userId,
    isRead: false,
  })
    .sort({ priority: -1, createdAt: -1 })
    .limit(50);
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    'recipient.userId': userId,
    isRead: false,
  });
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsReadForUser = async function (userId) {
  return this.updateMany(
    { 'recipient.userId': userId, isRead: false },
    { isRead: true, readAt: new Date() },
  );
};

// Static method to get pending notifications for sending
notificationSchema.statics.getPendingNotifications = async function () {
  return this.find({
    isSent: false,
    $or: [{ scheduledFor: { $lte: new Date() } }, { scheduledFor: { $exists: false } }],
  }).limit(100);
};

// Pre-save hook
notificationSchema.pre('save', function (next) {
  // Set default expiration (30 days for non-emergency, 7 days for emergency)
  if (!this.expiresAt) {
    const daysToExpire = this.priority === 'critical' ? 7 : 30;
    this.expiresAt = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000);
  }

  // Update isSent based on channel statuses
  if (
    this.channels.push.status !== 'pending' ||
    this.channels.sms.status !== 'pending' ||
    this.channels.email.status !== 'pending'
  ) {
    this.isSent = true;
    if (!this.sentAt) {
      this.sentAt = Date.now();
    }
  }

  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
