import Block from '../../../models/Block.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

let mockBlocks = [];

class BlockRepository {
  async block(blockerId, blockedId) {
    if (isDbConnected()) {
      return await Block.create({ blockerId, blockedId });
    } else {
      const newBlock = {
        _id: 'block-' + Math.random().toString(36).substr(2, 9),
        blockerId,
        blockedId,
        createdAt: new Date(),
      };
      mockBlocks.push(newBlock);
      return newBlock;
    }
  }

  async unblock(blockerId, blockedId) {
    if (isDbConnected()) {
      return await Block.findOneAndDelete({ blockerId, blockedId });
    } else {
      const idx = mockBlocks.findIndex(b => String(b.blockerId) === String(blockerId) && String(b.blockedId) === String(blockedId));
      if (idx !== -1) {
        return mockBlocks.splice(idx, 1)[0];
      }
      return null;
    }
  }

  async isBlocked(userA, userB) {
    if (isDbConnected()) {
      const blockExists = await Block.findOne({
        $or: [
          { blockerId: userA, blockedId: userB },
          { blockerId: userB, blockedId: userA },
        ],
      });
      return !!blockExists;
    } else {
      const uA = String(userA);
      const uB = String(userB);
      return mockBlocks.some(b => 
        (String(b.blockerId) === uA && String(b.blockedId) === uB) ||
        (String(b.blockerId) === uB && String(b.blockedId) === uA)
      );
    }
  }

  async getBlockedUsers(userId) {
    if (isDbConnected()) {
      return await Block.find({ blockerId: userId }).populate('blockedId', 'name email avatar');
    } else {
      const uid = String(userId);
      return mockBlocks.filter(b => String(b.blockerId) === uid);
    }
  }

  clearMock() {
    mockBlocks = [];
  }
}

export default new BlockRepository();
