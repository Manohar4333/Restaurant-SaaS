import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ENV } from '../config/env';

let ioInstance: Server | null = null;

export function initSocketServer(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: [ENV.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join tenant room for Restaurant Admins
    socket.on('join:tenant', (tenantId: string) => {
      if (tenantId) {
        const roomName = `tenant:${tenantId}`;
        socket.join(roomName);
        console.log(`[Socket.IO] Socket ${socket.id} joined room ${roomName}`);
      }
    });

    // Leave tenant room
    socket.on('leave:tenant', (tenantId: string) => {
      if (tenantId) {
        socket.leave(`tenant:${tenantId}`);
      }
    });

    // Join order room for Customer Order Tracking
    socket.on('join:order', (orderId: string) => {
      if (orderId) {
        const roomName = `order:${orderId}`;
        socket.join(roomName);
        console.log(`[Socket.IO] Socket ${socket.id} joined tracking room ${roomName}`);
      }
    });

    // Leave order room
    socket.on('leave:order', (orderId: string) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
}
