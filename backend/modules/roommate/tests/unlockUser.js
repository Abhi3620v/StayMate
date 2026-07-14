import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../../../models/User.js';

dotenv.config();

async function unlockUser() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/staymate');
  console.log('Connected.');

  const email = 'vikram@staymate.com';
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`User ${email} not found!`);
  } else {
    // 1. Reset lock attributes
    user.failedAttempts = 0;
    user.lockExpiration = undefined;
    
    // 2. Set password to password123 to trigger save hook and hash it correctly
    user.password = 'password123';
    await user.save();

    console.log(`\n--- USER UNLOCKED & RESET ---`);
    console.log(`Email: ${user.email}`);
    console.log(`Failed Attempts Reset to: ${user.failedAttempts}`);
    console.log(`Lock Expiration Reset to: ${user.lockExpiration || 'None (Unlocked)'}`);
    
    // 3. Verify comparePassword works
    const isMatch = await user.comparePassword('password123');
    console.log(`Verification: Does password 'password123' match in DB? ${isMatch ? '✅ YES!' : '❌ NO'}`);
  }

  await mongoose.disconnect();
  console.log('\nDisconnected.');
  process.exit(0);
}

unlockUser().catch((err) => {
  console.error('Error unlocking user:', err.message);
  process.exit(1);
});
