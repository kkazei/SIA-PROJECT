import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Create a socket instance outside the component to prevent recreation on rerender
let socketInstance = null;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuth } = useAuthStore();
  
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
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });
      
      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setConnected(false);
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
  }, [isAuth, token]);
  
  const value = {
    socket,
    connected
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Export singleton instance for direct import
export const socket = socketInstance;