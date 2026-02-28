import mongoose from 'mongoose';

const authSchema = new mongoose.Schema(
  {
    // Profile settings
    profileImage: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[+]?[\d\s\-()]+$/, 'Please enter a valid phone number'],
    },
    role: {
      type: String,
      enum: ['user', 'helper'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Helper',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Auth = mongoose.model('Auth', authSchema);

export default Auth;
