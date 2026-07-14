import mongoose from 'mongoose';

const trustedDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      default: 'Unknown Device',
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    operatingSystem: {
      type: String,
      default: 'Unknown OS',
    },
    fingerprint: {
      type: String,
      required: true,
      index: true,
    },
    trustedStatus: {
      type: String,
      enum: ['trusted', 'pending'],
      default: 'pending',
      index: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for easy lookups
trustedDeviceSchema.index({ userId: 1, fingerprint: 1 }, { unique: true });

const TrustedDevice = mongoose.model('TrustedDevice', trustedDeviceSchema);

export default TrustedDevice;
