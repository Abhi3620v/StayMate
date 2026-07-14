import mongoose from 'mongoose';

const roommateReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roommateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roommate',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['Spam', 'Fake Profile', 'Harassment', 'Inappropriate Information', 'Duplicate Profile', 'Other'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const RoommateReport = mongoose.model('RoommateReport', roommateReportSchema);

export default RoommateReport;
