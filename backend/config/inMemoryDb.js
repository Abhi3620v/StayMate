import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// In-Memory User Storage
export const mockUsers = [];
export const mockSessions = [];
export const mockTrustedDevices = [];
export const mockProperties = [];
export const mockVisitRequests = [];

/**
 * Checks if the MongoDB database connection is active
 * @returns {boolean} True if connected
 */
export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Seed testing accounts with default parameters
const seedMockUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  mockUsers.push({
    _id: 'mock_tenant_id_123',
    name: 'Mock Tenant',
    email: 'tenant@staymate.com',
    password: hashedPassword,
    role: 'tenant',
    status: 'active',
    customPermissions: [],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    authVersion: 1,
    comparePassword: async function (candidate) {
      return await bcrypt.compare(candidate, this.password);
    },
  });

  mockUsers.push({
    _id: 'mock_owner_id_123',
    name: 'Mock Owner',
    email: 'owner@staymate.com',
    password: hashedPassword,
    role: 'owner',
    status: 'active',
    customPermissions: [],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    authVersion: 1,
    comparePassword: async function (candidate) {
      return await bcrypt.compare(candidate, this.password);
    },
  });

  mockUsers.push({
    _id: 'mock_admin_id_123',
    name: 'Mock Admin',
    email: 'admin@staymate.com',
    password: hashedPassword,
    role: 'admin',
    status: 'active',
    customPermissions: [],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    authVersion: 1,
    comparePassword: async function (candidate) {
      return await bcrypt.compare(candidate, this.password);
    },
  });
};

// Execute seeding on boot
seedMockUsers().catch((err) => console.error('Error seeding mock db:', err));
