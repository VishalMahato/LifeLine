import mongoose from 'mongoose';

const helperPaymentSchema = new mongoose.Schema(
  {
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Helper',
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

helperPaymentSchema.index({ helperId: 1, createdAt: -1 });

const HelperPayment = mongoose.model('HelperPayment', helperPaymentSchema);

export default HelperPayment;
