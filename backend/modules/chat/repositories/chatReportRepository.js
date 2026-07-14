import ChatReport from '../../../models/ChatReport.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

let mockReports = [];

class ChatReportRepository {
  async create(data) {
    if (isDbConnected()) {
      return await ChatReport.create(data);
    } else {
      const newReport = {
        _id: 'report-' + Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockReports.push(newReport);
      return newReport;
    }
  }

  async findById(id) {
    if (isDbConnected()) {
      return await ChatReport.findById(id)
        .populate('reporterId', 'name email avatar')
        .populate('conversationId');
    } else {
      return mockReports.find(r => String(r._id) === String(id));
    }
  }

  async findAll() {
    if (isDbConnected()) {
      return await ChatReport.find()
        .populate('reporterId', 'name email avatar')
        .populate('conversationId')
        .populate('messageId')
        .sort({ createdAt: -1 });
    } else {
      return [...mockReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  async updateStatus(id, status) {
    if (isDbConnected()) {
      return await ChatReport.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      const rep = mockReports.find(r => String(r._id) === String(id));
      if (rep) {
        rep.status = status;
        rep.updatedAt = new Date();
      }
      return rep;
    }
  }

  clearMock() {
    mockReports = [];
  }
}

export default new ChatReportRepository();
