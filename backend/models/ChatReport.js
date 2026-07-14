import mongoose from 'mongoose';

const ChatReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'abuse', 'scam', 'other'],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatReport = mongoose.model('ChatReport', ChatReportSchema);
export default ChatReport;
