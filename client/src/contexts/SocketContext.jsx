import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
const backend_url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(`${backend_url}`, {
        withCredentials: true
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('login', user._id);
      });

      newSocket.on('onlineUsers', (count) => {
        setOnlineCount(count);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};