// Map of userId -> Set of active socket IDs
export const activeUsers = new Map();

export function registerChatSocketHandlers(io, socket) {
  const userId = socket.userId;
  if (!userId) return;

  // 1. Add to active users list
  if (!activeUsers.has(userId)) {
    activeUsers.set(userId, new Set());
  }
  activeUsers.get(userId).add(socket.id);

  // Broadcast online status to all connected users
  io.emit('online_status', {
    userId,
    isOnline: true,
  });

  // Listen for batch check of online status
  socket.on('check_online_status', (userIds, callback) => {
    const statusMap = {};
    if (Array.isArray(userIds)) {
      userIds.forEach(uid => {
        statusMap[uid] = activeUsers.has(String(uid));
      });
    }
    if (typeof callback === 'function') {
      callback(statusMap);
    }
  });

  // 2. Join/Leave Specific Conversation Rooms
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // 3. Typing Indicators
  socket.on('typing_start', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('typing_status', {
      conversationId,
      userId,
      isTyping: true,
    });
  });

  socket.on('typing_stop', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('typing_status', {
      conversationId,
      userId,
      isTyping: false,
    });
  });

  // 4. Client Disconnect
  socket.on('disconnect', () => {
    const userSockets = activeUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        activeUsers.delete(userId);
        
        // Broadcast offline status with timestamp
        io.emit('online_status', {
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });
      }
    }
  });
}
