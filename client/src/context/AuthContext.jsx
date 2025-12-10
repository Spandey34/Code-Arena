import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    
    if (!socketRef.current) {
        socketRef.current = io('http://localhost:5000', {
            autoConnect: false,
            transports: ['websocket']
        });
    }
    
    if (storedUser) {
        socketRef.current.connect();
    }
    
    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    socketRef.current.on('activeUsersUpdate', (count) => {
      setActiveUsers(count);
    });

    return () => {
      if (socketRef.current) {
          socketRef.current.off('connect');
          socketRef.current.off('activeUsersUpdate');
      }
    };
  }, []);

  const login = async (userData, tokenData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    setUser(userData);
    setToken(tokenData);
    
    if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const authFetch = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  authFetch.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, activeUsers, authFetch, socket: socketRef.current }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };