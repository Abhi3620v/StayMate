import mongoose from 'mongoose';

const roommateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    basicInfo: {
      occupation: {
        type: String,
        enum: ['student', 'professional'],
        required: true,
      },
      collegeOrCompany: {
        type: String,
        required: true,
        trim: true,
      },
      age: {
        type: Number,
        required: true,
        min: 18,
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
        index: true,
      },
      bio: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },
    },
    lifestyle: {
      sleepingSchedule: {
        type: String,
        enum: ['early_bird', 'night_owl', 'flexible'],
        required: true,
      },
      wakeUpTime: {
        type: String,
        required: true,
      },
      foodPreference: {
        type: String,
        enum: ['veg', 'non-veg', 'any'],
        required: true,
      },
      smoking: {
        type: Boolean,
        required: true,
      },
      drinking: {
        type: Boolean,
        required: true,
      },
      pets: {
        type: Boolean,
        required: true,
      },
      guests: {
        type: Boolean,
        required: true,
      },
      cleanliness: {
        type: String,
        enum: ['high', 'moderate', 'low'],
        required: true,
      },
      noisePreference: {
        type: String,
        enum: ['quiet', 'moderate', 'loud'],
        required: true,
      },
      studyEnvironment: {
        type: String,
        enum: ['quiet', 'group', 'flexible'],
        required: true,
      },
      workFromHome: {
        type: Boolean,
        required: true,
      },
      socialLifestyle: {
        type: String,
        enum: ['introvert', 'extrovert', 'moderate'],
        required: true,
      },
    },
    budget: {
      monthlyRent: {
        type: Number,
        required: true,
        min: 0,
        index: true,
      },
      securityDeposit: {
        type: Number,
        required: true,
        min: 0,
      },
      propertyType: {
        type: String,
        enum: ['apartment', 'flat', 'pg', 'hostel', 'independent_house', 'villa', 'studio', 'room', 'any'],
        required: true,
      },
      listingType: {
        type: String,
        enum: ['rent', 'lease', 'shared', 'any'],
        required: true,
      },
    },
    locationPreferences: {
      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      area: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      maxDistance: {
        type: Number,
        default: 10,
        min: 0,
      },
    },
    languagesSpoken: [
      {
        type: String,
        trim: true,
      },
    ],
    hobbies: [
      {
        type: String,
        trim: true,
      },
    ],
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    moveInDate: {
      type: Date,
      required: true,
      index: true,
    },
    maxRoommates: {
      type: Number,
      default: 1,
      min: 1,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'only_logged_in'],
      default: 'public',
      index: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Optimize queries combining location and budget constraints
roommateSchema.index({ 'locationPreferences.city': 1, 'budget.monthlyRent': 1 });

const Roommate = mongoose.model('Roommate', roommateSchema);

export default Roommate;
