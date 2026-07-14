import mongoose from 'mongoose';

const performanceMetricSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number, // In milliseconds
      required: true,
    },
    dbQueryTime: {
      type: Number, // In milliseconds (optional)
      default: 0,
    },
    cacheHit: {
      type: Boolean,
      default: false,
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

// Auto-expire logs older than 7 days to keep database clean in production
performanceMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);

export default PerformanceMetric;
