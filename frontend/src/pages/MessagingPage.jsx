import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import ConversationsList from '../components/Messaging/ConversationsList';
import ConversationDetail from '../components/Messaging/ConversationDetail';
import { FaArrowLeft, FaComments, FaRegEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MessagingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user } = useAuthStore();
  const { 
    addIncomingMessage,
    setUserTyping,
    clearUserTyping,
    unreadCounts 
  } = useMessageStore();
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  
  // Calculate total unread messages
  useEffect(() => {
    if (unreadCounts) {
      setTotalUnread(Object.values(unreadCounts).reduce((sum, count) => sum + count, 0));
    }
  }, [unreadCounts]);
  
  // Handle direct messaging from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tenantId = queryParams.get('tenant');
    const landlordId = queryParams.get('landlord');
    const targetUserId = tenantId || landlordId;
    
    if (targetUserId) {
      // Fetch conversations first
      useMessageStore.getState().fetchConversations().then(conversations => {
        // Try to find existing conversation with this user
        const existingConversation = conversations.find(conv => 
          conv.otherUser && conv.otherUser._id === targetUserId
        );
        
        if (existingConversation) {
          // If conversation exists, select it
          setSelectedConversation(existingConversation);
          setShowConversationList(false);
        } else {
          // If no existing conversation, we'll just show the list
          const targetUserType = tenantId ? 'tenant' : 'landlord';
          console.log(`Starting new conversation with ${targetUserType} ID: ${targetUserId}`);
        }
      });
    }
  }, [location.search]);
  
  // Socket event listeners
  useEffect(() => {
    if (socket && connected) {
      // Listen for new messages
      socket.on('receive_message', (message) => {
        console.log('Received new message:', message);
        addIncomingMessage(message);
      });
      
      // Listen for new message notifications
      socket.on('new_message_notification', (notification) => {
        console.log('New message notification:', notification);
        addIncomingMessage(notification.message);
      });
      
      // Listen for typing indicators
      socket.on('user_typing', ({ user: typingUser }) => {
        setUserTyping(typingUser);
      });
      
      socket.on('user_stopped_typing', () => {
        clearUserTyping();
      });
      
      return () => {
        socket.off('receive_message');
        socket.off('new_message_notification');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [socket, connected, addIncomingMessage, setUserTyping, clearUserTyping]);
  
  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false);
  };
  
  // Handle back button in mobile view
  const handleBackToList = () => {
    setShowConversationList(true);
  };
  
  // Handle navigation back to dashboard based on user role
  const navigateToDashboard = () => {
    if (user?.role === 'tenant') {
      navigate('/tenant/dashboard');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen bg-gray-100 overflow-hidden"
    >
      {/* Top navigation header with back button */}
      <div className="bg-gray-900 text-white shadow-md p-4">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={navigateToDashboard}
            className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Back to Dashboard"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center">
              <FaComments className="mr-2" /> 
              Messages
              {totalUnread > 0 && (
                <span className="ml-2 bg-red-500 text-white text-sm rounded-full px-2 py-1">
                  {totalUnread}
                </span>
              )}
            </h1>
            <p className="text-gray-300 text-sm">
              {user?.role === 'tenant' 
                ? 'Connect with your landlord' 
                : 'Connect with your tenants'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex overflow-hidden bg-gray-50">
        {/* Conversations list (hidden on mobile when a conversation is selected) */}
        <div 
          className={`
            ${showConversationList ? 'flex' : 'hidden'} 
            md:flex flex-col w-full md:w-1/3 xl:w-1/4 bg-white border-r border-gray-200 overflow-hidden
            shadow-sm
          `}
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <FaRegEnvelope className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Conversations</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <ConversationsList
              onSelectConversation={handleSelectConversation}
              activeConversationId={selectedConversation?._id}
            />
          </div>
        </div>
        
        {/* Conversation detail (shown on mobile only when a conversation is selected) */}
        <div 
          className={`
            ${showConversationList ? 'hidden' : 'flex'} 
            md:flex flex-col flex-grow h-full
          `}
        >
          <ConversationDetail
            conversation={selectedConversation}
            onBackClick={handleBackToList}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MessagingPage;