import mongoose from 'mongoose';

const ChannelToggleSchema = new mongoose.Schema(
  {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false }, // Reserved for future expansion
  },
  { _id: false }
);

const NotificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Category settings mapping channel toggles
    categories: {
      property: { type: ChannelToggleSchema, default: () => ({}) },
      roommate: { type: ChannelToggleSchema, default: () => ({}) },
      visit: { type: ChannelToggleSchema, default: () => ({}) },
      chat: { type: ChannelToggleSchema, default: () => ({}) },
      review: { type: ChannelToggleSchema, default: () => ({}) },
      security: { type: ChannelToggleSchema, default: () => ({}) }, // critical logs
      announcements: { type: ChannelToggleSchema, default: () => ({}) }, // system broadcasts
    },
  },
  {
    timestamps: true,
  }
);

const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model('NotificationPreference', NotificationPreferenceSchema);
export default NotificationPreference;
