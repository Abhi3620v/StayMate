import mongoose from 'mongoose';

const roommateFavoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites
roommateFavoriteSchema.index({ userId: 1, roommateId: 1 }, { unique: true });

const RoommateFavorite = mongoose.model('RoommateFavorite', roommateFavoriteSchema);

export default RoommateFavorite;
