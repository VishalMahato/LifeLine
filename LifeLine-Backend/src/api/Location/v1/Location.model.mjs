import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },

    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function (coords) {
          // Longitude: -180 to 180, Latitude: -90 to 90
          return (
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90
          );
        },
        message: 'Invalid coordinates. Format: [longitude, latitude]',
      },
    },

    address: {
      type: String,
      trim: true,
    },

    street: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: 'India',
    },

    zipCode: {
      type: String,
      trim: true,
    },

    // Building/Floor information (critical for emergencies)
    buildingName: {
      type: String,
      trim: true,
    },

    floor: {
      type: String,
      trim: true,
    },

    apartmentUnit: {
      type: String,
      trim: true,
    },

    // Landmark for easier identification
    landmark: {
      type: String,
      trim: true,
    },

    // Place type
    placeType: {
      type: String,
      enum: ['home', 'work', 'hospital', 'public', 'other', 'unknown'],
      default: 'unknown',
    },

    // GPS Accuracy (in meters) - CRITICAL for emergency response
    accuracy: {
      type: Number,
      min: 0,
      max: 10000, // Max 10km accuracy
    },

    // Altitude (meters above sea level)
    altitude: {
      type: Number,
      default: null,
    },

    altitudeAccuracy: {
      type: Number,
      default: null,
    },

    // Speed (m/s) - useful if person is moving (in vehicle)
    speed: {
      type: Number,
      min: 0,
      default: null,
    },

    // Heading (degrees, 0-360) - direction of movement
    heading: {
      type: Number,
      min: 0,
      max: 360,
      default: null,
    },

    // Location provider
    provider: {
      type: String,
      enum: ['gps', 'network', 'manual', 'wifi', 'unknown'],
      default: 'unknown',
    },

    // Emergency access notes (e.g., "Gate code: 1234", "Back entrance accessible")
    emergencyAccessNotes: {
      type: String,
      trim: true,
      maxlength: [300, 'Emergency access notes cannot exceed 300 characters'],
    },

    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    // Location metadata
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Helper',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Location history tracking
    source: {
      type: String,
      enum: ['app', 'sos', 'background', 'manual'],
      default: 'app',
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for better query performance
locationSchema.index({ coordinates: '2dsphere' });
locationSchema.index({ userId: 1, isActive: 1 });
locationSchema.index({ helperId: 1, isActive: 1 });
locationSchema.index({ city: 1, state: 1 });
locationSchema.index({ lastUpdated: -1 });

// Partial unique index to ensure one active location per helper
locationSchema.index(
  { helperId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      helperId: { $type: 'objectId' },
      isActive: true,
    },
  },
);

// Pre-save validation ensuring helper exists before saving
locationSchema.pre('save', async function () {
  if (this.isModified('helperId') && this.helperId) {
    const Helper = mongoose.model('Helper');
    const helperExists = await Helper.exists({ _id: this.helperId });
    if (!helperExists) {
      throw new Error(`Referential integrity error: Helper ${this.helperId} does not exist`);
    }
  }
});

// Method to calculate distance to another location (in meters)
locationSchema.methods.distanceTo = function (otherLocation) {
  const [lon1, lat1] = this.coordinates;
  const [lon2, lat2] = otherLocation.coordinates;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Method to check if location is stale (older than specified minutes)
locationSchema.methods.isStale = function (minutes = 5) {
  const now = new Date();
  const diffMinutes = (now - this.lastUpdated) / (1000 * 60);
  return diffMinutes > minutes;
};

// Method to verify location
locationSchema.methods.verify = function () {
  this.isVerified = true;
  this.verifiedAt = Date.now();
  return this.save();
};

// Static method to find locations near a point
locationSchema.statics.findNearby = async function (longitude, latitude, maxDistance = 5000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance, // in meters
      },
    },
    isActive: true,
  });
};

const Location = mongoose.model('Location', locationSchema);

export default Location;
