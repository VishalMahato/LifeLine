import mongoose from 'mongoose';

const ngoPaymentSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cash'],
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

ngoPaymentSchema.index({ ngoId: 1, createdAt: -1 });

const NGOPayment = mongoose.model('NGOPayment', ngoPaymentSchema);

export default NGOPayment;
