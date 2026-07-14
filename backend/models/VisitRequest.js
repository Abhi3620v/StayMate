import mongoose from 'mongoose';

const visitRequestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g. "14:00" or "02:00 PM"
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'rescheduled'],
      default: 'pending',
      index: true,
    },
    rescheduleReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize compound index
visitRequestSchema.index({ ownerId: 1, status: 1 });
visitRequestSchema.index({ tenantId: 1, status: 1 });

const VisitRequest = mongoose.model('VisitRequest', visitRequestSchema);

export default VisitRequest;
