import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

// Create context outside of any function
const SocketContext = createContext(null);

// Helper function instead of direct export
function useSocketContext() {
  return useContext(SocketContext);
}

// Export the hook
export const useSocket = useSocketContext;

// Export the provider component
export function SocketProvider({ children }) {
  // Use getState for initial values and subscribe for changes
  const authStore = useAuthStore();
  const token = authStore.token;
  const user = authStore.user;
  
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  
  // Initialize socket connection
  useEffect(() => {
    // Get token from auth store
    const currentToken = useAuthStore.getState().token;
    
    console.log('SocketContext: Checking token for socket connection', !!currentToken);
    
    if (!currentToken) {
      console.log('SocketContext: No token available, skipping socket connection');
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }
    
    // Create socket with token in auth object
    console.log('SocketContext: Creating socket connection with token');
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: currentToken }, // Pass token here
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Handle connection events
    socketInstance.on('connect', () => {
      console.log('🟢 Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      setConnected(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('🟡 Socket disconnected');
      setConnected(false);
    });
    
    // Save socket instance
    setSocket(socketInstance);
    
    // Cleanup on unmount
    return () => {
      console.log('SocketContext: Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [token]); // Only recreate when token changes
  
  // Handle typing indicators
  useEffect(() => {
    if (!socket || !connected) return;
    
    socket.on('typing_indicator', ({ user_id, typing }) => {
      setTypingUsers(prev => ({
        ...prev,
        [user_id]: typing
      }));
    });
    
    return () => {
      socket.off('typing_indicator');
    };
  }, [socket, connected]);
  
  // Helper function to join a conversation
  const joinConversation = (conversationId) => {
    if (socket && connected && conversationId) {
      console.log(`Socket: Joining conversation ${conversationId}`);
      socket.emit('join_conversation', { conversationId });
    } else {
      console.log('Socket: Cannot join conversation - socket not ready or no ID provided');
    }
  };
  
  // Helper function to leave a conversation
  const leaveConversation = (conversationId) => {
    if (socket && connected && conversationId) {
      console.log(`Socket: Leaving conversation ${conversationId}`);
      socket.emit('leave_conversation', { conversationId });
    }
  };
  
  // Helper function to send typing indicator
  const sendTypingIndicator = (isTyping, receiverId) => {
    if (socket && connected && receiverId) {
      if (isTyping) {
        socket.emit('typing_start', { receiver_id: receiverId });
      } else {
        socket.emit('typing_stop', { receiver_id: receiverId });
      }
    }
  };
  
  // Provide socket status for debugging
  const socketStatus = {
    connected,
    socketId: socket?.id || 'not connected',
    token: token ? '✓ Available' : '✗ Missing'
  };
  
  return (
    <SocketContext.Provider value={{ 
      socket, 
      connected,
      typingUsers,
      joinConversation,
      leaveConversation,
      sendTypingIndicator,
      socketStatus
    }}>
      {children}
    </SocketContext.Provider>
  );
}