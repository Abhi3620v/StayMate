import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Establishes connection to MongoDB Atlas database
 */
const connectDB = async () => {
  // Disable Mongoose query buffering so operations fail immediately if database is offline
  mongoose.set('bufferCommands', false);

  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ [Database Warning] MONGODB_URI is not defined in environment variables. Database features will be unavailable.');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed or update default demo accounts individually to avoid duplicate key violations
    const demoAccounts = [
      {
        name: 'Demo Tenant',
        email: 'tenant@staymate.com',
        role: 'tenant',
        status: 'active',
        authVersion: 1
      },
      {
        name: 'Demo Owner',
        email: 'owner@staymate.com',
        role: 'owner',
        status: 'active',
        authVersion: 1
      },
      {
        name: 'Demo Admin',
        email: 'admin@staymate.com',
        role: 'admin',
        status: 'active',
        authVersion: 1
      }
    ];

    for (const acc of demoAccounts) {
      const existingUser = await User.findOne({ email: acc.email });
      if (!existingUser) {
        console.log(`🌱 [Database Seeding] Creating demo user: ${acc.email}`);
        const newUser = new User({
          ...acc,
          password: 'password123',
          failedAttempts: 0,
          lockExpiration: null,
          status: 'active'
        });
        await newUser.save();
      } else {
        // Overwrite password and reset lockouts in development to guarantee login success
        console.log(`🌱 [Database Seeding] Resetting password & lock status for: ${acc.email}`);
        existingUser.password = 'password123';
        existingUser.failedAttempts = 0;
        existingUser.lockExpiration = null;
        existingUser.status = 'active';
        await existingUser.save();
      }
    }
    console.log('✅ [Database Seeding] Default demo accounts synchronized successfully!');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In production, database failure should be fatal. In development, allow the API to boot for preview.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
