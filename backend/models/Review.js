import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['property', 'owner', 'roommate'],
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Context Target References
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    roommateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Interaction Gating References
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisitRequest',
      index: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoommateRequest',
      index: true,
    },
    
    // Star Ratings
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Extensible Category Ratings
    ratings: {
      type: Map,
      of: Number,
      default: {},
    },
    
    // Content details
    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
      }
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    recommend: {
      type: Boolean,
    },
    
    // Helpful upvoting
    votes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['helpful', 'unhelpful'] },
      }
    ],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    
    // Threaded reply
    reply: {
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, trim: true, maxlength: 1000 },
      createdAt: { type: Date },
    },
    
    // Moderation
    status: {
      type: String,
      enum: ['active', 'flagged', 'hidden', 'soft_deleted'],
      default: 'active',
      index: true,
    },
    reports: [
      {
        reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, enum: ['spam', 'fake_review', 'abusive_language', 'harassment', 'irrelevant_content', 'other'] },
        explanation: { type: String, required: true },
        status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
        createdAt: { type: Date, default: Date.now },
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Optimize retrieval combinations
reviewSchema.index({ propertyId: 1, status: 1 });
reviewSchema.index({ ownerId: 1, status: 1 });
reviewSchema.index({ roommateId: 1, status: 1 });
reviewSchema.index({ authorId: 1, category: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
