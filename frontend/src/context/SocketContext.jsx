import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Create a socket instance outside the component to prevent recreation on rerender
let socketInstance = null;

// Track active users
const activeUsers = new Set();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuth, user } = useAuthStore();
  
  useEffect(() => {
    // Only try to connect if user is authenticated
    if (isAuth && token && !socketInstance) {
      const BASE_URL = import.meta.env.MODE === "development" 
        ? "http://localhost:5000" 
        : "";
      
      console.log('Creating new socket connection');
      socketInstance = io(BASE_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      setSocket(socketInstance);
      
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Announce presence
        if (user?.id) {
          socketInstance.emit('user_online', { userId: user.id });
        }
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });
      
      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setConnected(false);
      });
      
      // Handle user presence (add these listeners)
      socketInstance.on('users_online', (users) => {
        console.log('Users online:', users);
        activeUsers.clear();
        if (Array.isArray(users)) {
          users.forEach(id => activeUsers.add(id));
        }
      });
      
      socketInstance.on('user_connected', (userId) => {
        console.log('User connected:', userId);
        activeUsers.add(userId);
      });
      
      socketInstance.on('user_disconnected', (userId) => {
        console.log('User disconnected:', userId);
        activeUsers.delete(userId);
      });
    }
    
    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.disconnect();
        socketInstance = null;
        setSocket(null);
        setConnected(false);
      }
    };
  }, [isAuth, token, user?.id]);
  
  // Safe function to check if a user is online
  const isUserOnline = (userId) => {
    return activeUsers.has(userId);
  };
  
  const value = {
    socket,
    connected,
    isUserOnline // Expose this function
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Export singleton instance for direct import
export const socket = socketInstance;