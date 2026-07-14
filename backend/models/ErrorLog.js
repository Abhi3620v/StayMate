import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    module: {
      type: String,
      required: true,
      index: true, // e.g. 'auth', 'property', 'reviews', 'platform'
    },
    route: {
      type: String,
      index: true,
    },
    method: {
      type: String,
    },
    statusCode: {
      type: Number,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: false,
    },
    ipAddress: {
      type: String,
      default: 'Unknown IP',
    },
    userAgent: {
      type: String,
      default: 'Unknown Agent',
    },
    environment: {
      type: String,
      default: process.env.NODE_ENV || 'production',
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire logs older than 14 days
errorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 1209600 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export default ErrorLog;
