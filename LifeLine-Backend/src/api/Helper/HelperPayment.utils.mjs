import mongoose from 'mongoose';
import HelperPayment from './HelperPayment.model.mjs';

const VALID_PAYMENT_STATUSES = new Set(['pending', 'completed', 'failed']);
const VALID_PAYMENT_METHODS = new Set(['bank_transfer', 'upi', 'cash']);

const assertObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }
};

export async function createHelperPayment({
  helperId,
  amount,
  method,
  transactionId,
}) {
  assertObjectId(helperId, 'helperId');

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
    throw new Error('Invalid payment amount');
  }

  if (!VALID_PAYMENT_METHODS.has(method)) {
    throw new Error('Invalid payment method');
  }

  return HelperPayment.create({ helperId, amount, method, transactionId });
}

export async function getHelperPayments(helperId) {
  assertObjectId(helperId, 'helperId');
  return HelperPayment.find({ helperId }).sort({ createdAt: -1 });
}

export async function updateHelperPaymentStatus(paymentId, status) {
  assertObjectId(paymentId, 'paymentId');

  if (!VALID_PAYMENT_STATUSES.has(status)) {
    throw new Error('Invalid payment status');
  }

  const updated = await HelperPayment.findByIdAndUpdate(
    paymentId,
    { status },
    { new: true },
  );

  if (!updated) {
    throw new Error('Payment not found');
  }

  return updated;
}

export async function getHelperPaymentById(paymentId) {
  assertObjectId(paymentId, 'paymentId');
  return HelperPayment.findById(paymentId);
}
