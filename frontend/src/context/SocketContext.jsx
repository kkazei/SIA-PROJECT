import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

import debounce from 'lodash.debounce'; // Add this import


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
  const [processedReadReceipts, setProcessedReadReceipts] = useState({}); // Add state for tracking processed read receipts
  
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

  // Handle message statuses
  useEffect(() => {
    if (!socket || !connected) return;
    
    // Listen for message read receipts
    socket.on('messages_read', ({ reader_id, timestamp }) => {
      console.log(`Messages read by ${reader_id} at ${timestamp}`);
      // Use the global API
      if (window.messageStore && typeof window.messageStore.markMessagesAsRead === 'function') {
        window.messageStore.markMessagesAsRead(reader_id);
      } else {
        console.warn('Message store not available or missing markMessagesAsRead function');
      }
    });
    
    // Listen for delivery confirmations
    socket.on('delivery_confirmation', ({ message_id, delivered_to, timestamp }) => {
      console.log(`Message ${message_id} delivered to ${delivered_to} at ${timestamp}`);
      // Dispatch to your message store
      if (window.messageStore && window.messageStore.markMessageAsDelivered) {
        window.messageStore.markMessageAsDelivered(message_id);
      }
    });
    
    return () => {
      socket.off('messages_read');
      socket.off('delivery_confirmation');
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

  // Create debounced version of markMessagesAsRead
  const debouncedMarkMessagesAsRead = useCallback(
    debounce((senderId) => {
      if (socket && connected && senderId) {
        socket.emit('mark_messages_read', { sender_id: senderId });
      }
    }, 2000, { leading: true, trailing: false }),
    [socket, connected]
  );

  // Replace your regular markMessagesAsRead function with the debounced version
  const markMessagesAsRead = (senderId) => {
    if (!senderId) return;
    
    // Create a unique key for this sender
    const key = `${senderId}-${Date.now()}`;
    
    // Check if we've recently processed this sender
    const recentTimeframe = 5000; // 5 seconds
    const now = Date.now();
    
    // If we've processed this sender recently, skip
    if (processedReadReceipts[senderId] && 
        now - processedReadReceipts[senderId] < recentTimeframe) {
      return;
    }
    
    // Record this processing time
    setProcessedReadReceipts(prev => ({
      ...prev,
      [senderId]: now
    }));
    
    // Use the debounced function
    debouncedMarkMessagesAsRead(senderId);
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
      markMessagesAsRead,  // Use the modified function
      socketStatus
    }}>
      {children}
    </SocketContext.Provider>
  );
}