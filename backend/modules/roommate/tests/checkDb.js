import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Roommate from '../../../models/Roommate.js';
import User from '../../../models/User.js';

dotenv.config();

async function checkDb() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/staymate');
  console.log('Connected.');

  const userCount = await User.countDocuments();
  const roommateCount = await Roommate.countDocuments();
  console.log(`\n--- DATABASE SUMMARY ---`);
  console.log(`Total Users in DB: ${userCount}`);
  console.log(`Total Roommate Profiles in DB: ${roommateCount}`);

  const roommates = await Roommate.find().populate('userId', 'name email');
  console.log(`\n--- ROOMMATE PROFILES LIST ---`);
  roommates.forEach((rm, idx) => {
    console.log(`${idx + 1}. Profile ID: ${rm._id} | User Name: ${rm.userId?.name} | Email: ${rm.userId?.email} | City: ${rm.locationPreferences?.city}`);
  });

  await mongoose.disconnect();
  console.log('\nDisconnected.');
  process.exit(0);
}

checkDb().catch((err) => {
  console.error('Error checking DB:', err.message);
  process.exit(1);
});
