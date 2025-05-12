import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Add this import
import { useSocket } from '../context/SocketContext';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import ConversationsList from '../components/Messaging/ConversationsList';
import ConversationDetail from '../components/Messaging/ConversationDetail';
import TenantSideNav from '../components/layout/TenantSideNav';
import LandlordSideNav from '../components/layout/LandlordSideNav';

const MessagingPage = () => {
  const location = useLocation(); // Add this
  const { socket, connected } = useSocket();
  const { user } = useAuthStore();
  const { 
    addIncomingMessage,
    setUserTyping,
    clearUserTyping 
  } = useMessageStore();
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationList, setShowConversationList] = useState(true);
  
  // Add this to handle direct messaging from URL params
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
          // If no existing conversation, we can handle this by creating a skeleton conversation
          // object that will be populated once they send their first message
          const targetUserType = tenantId ? 'tenant' : 'landlord';
          console.log(`Starting new conversation with ${targetUserType} ID: ${targetUserId}`);
          
          // The actual conversation will be created when they send their first message
          // For now just keep the conversations list open
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
  
  // Get the right sidebar component based on user role
  const SideNav = user?.role === 'tenant' ? TenantSideNav : LandlordSideNav;
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Side navigation */}
      <SideNav />
      
      {/* Main content area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Page header */}
        <div className="bg-white border-b shadow-sm p-4">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-gray-600">Communicate with your {user?.role === 'tenant' ? 'landlord' : 'tenants'}</p>
        </div>
        
        {/* Messages container */}
        <div className="flex-grow flex overflow-hidden">
          {/* Conversations list (hidden on mobile when a conversation is selected) */}
          <div className={`${
            showConversationList ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-1/3 lg:w-1/4 border-r bg-white overflow-hidden`}>
            <div className="p-3 border-b bg-gray-50">
              <h2 className="font-medium text-gray-800">Conversations</h2>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                activeConversationId={selectedConversation?._id}
              />
            </div>
          </div>
          
          {/* Conversation detail (shown on mobile only when a conversation is selected) */}
          <div className={`${
            showConversationList ? 'hidden' : 'flex'
          } md:flex flex-col flex-grow h-full`}>
            <ConversationDetail
              conversation={selectedConversation}
              onBackClick={handleBackToList}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;