import { create } from 'zustand';
import axios from 'axios';
import { generateConversationId } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages`;

export const useMessageStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  error: null,
  unreadCounts: {},
  socket: null,
  user: null, // Initialize as null
  
  // Function to get user data from auth store
  initUser: () => {
    try {
      const authStore = useAuthStore.getState();
      if (authStore && authStore.user && authStore.user.id) {
        set({ 
          user: { 
            id: authStore.user.id,
            name: authStore.user.name,
            avatar: authStore.user.avatar,
            role: authStore.user.role
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing user in message store:', error);
      return false;
    }
  },
  
  // Clear any error messages
  clearError: () => set({ error: null }),
  
  // Get all conversations
  getConversations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/conversations`);
      
      // Process unread counts
      const unreadCounts = {};
      response.data.data.forEach(conv => {
        if (conv.otherUser && conv.otherUser._id) {
          unreadCounts[conv.otherUser._id] = conv.unreadCount || 0;
        }
      });
      
      set({
        conversations: response.data.data || [],
        unreadCounts,
        loading: false
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to load conversations',
        conversations: []
      });
      return [];
    }
  },
  
  // Get messages for a specific conversation
  getConversationMessages: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      
      set({
        messages: response.data.data || [],
        activeConversation: userId,
        loading: false,
        // Clear unread count for this conversation
        unreadCounts: {
          ...get().unreadCounts,
          [userId]: 0
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching conversation:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to load conversation',
        messages: []
      });
      return [];
    }
  },
  
  // Send a message via HTTP (fallback)
  sendMessage: async (receiverId, content, attachments = []) => {
    // Make sure we have user data before sending
    get().initUser();
    
    set({ loading: true, error: null });
    try {
      const response = await axios.post(API_URL, {
        receiver_id: receiverId,
        content,
        attachments
      });
      
      // Update messages list
      const newMessage = response.data.data;
      set(state => ({
        messages: [...state.messages, newMessage],
        loading: false
      }));
      
      // Update conversation in the list
      get().updateConversationWithMessage(newMessage);
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to send message'
      });
      throw error;
    }
  },
  
  // Send a message via Socket.IO (preferred)
  sendMessageSocket: (receiverId, content, attachments = []) => {
    const tempId = `temp-${Date.now()}`;
    const { user } = get();
    
    // Create temporary message
    const tempMessage = {
      _id: tempId,
      sender_id: {
        _id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      receiver_id: { _id: receiverId },
      content,
      createdAt: new Date().toISOString(),
      attachments: attachments || []
    };
    
    // Add to messages (optimistic UI)
    set(state => ({
      messages: [...state.messages, tempMessage]
    }));
    
    // Emit via socket
    const socket = get().socket;
    socket.emit('send_message', {
      receiver_id: receiverId,
      content,
      attachments,
      tempId
    });
    
    set({ loading: false });
  },
  
  // Add a message to the state (from socket)
  addMessage: (message) => {
    const { activeConversation } = get();
    
    // Update messages if from current conversation
    const senderId = message.sender_id._id;
    const receiverId = message.receiver_id._id;
    
    // Only add to messages list if it's part of the active conversation
    if (activeConversation === senderId || activeConversation === receiverId) {
      set(state => ({
        messages: [...state.messages, message]
      }));
    }
    
    // Always update the conversations list with this new message
    get().updateConversationWithMessage(message);
    
    // If the message is for us and not from us, increment unread count
    const { user } = get();
    if (receiverId === user.id && senderId !== user.id) {
      set(state => ({
        unreadCounts: {
          ...state.unreadCounts,
          [senderId]: (state.unreadCounts[senderId] || 0) + 1
        }
      }));
    }
  },
  
  // Update conversation list with a new message
  updateConversationWithMessage: (message) => {
    // Make sure we have the user, if not try to get it from auth store
    const { conversations, user } = get();
    if (!user || !user.id) {
      const initialized = get().initUser();
      if (!initialized) {
        console.error('Cannot update conversation: No user data available');
        return; // Exit if we still don't have user data
      }
    }
    
    // Get the user again after potential initialization
    const currentUser = get().user;
    const currentUserId = currentUser.id;
    
    const otherUserId = message.sender_id._id === currentUserId 
      ? message.receiver_id._id 
      : message.sender_id._id;
    
    // Rest of function remains the same...
    const existingConvIndex = conversations.findIndex(
      c => c.otherUser._id === otherUserId
    );
    
    const updatedConversations = [...conversations];
    
    if (existingConvIndex !== -1) {
      updatedConversations[existingConvIndex] = {
        ...updatedConversations[existingConvIndex],
        lastMessage: message
      };
      
      const [conv] = updatedConversations.splice(existingConvIndex, 1);
      updatedConversations.unshift(conv);
    } else {
      const otherUser = message.sender_id._id === currentUserId 
        ? message.receiver_id 
        : message.sender_id;
      
      const newConv = {
        conversation_id: generateConversationId(currentUserId, otherUserId),
        lastMessage: message,
        otherUser,
        unreadCount: message.sender_id._id !== currentUserId ? 1 : 0
      };
      
      updatedConversations.unshift(newConv);
    }
    
    set({ conversations: updatedConversations });
  },
  
  // Initialize socket listeners
  initializeSocketListeners: (socket, userId) => {
    // Set socket instance
    set({ socket });
    
    // Listen for new incoming messages
    socket.on('receive_message', (message) => {
      console.log('New message received via socket:', message);
      
      // Get current state
      const state = get();
      
      // Don't add the message if:
      // 1. It's my own message (I'm the sender)
      // 2. We already have a message with this ID
      const isMyMessage = message.sender_id._id === userId;
      const isDuplicate = state.messages.some(msg => msg._id === message._id);
      
      if (!isDuplicate && !isMyMessage) {
        // Only add to messages if it's not my message and not a duplicate
        set({
          messages: [...state.messages, message]
        });
        
        // Handle conversation list updates
        if (state.activeConversation === message.sender_id._id) {
          // Message is for current conversation, already displayed
        } else {
          // Message is for another conversation, update unread counts
          get().updateConversationPreview(message);
        }
      }
    });
    
    // Listen for confirmation of our own sent messages
    socket.on('message_confirmation', (data) => {
      console.log('Message confirmation received:', data.tempId, data.message);
      
      // Get current state
      const state = get();
      
      // Replace temp message with confirmed one
      const updatedMessages = state.messages.map(msg => 
        msg._id === data.tempId ? { ...data.message } : msg
      );
      
      set({ messages: updatedMessages });
    });
    
    // Other existing socket listeners...
  },
  
  // Cleanup socket listeners
  cleanupSocketListeners: (socket) => {
    if (!socket) return;
    
    console.log('Cleaning up socket listeners');
    socket.off('receive_message');
    socket.off('message_sent');
    socket.off('message_error');
    
    set({ socket: null });
  },

  // Update the message confirmation handler
  handleMessageConfirmation: (tempId, confirmedMessage) => {
    set(state => {
      // Replace temp message with confirmed one
      const updatedMessages = state.messages.map(msg => 
        msg._id === tempId ? confirmedMessage : msg
      );
      
      // If temp message somehow wasn't in the array, add the confirmed message
      if (!updatedMessages.some(msg => msg._id === confirmedMessage._id)) {
        updatedMessages.push(confirmedMessage);
      }
      
      return { messages: updatedMessages };
    });
  }
}));