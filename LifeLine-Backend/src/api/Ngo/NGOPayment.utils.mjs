import mongoose from 'mongoose';
import NGOPayment from './NGOPayment.model.mjs';

const VALID_PAYMENT_STATUSES = new Set(['pending', 'completed', 'failed']);
const VALID_PAYMENT_METHODS = new Set(['bank_transfer', 'upi', 'cash']);

const assertObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }
};

export async function createNGOPayment({
  ngoId,
  amount,
  method,
  transactionId,
}) {
  assertObjectId(ngoId, 'ngoId');

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
    throw new Error('Invalid payment amount');
  }

  if (!VALID_PAYMENT_METHODS.has(method)) {
    throw new Error('Invalid payment method');
  }

  return NGOPayment.create({ ngoId, amount, method, transactionId });
}

export async function getNGOPayments(ngoId) {
  assertObjectId(ngoId, 'ngoId');
  return NGOPayment.find({ ngoId }).sort({ createdAt: -1 });
}

export async function updateNGOPaymentStatus(paymentId, status) {
  assertObjectId(paymentId, 'paymentId');

  if (!VALID_PAYMENT_STATUSES.has(status)) {
    throw new Error('Invalid payment status');
  }

  const updated = await NGOPayment.findByIdAndUpdate(
    paymentId,
    { status },
    { new: true },
  );

  if (!updated) {
    throw new Error('Payment not found');
  }

  return updated;
}

export async function getNGOPaymentById(paymentId) {
  assertObjectId(paymentId, 'paymentId');
  return NGOPayment.findById(paymentId);
}
