import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Roommate from '../../../models/Roommate.js';
import RoommateFavorite from '../../../models/RoommateFavorite.js';
import RoommateRecentView from '../../../models/RoommateRecentView.js';
import RoommateReport from '../../../models/RoommateReport.js';
import User from '../../../models/User.js';
import { mockUsers } from '../../../config/inMemoryDb.js';
import {
  mockRoommates,
  mockRoommateFavorites,
  mockRoommateRecentViews,
  mockRoommateReports,
} from './roommateMockDb.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

class RoommateRepository {
  async create(data) {
    if (isDbConnected()) {
      const roommate = new Roommate(data);
      await roommate.save();
      return await Roommate.findById(roommate._id).populate('userId', 'name email avatar');
    } else {
      const userObj = mockUsers.find((u) => String(u._id) === String(data.userId));
      const mockRm = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        userId: userObj || { _id: data.userId, name: 'Mock User', avatar: '' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRoommates.push(mockRm);
      return mockRm;
    }
  }

  async findByUserId(userId) {
    if (isDbConnected()) {
      return await Roommate.findOne({ userId }).populate('userId', 'name email avatar');
    } else {
      const rm = mockRoommates.find((r) => String(r.userId._id || r.userId) === String(userId));
      return rm || null;
    }
  }

  async findById(id) {
    if (isDbConnected()) {
      return await Roommate.findById(id).populate('userId', 'name email avatar');
    } else {
      const rm = mockRoommates.find((r) => String(r._id) === String(id));
      return rm || null;
    }
  }

  async update(userId, data) {
    if (isDbConnected()) {
      return await Roommate.findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, runValidators: true }
      ).populate('userId', 'name email avatar');
    } else {
      const idx = mockRoommates.findIndex((r) => String(r.userId._id || r.userId) === String(userId));
      if (idx === -1) return null;
      mockRoommates[idx] = {
        ...mockRoommates[idx],
        ...data,
        updatedAt: new Date(),
      };
      return mockRoommates[idx];
    }
  }

  async delete(userId) {
    if (isDbConnected()) {
      return await Roommate.findOneAndDelete({ userId });
    } else {
      const idx = mockRoommates.findIndex((r) => String(r.userId._id || r.userId) === String(userId));
      if (idx === -1) return null;
      const deleted = mockRoommates[idx];
      mockRoommates.splice(idx, 1);
      return deleted;
    }
  }

  async find(filters = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit = 20, skip = 0 } = options;

    if (isDbConnected()) {
      return await Roommate.find(filters)
        .populate('userId', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } else {
      let results = [...mockRoommates];

      // Simple mock filtering
      if (filters['basicInfo.gender']) {
        results = results.filter((r) => r.basicInfo.gender === filters['basicInfo.gender']);
      }
      if (filters['basicInfo.occupation']) {
        results = results.filter((r) => r.basicInfo.occupation === filters['basicInfo.occupation']);
      }
      if (filters['locationPreferences.city']) {
        const cityQuery = filters['locationPreferences.city'];
        if (cityQuery && cityQuery.$regex instanceof RegExp) {
          results = results.filter((r) => cityQuery.$regex.test(r.locationPreferences.city));
        } else if (typeof cityQuery === 'string') {
          results = results.filter((r) => r.locationPreferences.city.toLowerCase() === cityQuery.toLowerCase());
        }
      }
      if (filters['budget.monthlyRent']) {
        const rentQuery = filters['budget.monthlyRent'];
        if (rentQuery.$lte) {
          results = results.filter((r) => r.budget.monthlyRent <= rentQuery.$lte);
        }
      }
      if (filters.userId) {
        const uQuery = filters.userId;
        if (uQuery && uQuery.$ne) {
          results = results.filter((r) => String(r.userId._id || r.userId) !== String(uQuery.$ne));
        }
      }
      if (filters.visibility) {
        const vis = filters.visibility;
        if (vis && Array.isArray(vis.$in)) {
          results = results.filter((r) => vis.$in.includes(r.visibility));
        } else if (typeof vis === 'string') {
          results = results.filter((r) => r.visibility === vis);
        }
      }

      // Mock sorting
      if (sort.createdAt) {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort['budget.monthlyRent']) {
        results.sort((a, b) => a.budget.monthlyRent - b.budget.monthlyRent);
      }

      return results.slice(skip, skip + limit);
    }
  }

  // Favorite profiles
  async toggleFavorite(userId, roommateId) {
    if (isDbConnected()) {
      const existing = await RoommateFavorite.findOne({ userId, roommateId });
      if (existing) {
        await RoommateFavorite.findByIdAndDelete(existing._id);
        return { isFavorite: false };
      } else {
        await RoommateFavorite.create({ userId, roommateId });
        return { isFavorite: true };
      }
    } else {
      const idx = mockRoommateFavorites.findIndex(
        (f) => String(f.userId) === String(userId) && String(f.roommateId) === String(roommateId)
      );
      if (idx !== -1) {
        mockRoommateFavorites.splice(idx, 1);
        return { isFavorite: false };
      } else {
        mockRoommateFavorites.push({ userId, roommateId, createdAt: new Date() });
        return { isFavorite: true };
      }
    }
  }

  async getFavorites(userId) {
    if (isDbConnected()) {
      const favorites = await RoommateFavorite.find({ userId }).populate({
        path: 'roommateId',
        populate: { path: 'userId', select: 'name email avatar' },
      });
      return favorites.map((f) => f.roommateId).filter(Boolean);
    } else {
      const favIds = mockRoommateFavorites
        .filter((f) => String(f.userId) === String(userId))
        .map((f) => String(f.roommateId));
      return mockRoommates.filter((r) => favIds.includes(String(r._id)));
    }
  }

  async isFavorite(userId, roommateId) {
    if (isDbConnected()) {
      const fav = await RoommateFavorite.findOne({ userId, roommateId });
      return !!fav;
    } else {
      return mockRoommateFavorites.some(
        (f) => String(f.userId) === String(userId) && String(f.roommateId) === String(roommateId)
      );
    }
  }

  // Recent views
  async logRecentView(userId, roommateId) {
    if (isDbConnected()) {
      await RoommateRecentView.findOneAndUpdate(
        { userId, roommateId },
        { viewedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      const idx = mockRoommateRecentViews.findIndex(
        (v) => String(v.userId) === String(userId) && String(v.roommateId) === String(roommateId)
      );
      if (idx !== -1) {
        mockRoommateRecentViews[idx].viewedAt = new Date();
      } else {
        mockRoommateRecentViews.push({ userId, roommateId, viewedAt: new Date() });
      }
    }
  }

  async getRecentViews(userId) {
    if (isDbConnected()) {
      const views = await RoommateRecentView.find({ userId })
        .sort({ viewedAt: -1 })
        .limit(10)
        .populate({
          path: 'roommateId',
          populate: { path: 'userId', select: 'name email avatar' },
        });
      return views.map((v) => v.roommateId).filter(Boolean);
    } else {
      const viewItems = mockRoommateRecentViews
        .filter((v) => String(v.userId) === String(userId))
        .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
        .slice(0, 10);
      return viewItems
        .map((v) => mockRoommates.find((r) => String(r._id) === String(v.roommateId)))
        .filter(Boolean);
    }
  }

  // Reports
  async createReport(reportData) {
    if (isDbConnected()) {
      return await RoommateReport.create(reportData);
    } else {
      const report = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...reportData,
        status: 'pending',
        createdAt: new Date(),
      };
      mockRoommateReports.push(report);
      return report;
    }
  }

  async getReports() {
    if (isDbConnected()) {
      return await RoommateReport.find()
        .populate('reporterId', 'name email')
        .populate({
          path: 'roommateId',
          populate: { path: 'userId', select: 'name email avatar' },
        });
    } else {
      return mockRoommateReports.map((rep) => {
        const reporter = mockUsers.find((u) => String(u._id) === String(rep.reporterId));
        const roommate = mockRoommates.find((rm) => String(rm._id) === String(rep.roommateId));
        return {
          ...rep,
          reporterId: reporter || { _id: rep.reporterId, name: 'Reporter User' },
          roommateId: roommate || { _id: rep.roommateId, userId: { name: 'Reported User' } },
        };
      });
    }
  }

  async resolveReport(id, resolutionData) {
    if (isDbConnected()) {
      return await RoommateReport.findByIdAndUpdate(
        id,
        {
          $set: {
            status: resolutionData.status,
            resolutionNotes: resolutionData.resolutionNotes,
            resolvedBy: resolutionData.resolvedBy,
            resolvedAt: new Date(),
          },
        },
        { new: true }
      );
    } else {
      const idx = mockRoommateReports.findIndex((r) => String(r._id) === String(id));
      if (idx === -1) return null;
      mockRoommateReports[idx] = {
        ...mockRoommateReports[idx],
        status: resolutionData.status,
        resolutionNotes: resolutionData.resolutionNotes,
        resolvedBy: resolutionData.resolvedBy,
        resolvedAt: new Date(),
      };
      return mockRoommateReports[idx];
    }
  }
}

