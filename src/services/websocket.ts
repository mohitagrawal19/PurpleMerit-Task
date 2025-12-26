import { Server } from 'socket.io';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { cachePublish } from './redis';

const activeUsers = new Map<string, { userId: string; workspaceId: string; socketId: string }>();

export const setupWebSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Auth error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Auth error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    logger.info({ userId, socketId: socket.id }, 'User connected');

    socket.on('join-workspace', async (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      activeUsers.set(socket.id, { userId, workspaceId, socketId: socket.id });

      io.to(`workspace:${workspaceId}`).emit('user:joined', {
        userId,
        timestamp: new Date(),
      });

      await cachePublish('workspace:events', JSON.stringify({
        type: 'user:joined',
        userId,
        workspaceId,
      }));
    });

    socket.on('cursor:update', async (data) => {
      const room = `workspace:${data.workspaceId}`;
      socket.to(room).emit('cursor:update', { userId, ...data });

      await cachePublish('workspace:events', JSON.stringify({
        type: 'cursor:update',
        userId,
        ...data,
      }));
    });

    socket.on('file:change', async (data) => {
      const room = `workspace:${data.workspaceId}`;
      socket.to(room).emit('file:change', { userId, ...data });

      await cachePublish('workspace:events', JSON.stringify({
        type: 'file:change',
        userId,
        ...data,
      }));
    });

    socket.on('activity:update', async (data) => {
      const room = `workspace:${data.workspaceId}`;
      socket.to(room).emit('activity:update', { userId, ...data });
    });

    socket.on('disconnect', async () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        activeUsers.delete(socket.id);
        io.to(`workspace:${user.workspaceId}`).emit('user:left', {
          userId: user.userId,
          timestamp: new Date(),
        });

        await cachePublish('workspace:events', JSON.stringify({
          type: 'user:left',
          userId: user.userId,
          workspaceId: user.workspaceId,
        }));
      }
      logger.info({ userId }, 'User disconnected');
    });
  });
};
