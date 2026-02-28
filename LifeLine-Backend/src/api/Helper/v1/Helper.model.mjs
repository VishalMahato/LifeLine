import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema(
  {
    skills: [
      {
        type: String,
        enum: [
          'CPR Certified',
          'First Aid',
          'Doctor',
          'Nurse',
          'EMT/Paramedic',
          'Firefighter',
          'Police Officer',
          'Other',
        ],
      },
    ],

    profession: {
      type: String,
      trim: true,
    },

    credentials: [
      {
        type: {
          type: String,
          enum: ['medical_license', 'certification', 'id_proof', 'other'],
        },
        documentUrl: {
          type: String, // S3 URL or file path
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        verifiedAt: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
      },
    ],

    // Availability
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      workingHours: {
        start: {
          type: String, // "09:00"
        },
        end: {
          type: String, // "17:00"
        },
      },
      daysAvailable: [
        {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
      ],
    },

    // Pricing
    isPaid: {
      type: Boolean,
      default: false,
    },

    amount: {
      type: Number,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    // Performance Metrics
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    responseTime: {
      type: Number, // Average response time in seconds
      default: 0,
    },

    totalHelps: {
      type: Number,
      default: 0,
    },

    successRate: {
      type: Number, // Percentage
      min: 0,
      max: 100,
      default: 100,
    },

    // Badges & Achievements
    badges: [
      {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'diamond', 'hero'],
      },
    ],

    impactPoints: {
      type: Number,
      default: 0,
    },

    // Location Reference
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },

    // Reference to Auth
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },

    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
helperSchema.index({ authId: 1 });
helperSchema.index({ isAvailable: 1, isVerified: 1 });
helperSchema.index({ rating: -1 });
helperSchema.index({ locationId: 1 });

const Helper = mongoose.model('Helper', helperSchema);

export default Helper;
