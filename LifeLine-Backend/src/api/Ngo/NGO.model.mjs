import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    serviceType: {
      type: [String],
      required: true,
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
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
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    documents: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

ngoSchema.index({ 'location.coordinates': '2dsphere' });

const NGO = mongoose.model('NGO', ngoSchema);

export default NGO;
