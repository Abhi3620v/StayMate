import mongoose from 'mongoose';

const roommateRecentViewSchema = new mongoose.Schema(
  {
    userId: {
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
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same viewer-viewee relation by updating viewedAt
roommateRecentViewSchema.index({ userId: 1, roommateId: 1 }, { unique: true });

const RoommateRecentView = mongoose.model('RoommateRecentView', roommateRecentViewSchema);

export default RoommateRecentView;
