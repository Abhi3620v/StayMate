import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Prevents accidental output of password hash
    },
    role: {
      type: String,
      enum: ['guest', 'tenant', 'owner', 'moderator', 'admin'],
      default: 'tenant',
    },
    status: {
      type: String,
      enum: [
        'email_verification_pending',
        'pending_verification',
        'active',
        'inactive',
        'suspended',
        'blocked',
        'deleted',
      ],
      default: 'email_verification_pending',
    },
    customPermissions: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: '',
    },
    authVersion: {
      type: Number,
      default: 1, // Incremented on password reset/change to revoke old tokens
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedAttempt: Date,
    lockExpiration: Date,
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
