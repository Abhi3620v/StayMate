import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentGatewayId: {
      type: String,
      index: true,
      required: false,
    },
    orderId: {
      type: String,
      index: true,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    paymentType: {
      type: String,
      enum: ['booking_deposit', 'reservation_fee', 'application_fee', 'service_fee', 'security_deposit', 'rent'],
      required: true,
    },
    gateway: {
      type: String,
      default: 'razorpay',
    },
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'completed', 'failed', 'cancelled', 'refunded', 'expired'],
      default: 'pending',
      index: true,
    },
    method: {
      type: String, // e.g. card, upi, netbanking, wallet
      default: 'unknown',
    },
    invoiceId: {
      type: String,
      required: false,
    },
    receiptNumber: {
      type: String,
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast history queries
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ ownerId: 1, status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
