import mongoose from 'mongoose';

const roommateRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active/inactive requests between the same users
roommateRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const RoommateRequest = mongoose.model('RoommateRequest', roommateRequestSchema);

export default RoommateRequest;
