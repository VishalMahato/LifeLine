import mongoose from 'mongoose';
import AuthConstants from './Auth.constants.mjs';

/**
 * Auth Model - Core authentication schema for LifeLine
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
const authSchema = new mongoose.Schema(
  {
    // Basic Profile Information
    name: {
      type: String,
      required: [true, AuthConstants.MESSAGES.VALIDATION.NAME_REQUIRED],
      trim: true,
      minlength: [2, AuthConstants.MESSAGES.VALIDATION.NAME_TOO_SHORT],
      maxlength: [50, AuthConstants.MESSAGES.VALIDATION.NAME_TOO_LONG],
    },

    email: {
      type: String,
      required: [true, AuthConstants.MESSAGES.VALIDATION.EMAIL_REQUIRED],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, AuthConstants.MESSAGES.VALIDATION.EMAIL_INVALID],
    },

    phoneNumber: {
      type: String,
      required: [true, AuthConstants.MESSAGES.VALIDATION.PHONE_REQUIRED],
      unique: true,
      trim: true,
      match: [/^[+]?[\d\s\-()]+$/, AuthConstants.MESSAGES.VALIDATION.PHONE_INVALID],
    },

    profileImage: {
      type: String,
      default: null,
    },

    // Authentication
    password: {
      type: String,
      required: function() {
        // Password is required for login, but not for initial signup
        return this.isVerified === true;
      },
    },

    role: {
      type: String,
      enum: [AuthConstants.ROLES.USER, AuthConstants.ROLES.HELPER],
      required: [true, AuthConstants.MESSAGES.VALIDATION.ROLE_REQUIRED],
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    // Email Verification
    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    // Password Reset
    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    // Social Login
    socialProvider: {
      type: String,
      enum: [AuthConstants.SOCIAL_PROVIDERS.GOOGLE, AuthConstants.SOCIAL_PROVIDERS.APPLE],
    },

    socialId: {
      type: String,
    },

    // References to related documents
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Helper',
    },

    // Login tracking
    lastLogin: {
      type: Date,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
authSchema.index({ email: 1 }, { unique: true });
authSchema.index({ phoneNumber: 1 }, { unique: true });
authSchema.index({ emailVerificationToken: 1 });
authSchema.index({ passwordResetToken: 1 });
authSchema.index({ role: 1 });

// Virtual for account lock status
authSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
authSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Import AuthUtils here to avoid circular dependency
    const { default: AuthUtils } = await import('./Auth.utils.mjs');
    this.password = await AuthUtils.hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
authSchema.methods = {
  /**
   * Compare password for authentication
   * @param {string} candidatePassword
   * @returns {Promise<boolean>}
   */
  comparePassword: async function(candidatePassword) {
    const { default: AuthUtils } = await import('./Auth.utils.mjs');
    return AuthUtils.comparePassword(candidatePassword, this.password);
  },

  /**
   * Increment login attempts
   */
  incLoginAttempts: function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({
        $unset: { lockUntil: 1 },
        $set: { loginAttempts: 1 }
      });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
      updates.$set = {
        lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
      };
    }

    return this.updateOne(updates);
  },

  /**
   * Reset login attempts on successful login
   */
  resetLoginAttempts: function() {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 },
      $set: { lastLogin: new Date() }
    });
  },

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken: async function() {
    const { default: AuthUtils } = await import('./Auth.utils.mjs');
    const { token, expiresAt } = AuthUtils.generateEmailVerificationToken(this._id);

    this.emailVerificationToken = token;
    this.emailVerificationExpires = expiresAt;

    return token;
  },

  /**
   * Generate password reset token
   */
  generatePasswordResetToken: async function() {
    const { default: AuthUtils } = await import('./Auth.utils.mjs');
    const { token, expiresAt } = AuthUtils.generatePasswordResetToken(this._id);

    this.passwordResetToken = token;
    this.passwordResetExpires = expiresAt;

    return token;
  }
};

// Static methods
authSchema.statics = {
  /**
   * Find user for authentication
   * @param {string} email
   * @returns {Promise<Object>}
   */
  findForAuth: function(email) {
    return this.findOne({ email: email.toLowerCase() });
  },

  /**
   * Find user by verification token
   * @param {string} token
   * @returns {Promise<Object>}
   */
  findByVerificationToken: function(token) {
    return this.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
  },

  /**
   * Find user by password reset token
   * @param {string} token
   * @returns {Promise<Object>}
   */
  findByPasswordResetToken: function(token) {
    return this.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
  }
};

const Auth = mongoose.model('Auth', authSchema);

export default Auth;

