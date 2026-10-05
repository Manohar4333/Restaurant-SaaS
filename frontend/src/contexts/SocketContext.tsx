import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinOrderRoom: (orderId: string) => void;
  leaveOrderRoom: (orderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, tenant } = useAuth();

  useEffect(() => {
    const socketInstance = io(window.location.origin.includes('5173') ? 'http://localhost:5000' : window.location.origin, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected with id:', socketInstance.id);

      // If restaurant admin, join tenant room automatically
      if (tenant?.id || user?.tenantId) {
        const tId = tenant?.id || user?.tenantId;
        socketInstance.emit('join:tenant', tId);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket] Disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [tenant?.id, user?.tenantId]);

  const joinOrderRoom = (orderId: string) => {
    if (socket && orderId) {
      socket.emit('join:order', orderId);
    }
  };

  const leaveOrderRoom = (orderId: string) => {
    if (socket && orderId) {
      socket.emit('leave:order', orderId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinOrderRoom, leaveOrderRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
