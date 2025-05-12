import { create } from 'zustand';
import axios from 'axios';

// Define base URLs once at the top of the file
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "";
const API_URL = `${BASE_URL}/api/messages`;

axios.defaults.withCredentials = true;

export const useMessageStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  message: null,
  unreadCounts: {},
  userTyping: null,
  
  // Fetch all conversations for the current user
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/conversations`);
      
      set({ 
        conversations: response.data.data,
        isLoading: false,
        // Convert unread counts to an object with conversation IDs as keys
        unreadCounts: response.data.data.reduce((acc, conv) => {
          acc[conv._id] = conv.unreadCount;
          return acc;
        }, {})
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching conversations"
      });
      return [];
    }
  },
  
  // Fetch messages for a specific conversation
  fetchMessages: async (userId, page = 1) => {
    if (!userId) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/conversations/${userId}?page=${page}`);
      
      // For first page, replace messages; for pagination, append
      const newMessages = page === 1 ? response.data.data.docs : [...get().messages, ...response.data.data.docs];
      
      set({
        messages: newMessages,
        currentConversation: {
          userId,
          hasMoreMessages: response.data.data.hasNextPage,
          totalMessages: response.data.data.totalDocs,
          currentPage: response.data.data.page
        },
        isLoading: false
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching messages"
      });
      return null;
    }
  },
  
  // Send a new message
  sendMessage: async (receiverId, content, attachments = []) => {
    set({ isLoading: true, error: null });
    
    try {
      // Make sure receiverId is a string and not a temporary ID
      let actualReceiverId = receiverId;
      if (typeof receiverId === 'string' && receiverId.startsWith('temp_')) {
        actualReceiverId = receiverId.replace('temp_', '');
      }
      
      // Try using regular JSON instead of FormData if there are no attachments
      if (!attachments || attachments.length === 0) {
        console.log('Sending message with JSON');
        const response = await axios.post(API_URL, {
          receiver_id: actualReceiverId,
          content: content
        });
        
        // Handle response...
        const newMessage = response.data.data;
        set(state => ({
          messages: [newMessage, ...state.messages],
          isLoading: false,
          message: "Message sent successfully"
        }));
        
        return newMessage;
      }
      
      // Use FormData only if there are attachments
      console.log('Sending message with FormData');
      const formData = new FormData();
      formData.append('receiver_id', actualReceiverId);
      formData.append('content', content);
      
      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Handle response...
      const newMessage = response.data.data;
      set(state => ({
        messages: [newMessage, ...state.messages],
        isLoading: false,
        message: "Message sent successfully"
      }));
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error sending message"
      });
      return null;
    }
  },
  
  // Handle incoming message from socket
  addIncomingMessage: (message) => {
    // Check if this message belongs to the current conversation
    const { currentConversation } = get();
    const currentReceiverId = currentConversation?.userId;
    
    // Add to messages if we're in the same conversation
    if (currentReceiverId && 
        (message.sender_id._id === currentReceiverId || 
         message.receiver_id._id === currentReceiverId)) {
      set(state => ({
        messages: [message, ...state.messages]
      }));
    }
    
    // Update conversations list
    set(state => {
      // Find if conversation exists already
      const conversationId = message.conversation_id;
      const existingIndex = state.conversations.findIndex(c => c._id === conversationId);
      
      let newConversations = [...state.conversations];
      let newUnreadCounts = {...state.unreadCounts};
      
      // If user is not currently viewing this conversation, increment unread count
      if (currentReceiverId !== message.sender_id._id) {
        newUnreadCounts[conversationId] = (newUnreadCounts[conversationId] || 0) + 1;
      }
      
      if (existingIndex !== -1) {
        // Update existing conversation
        newConversations[existingIndex] = {
          ...newConversations[existingIndex],
          lastMessage: message
        };
        
        // Move to top of list
        newConversations = [
          newConversations[existingIndex],
          ...newConversations.slice(0, existingIndex),
          ...newConversations.slice(existingIndex + 1)
        ];
      } else {
        // Add new conversation
        const otherUser = message.sender_id._id === currentReceiverId 
          ? message.receiver_id 
          : message.sender_id;
          
        newConversations = [{
          _id: conversationId,
          lastMessage: message,
          otherUser
        }, ...newConversations];
      }
      
      return {
        conversations: newConversations,
        unreadCounts: newUnreadCounts
      };
    });
  },
  
  // Mark messages as read locally
  markMessagesAsRead: (conversationId) => {
    set(state => {
      const updatedMessages = state.messages.map(message => {
        // Only mark messages from the other person as read
        if (message.conversation_id === conversationId && !message.read) {
          return { ...message, read: true };
        }
        return message;
      });
      
      // Reset unread count for this conversation
      const updatedUnreadCounts = { ...state.unreadCounts };
      updatedUnreadCounts[conversationId] = 0;
      
      return {
        messages: updatedMessages,
        unreadCounts: updatedUnreadCounts
      };
    });
  },
  
  // Mark messages as read on the server
  markMessagesReadOnServer: async (conversationId, messageIds) => {
    if (!messageIds.length) return;
    
    try {
      await axios.post(`${API_URL}/read`, {
        conversationId,
        messageIds
      });
      
      // State is already updated by markMessagesAsRead
    } catch (error) {
      console.error('Error marking messages as read on server:', error);
      // Don't set error state to avoid UI disruption
    }
  },
  
  // Set typing indicator
  setUserTyping: (userId) => {
    set({ userTyping: userId });
  },
  
  // Clear typing indicator
  clearUserTyping: () => {
    set({ userTyping: null });
  },
  
  // Clear current conversation
  clearConversation: () => {
    set({
      currentConversation: null,
      messages: [],
      userTyping: null
    });
  },
  
  // Clear messages and errors (similar to apartmentStore)
  clearMessages: () => {
    set({ error: null, message: null });
  },

  // Start or get conversation with a user
  getOrCreateConversation: async (userId) => {
    set({ isLoading: true });
    try {
      // Make sure userId is a string
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid user ID:', userId);
        throw new Error("Invalid user ID");
      }
      
      // First check if we already have this conversation
      const { conversations } = get();
      const existingConversation = conversations.find(conv => 
        conv.otherUser && conv.otherUser._id === userId
      );
      
      if (existingConversation) {
        set({ isLoading: false });
        return existingConversation;
      }
      
      // If no existing conversation, we need user details
      const response = await axios.get(`${BASE_URL}/api/users/${userId}`);
      const userData = response.data.data;
      
      if (!userData) {
        throw new Error("User not found");
      }
      
      // Return a temporary conversation object for display
      const tempConversation = {
        _id: `temp_${userId}`,
        otherUser: userData,
        lastMessage: null,
        unreadCount: 0
      };
      
      set({ isLoading: false });
      return tempConversation;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error starting conversation"
      });
      return null;
    }
  }
}));