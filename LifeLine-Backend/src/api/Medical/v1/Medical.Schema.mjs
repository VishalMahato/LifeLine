import mongoose from 'mongoose';

/**
 * Medical Schema for LifeLine
 * Comprehensive medical profile for emergency response
 * CRITICAL: Only visible to verified helpers during active SOS
 */
const medicalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Basic Medical Info
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
      index: true,
    },

    // Allergies (CRITICAL for emergency treatment)
    allergies: [
      {
        substance: {
          type: String,
          required: true,
          trim: true,
        },
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe', 'life_threatening'],
          default: 'moderate',
        },
        reaction: {
          type: String,
          trim: true,
        },
        discoveredDate: {
          type: Date,
        },
      },
    ],

    // Chronic Conditions
    conditions: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        diagnosisDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ['active', 'inactive', 'resolved', 'chronic'],
          default: 'active',
        },
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe', 'critical'],
          default: 'moderate',
        },
        treatedBy: {
          type: String,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: 300,
        },
      },
    ],

    // Current Medications
    medications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        dosage: {
          type: String,
          trim: true,
        },
        frequency: {
          type: String,
          enum: [
            'as_needed',
            'daily',
            'twice_daily',
            'three_times_daily',
            'four_times_daily',
            'weekly',
            'monthly',
          ],
          default: 'daily',
        },
        prescribedBy: {
          type: String,
          trim: true,
        },
        prescriptionDate: {
          type: Date,
        },
        startDate: {
          type: Date,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        purpose: {
          type: String,
          trim: true,
        },
      },
    ],

    // Physical Measurements (critical for drug dosing)
    height: {
      value: {
        type: Number,
        min: 50, // cm
        max: 250,
      },
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm',
      },
    },

    weight: {
      value: {
        type: Number,
        min: 10, // kg
        max: 300,
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
      lastUpdated: {
        type: Date,
      },
    },

    // Age/DOB
    dateOfBirth: {
      type: Date,
    },

    // Previous Surgeries
    surgeries: [
      {
        name: {
          type: String,
          trim: true,
        },
        date: {
          type: Date,
        },
        hospital: {
          type: String,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],

    // Immunizations
    vaccinations: [
      {
        name: {
          type: String,
          trim: true,
        },
        date: {
          type: Date,
        },
        nextDue: {
          type: Date,
        },
      },
    ],

    // Physical Disabilities
    disabilities: {
      type: String,
      trim: true,
    },

    // Emergency Contact Consent
    emergencyContactConsent: {
      type: Boolean,
      default: true,
    },

    // Emergency Contacts (managed separately via API)
    emergencyContacts: [
      {
        fullName: {
          type: String,
          required: true,
          trim: true,
        },
        relation: {
          type: String,
          required: true,
          trim: true,
        },
        phoneNumber: {
          type: String,
          required: true,
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Organ Donor Status
    organDonor: {
      type: Boolean,
      default: false,
    },

    // Blood Donation
    bloodDonation: {
      isEligible: {
        type: Boolean,
        default: true,
      },
      lastDonated: {
        type: Date,
      },
      willingToDonate: {
        type: Boolean,
        default: false,
      },
    },

    // Insurance Information
    insurance: {
      provider: {
        type: String,
        trim: true,
      },
      policyNumber: {
        type: String,
        trim: true,
      },
      groupNumber: {
        type: String,
        trim: true,
      },
      expiryDate: {
        type: Date,
      },
    },

    // Additional Medical Notes
    notes: {
      type: String,
      maxlength: [1000, 'Medical notes cannot exceed 1000 characters'],
    },

    // Privacy Settings
    visibleDuringEmergency: {
      type: Boolean,
      default: true,
    },

    // Emergency Info (Object for additional details)
    emergencyInfo: {
      notificationPreferences: [String],
      preferredHospital: String,
      primaryLanguage: String,
    },

    // Last Updated
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Profile Completion
    isComplete: {
      type: Boolean,
      default: false,
    },

    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
medicalSchema.index({
  'bloodDonation.willingToDonate': 1,
  'bloodDonation.isEligible': 1,
});

// Method to calculate age
medicalSchema.methods.getAge = function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Method to check if medical profile is critical (has life-threatening conditions)
medicalSchema.methods.hasCriticalConditions = function () {
  return (
    this.allergies.some((a) => a.severity === 'life_threatening') ||
    this.conditions.some((c) => c.severity === 'critical')
  );
};

// Method to get active medications
medicalSchema.methods.getActiveMedications = function () {
  return this.medications.filter((med) => med.isActive);
};

// Method to calculate profile completion percentage
medicalSchema.methods.calculateCompletion = function () {
  const fields = [
    this.bloodType !== 'Unknown',
    Array.isArray(this.allergies) && this.allergies.length > 0,
    Array.isArray(this.conditions) && this.conditions.length > 0,
    Array.isArray(this.medications) && this.medications.length > 0,
    this.height && this.height.value,
    this.weight && this.weight.value,
    this.dateOfBirth,
    this.primaryDoctor && this.primaryDoctor.name,
    this.insurance && this.insurance.provider,
  ];

  const completedFields = fields.filter(Boolean).length;
  this.completionPercentage = Math.round((completedFields / fields.length) * 100);
  this.isComplete = this.completionPercentage >= 70;

  return this.completionPercentage;
};

// Pre-save hook to calculate completion
medicalSchema.pre('save', function () {
  this.calculateCompletion();
  this.lastUpdated = Date.now();
});

// Static method to find blood donors by type
medicalSchema.statics.findBloodDonors = async function (bloodType, location) {
  return this.find({
    bloodType: bloodType,
    'bloodDonation.willingToDonate': true,
    'bloodDonation.isEligible': true,
  }).populate('userId');
};

const Medical = mongoose.model('Medical', medicalSchema);

export default Medical;
