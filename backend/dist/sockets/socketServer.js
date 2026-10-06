"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
let ioInstance = null;
function initSocketServer(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: [env_1.ENV.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
            methods: ['GET', 'POST', 'PATCH'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);
        // Join tenant room for Restaurant Admins
        socket.on('join:tenant', (tenantId) => {
            if (tenantId) {
                const roomName = `tenant:${tenantId}`;
                socket.join(roomName);
                console.log(`[Socket.IO] Socket ${socket.id} joined room ${roomName}`);
            }
        });
        // Leave tenant room
        socket.on('leave:tenant', (tenantId) => {
            if (tenantId) {
                socket.leave(`tenant:${tenantId}`);
            }
        });
        // Join order room for Customer Order Tracking
        socket.on('join:order', (orderId) => {
            if (orderId) {
                const roomName = `order:${orderId}`;
                socket.join(roomName);
                console.log(`[Socket.IO] Socket ${socket.id} joined tracking room ${roomName}`);
            }
        });
        // Leave order room
        socket.on('leave:order', (orderId) => {
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
function getIO() {
    if (!ioInstance) {
        throw new Error('Socket.io has not been initialized yet!');
    }
    return ioInstance;
}