const roommateRepository = new RoommateRepository();

const seedRoommates = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const mockCandidates = [
      {
        email: 'neha@staymate.com',
        name: 'Neha Kapoor',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        role: 'tenant',
        profile: {
          basicInfo: { occupation: 'student', collegeOrCompany: 'IIT Delhi', age: 22, gender: 'female', bio: 'Final year college student looking for a quiet, study-friendly female flatmate to share an apartment in Noida.' },
          lifestyle: { sleepingSchedule: 'early_bird', wakeUpTime: '06:30 AM', foodPreference: 'veg', smoking: false, drinking: false, pets: false, guests: false, cleanliness: 'high', noisePreference: 'quiet', studyEnvironment: 'quiet', workFromHome: true, socialLifestyle: 'introvert' },
          budget: { monthlyRent: 6000, securityDeposit: 12000, propertyType: 'apartment', listingType: 'shared' },
          locationPreferences: { city: 'Noida', area: 'Sector 62', maxDistance: 5 },
          languagesSpoken: ['Hindi', 'English'],
          hobbies: ['Books', 'Travel'],
          interests: ['Reading', 'Yoga'],
          moveInDate: new Date('2026-08-01'),
          maxRoommates: 1,
          visibility: 'public',
          profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          completionPercentage: 98,
          isVerified: true
        }
      },
      {
        email: 'vikram@staymate.com',
        name: 'Vikram Malhotra',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        role: 'tenant',
        profile: {
          basicInfo: { occupation: 'professional', collegeOrCompany: 'TCS', age: 26, gender: 'male', bio: 'Software engineer moving to Noida for a new job. Clean, respectful, and looks for an awesome roommate.' },
          lifestyle: { sleepingSchedule: 'flexible', wakeUpTime: '08:00 AM', foodPreference: 'any', smoking: false, drinking: true, pets: false, guests: true, cleanliness: 'moderate', noisePreference: 'moderate', studyEnvironment: 'flexible', workFromHome: true, socialLifestyle: 'moderate' },
          budget: { monthlyRent: 8000, securityDeposit: 16000, propertyType: 'apartment', listingType: 'shared' },
          locationPreferences: { city: 'Noida', area: 'Sector 62', maxDistance: 10 },
          languagesSpoken: ['Hindi', 'English'],
          hobbies: ['Cricket', 'Music'],
          interests: ['Coding', 'Tech'],
          moveInDate: new Date('2026-08-10'),
          maxRoommates: 1,
          visibility: 'public',
          profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          completionPercentage: 98,
          isVerified: true
        }
      },
      {
        email: 'aanya@staymate.com',
        name: 'Aanya Sen',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        role: 'tenant',
        profile: {
          basicInfo: { occupation: 'student', collegeOrCompany: 'NIFT', age: 20, gender: 'female', bio: 'Design student at NIFT. Looking for a flatmate who enjoys art and keeps shared spaces clean. Vegetarians preferred.' },
          lifestyle: { sleepingSchedule: 'flexible', wakeUpTime: '09:00 AM', foodPreference: 'veg', smoking: false, drinking: false, pets: false, guests: true, cleanliness: 'high', noisePreference: 'quiet', studyEnvironment: 'quiet', workFromHome: false, socialLifestyle: 'moderate' },
          budget: { monthlyRent: 5000, securityDeposit: 10000, propertyType: 'flat', listingType: 'shared' },
          locationPreferences: { city: 'Delhi', area: 'Connaught Place', maxDistance: 5 },
          languagesSpoken: ['Hindi', 'English'],
          hobbies: ['Painting', 'Cooking'],
          interests: ['Art', 'Design'],
          moveInDate: new Date('2026-08-15'),
          maxRoommates: 1,
          visibility: 'public',
          profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          completionPercentage: 98,
          isVerified: true
        }
      },
      {
        email: 'rohan@staymate.com',
        name: 'Rohan Mehta',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        role: 'tenant',
        profile: {
          basicInfo: { occupation: 'professional', collegeOrCompany: 'Google', age: 24, gender: 'male', bio: 'Working professional in sales. Chill guy, enjoys gaming on weekends. Looking for a roommate to search for 2BHK flats.' },
          lifestyle: { sleepingSchedule: 'night_owl', wakeUpTime: '11:00 AM', foodPreference: 'non-veg', smoking: true, drinking: true, pets: true, guests: true, cleanliness: 'low', noisePreference: 'loud', studyEnvironment: 'group', workFromHome: false, socialLifestyle: 'extrovert' },
          budget: { monthlyRent: 9500, securityDeposit: 19000, propertyType: 'apartment', listingType: 'rent' },
          locationPreferences: { city: 'Noida', area: 'Sector 62', maxDistance: 15 },
          languagesSpoken: ['Hindi', 'English'],
          hobbies: ['Gaming', 'Football'],
          interests: ['Tech', 'Gaming'],
          moveInDate: new Date('2026-09-01'),
          maxRoommates: 2,
          visibility: 'public',
          profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          completionPercentage: 98,
          isVerified: false
        }
      }
    ];

    if (isDbConnected()) {
      const nehaUser = await User.findOne({ email: 'neha@staymate.com' });
      const nehaProfile = nehaUser ? await Roommate.findOne({ userId: nehaUser._id }) : null;
      if (!nehaProfile) {
        console.log('🌱 Database has no default roommate candidate profiles. Seeding default candidates...');
        for (const candidate of mockCandidates) {
          let userObj = await User.findOne({ email: candidate.email });
          if (!userObj) {
            userObj = await User.create({
              name: candidate.name,
              email: candidate.email,
              password: 'password123',
              role: candidate.role,
              status: 'active',
              avatar: candidate.avatar
            });
          } else {
            userObj.password = 'password123';
            await userObj.save();
          }
          await Roommate.create({
            ...candidate.profile,
            userId: userObj._id
          });
        }
        console.log('🌱 Successfully seeded 4 candidates in MongoDB database.');
      }
    } else {
      if (mockRoommates.length === 0) {
        console.log('🌱 Seeding mock roommates for in-memory mode...');
        mockCandidates.forEach((candidate, idx) => {
          const mockUserId = `mock_candidate_id_${idx}`;
          const userExists = mockUsers.some(u => String(u._id) === mockUserId);
          if (!userExists) {
            mockUsers.push({
              _id: mockUserId,
              name: candidate.name,
              email: candidate.email,
              role: candidate.role,
              status: 'active',
              avatar: candidate.avatar,
              authVersion: 1
            });
          }
          mockRoommates.push({
            _id: `mock_roommate_id_${idx}`,
            ...candidate.profile,
            userId: mockUsers.find(u => String(u._id) === mockUserId)
          });
        });
        console.log('🌱 Successfully seeded 4 candidates in-memory.');
      }
    }
  } catch (err) {
    console.error('Error seeding roommate candidates:', err.message);
  }
};

// Seeder triggers on module load
setTimeout(() => {
  seedRoommates();
}, 2000);

export default roommateRepository;
