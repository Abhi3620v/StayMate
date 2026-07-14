export function registerNotificationSocketHandlers(io, socket) {
  const userId = socket.userId;
  if (!userId) return;

  // Join the user's private notification channel
  socket.join(`user_${userId}`);
  console.log(`Socket client ${socket.id} joined private notification channel: user_${userId}`);

  socket.on('disconnect', () => {
    socket.leave(`user_${userId}`);
    console.log(`Socket client ${socket.id} left private notification channel: user_${userId}`);
  });
}

export default registerNotificationSocketHandlers;
