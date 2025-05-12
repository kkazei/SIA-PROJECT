import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    // Only connect if user is logged in
    if (!user || !token) return;

    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    // Socket event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully with ID:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('online_users', (users) => {
      setOnlineUsers(new Set(users));
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message, err);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        console.log('Disconnecting socket');
        socketInstance.disconnect();
      }
    };
  }, [user, token]);

  useEffect(() => {
    if (!socket) return;
    
    const debugSocketEvents = () => {
      // Debug incoming events
      const originalOnEvent = socket.onevent;
      socket.onevent = function(packet) {
        console.log('Socket received:', packet.data[0], packet.data[1] || '');
        originalOnEvent.call(this, packet);
      };
      
      // Debug outgoing events
      const originalEmit = socket.emit;
      socket.emit = function(eventName, ...args) {
        console.log('Socket emitting:', eventName, ...args);
        return originalEmit.apply(this, [eventName, ...args]);
      };
    };
    
    debugSocketEvents();
  }, [socket]);

  // Join a conversation room
  const joinConversation = (conversationId) => {
    if (socket && connected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  // Leave a conversation room
  const leaveConversation = (conversationId) => {
    if (socket && connected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  // Send a typing indicator
  const sendTyping = (conversationId, isTyping) => {
    if (socket && connected) {
      socket.emit(isTyping ? 'typing' : 'stop_typing', { conversationId });
    }
  };

  // Mark messages as read
  const markAsRead = (conversationId, messageIds) => {
    if (socket && connected && messageIds.length > 0) {
      socket.emit('mark_as_read', { conversationId, messageIds });
    }
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendTyping,
    markAsRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};