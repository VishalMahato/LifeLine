import mongoose from 'mongoose';

/**
 * User Schema for LifeLine
 * Stores user information, emergency contacts, and medical details
 */
const userSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },

    emergencyContacts: [
      {
        name: {
          type: String,
          required: [true, 'Emergency contact name is required'],
          trim: true,
        },
        relationship: {
          type: String,
          enum: ['parent', 'spouse', 'sibling', 'child', 'friend', 'other'],
          required: true,
        },
        phoneNumber: {
          type: String,
          required: [true, 'Emergency contact phone number is required'],
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    medicalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medical',
    },

    // Reference to Auth
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Indexes for better query performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ authId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
