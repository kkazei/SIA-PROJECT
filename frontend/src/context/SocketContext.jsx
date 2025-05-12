import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, isAuthenticated } = useAuthStore();
  
  // Connect to socket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }
    
    const SOCKET_URL = import.meta.env.MODE === "development" 
      ? "http://localhost:5000" 
      : "";
      
    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        userId: user.id,
        role: user.role
      }
    });
    
    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected!');
      setConnected(true);
      
      // Emit presence when connected
      newSocket.emit('presence', { userId: user.id, status: 'online' });
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });
    
    // Listen for online users updates
    newSocket.on('online_users', (users) => {
      console.log('Online users update:', users);
      setOnlineUsers(new Set(users));
    });
    
    // Store socket instance
    setSocket(newSocket);
    
    return () => {
      // Cleanly disconnect on unmount
      if (newSocket) {
        newSocket.emit('presence', { userId: user.id, status: 'offline' });
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);
  
  // Provide functions for messaging
  const joinConversation = (conversationId) => {
    if (socket) {
      console.log(`Joining conversation: ${conversationId}`);
      socket.emit('join_conversation', { conversationId });
    }
  };
  
  const leaveConversation = (conversationId) => {
    if (socket) {
      console.log(`Leaving conversation: ${conversationId}`);
      socket.emit('leave_conversation', { conversationId });
    }
  };
  
  const markAsRead = (conversationId, messageIds) => {
    if (socket && messageIds.length > 0) {
      console.log(`Marking messages as read: ${messageIds.length} messages`);
      socket.emit('mark_as_read', { conversationId, messageIds });
    }
  };
  
  const emitTyping = (receiverId) => {
    if (socket) {
      socket.emit('typing', { receiverId });
    }
  };
  
  const emitStopTyping = (receiverId) => {
    if (socket) {
      socket.emit('stop_typing', { receiverId });
    }
  };
  
  return (
    <SocketContext.Provider value={{ 
      socket, 
      connected, 
      onlineUsers,
      joinConversation,
      leaveConversation,
      markAsRead,
      emitTyping,
      emitStopTyping
    }}>
      {children}
    </SocketContext.Provider>
  );
};