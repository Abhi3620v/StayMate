import mongoose from 'mongoose';
import RoommateRequest from '../../../models/RoommateRequest.js';
import User from '../../../models/User.js';
import { mockUsers } from '../../../config/inMemoryDb.js';
import { mockRoommateRequests } from './roommateMockDb.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

class RoommateRequestRepository {
  async createRequest(data) {
    if (isDbConnected()) {
      const request = new RoommateRequest(data);
      await request.save();
      return await RoommateRequest.findById(request._id)
        .populate('senderId', 'name email avatar')
        .populate('receiverId', 'name email avatar');
    } else {
      const existingIdx = mockRoommateRequests.findIndex(
        (r) => String(r.senderId) === String(data.senderId) && String(r.receiverId) === String(data.receiverId)
      );
      if (existingIdx !== -1) {
        mockRoommateRequests[existingIdx] = {
          ...mockRoommateRequests[existingIdx],
          status: 'pending',
          message: data.message || '',
          updatedAt: new Date(),
        };
        return mockRoommateRequests[existingIdx];
      }

      const sender = mockUsers.find((u) => String(u._id) === String(data.senderId));
      const receiver = mockUsers.find((u) => String(u._id) === String(data.receiverId));

      const mockReq = {
        _id: new mongoose.Types.ObjectId().toString(),
        senderId: sender || { _id: data.senderId, name: 'Sender User', avatar: '' },
        receiverId: receiver || { _id: data.receiverId, name: 'Receiver User', avatar: '' },
        status: 'pending',
        message: data.message || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRoommateRequests.push(mockReq);
      return mockReq;
    }
  }

  async findActiveRequest(senderId, receiverId) {
    if (isDbConnected()) {
      return await RoommateRequest.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      });
    } else {
      const req = mockRoommateRequests.find(
        (r) =>
          (String(r.senderId._id || r.senderId) === String(senderId) && String(r.receiverId._id || r.receiverId) === String(receiverId)) ||
          (String(r.senderId._id || r.senderId) === String(receiverId) && String(r.receiverId._id || r.receiverId) === String(senderId))
      );
      return req || null;
    }
  }

  async findById(id) {
    if (isDbConnected()) {
      return await RoommateRequest.findById(id)
        .populate('senderId', 'name email avatar')
        .populate('receiverId', 'name email avatar');
    } else {
      const req = mockRoommateRequests.find((r) => String(r._id) === String(id));
      return req || null;
    }
  }

  async updateStatus(id, status) {
    if (isDbConnected()) {
      return await RoommateRequest.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      )
        .populate('senderId', 'name email avatar')
        .populate('receiverId', 'name email avatar');
    } else {
      const idx = mockRoommateRequests.findIndex((r) => String(r._id) === String(id));
      if (idx === -1) return null;
      mockRoommateRequests[idx] = {
        ...mockRoommateRequests[idx],
        status,
        updatedAt: new Date(),
      };
      return mockRoommateRequests[idx];
    }
  }

  async getRequestsForUser(userId) {
    if (isDbConnected()) {
      const requests = await RoommateRequest.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
        .populate('senderId', 'name email avatar')
        .populate('receiverId', 'name email avatar')
        .sort({ updatedAt: -1 });

      return requests;
    } else {
      const uid = String(userId);
      return mockRoommateRequests
        .filter(
          (r) =>
            String(r.senderId._id || r.senderId) === uid ||
            String(r.receiverId._id || r.receiverId) === uid
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
  }

  async getPendingRequestsCount(userId) {
    if (isDbConnected()) {
      return await RoommateRequest.countDocuments({ receiverId: userId, status: 'pending' });
    } else {
      const uid = String(userId);
      return mockRoommateRequests.filter(
        (r) => String(r.receiverId._id || r.receiverId) === uid && r.status === 'pending'
      ).length;
    }
  }
}

const roommateRequestRepository = new RoommateRequestRepository();
export default roommateRequestRepository;
