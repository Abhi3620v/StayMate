import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notificationType: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['auth', 'property', 'visit', 'roommate', 'chat', 'review', 'admin'],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    icon: {
      type: String,
      default: '',
    },
    referenceType: {
      type: String,
      default: '',
    },
    referenceId: {
      type: String,
      default: '',
    },
    actionUrl: {
      type: String,
      default: '',
    },
    readStatus: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedStatus: {
      type: Boolean,
      default: false,
      index: true,
    },
    softDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimized recipient queues fetching
NotificationSchema.index({ recipientId: 1, readStatus: 1, archivedStatus: 1, softDeleted: 1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
