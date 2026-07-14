import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['property', 'roommate', 'visit'],
      required: true,
    },
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contextRef',
    },
    contextRef: {
      type: String,
      required: true,
      enum: ['Property', 'RoommateProfile', 'VisitRequest', 'User'], // fallback to User if context is direct
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique conversations of a specific type for participants
ConversationSchema.index({ type: 1, participants: 1 });

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;
