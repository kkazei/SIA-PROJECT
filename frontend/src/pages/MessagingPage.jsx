import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { useSocket } from '../context/SocketContext';
import ConversationsList from '../components/messaging/ConversationsList';
import ConversationDetail from '../components/messaging/ConversationDetail';
import { generateConversationId } from '../utils/helpers';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.FallbackComponent({ 
        error: this.state.error,
        resetErrorBoundary: () => this.setState({ hasError: false, error: null })
      });
    }
    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md flex flex-col items-center justify-center h-full">
    <FaExclamationTriangle className="text-red-500 text-3xl mb-3" />
    <h3 className="text-red-800 font-medium text-lg">Something went wrong</h3>
    <p className="text-red-600 mt-1 mb-4 text-center">{error.message || 'An error occurred while loading the conversation'}</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

const MessagingPage = () => {
  const { userId } = useParams(); // For direct conversation
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const socketContext = useSocket();
  
  // Add safety check for socket context
  const socket = socketContext?.socket;
  const connected = socketContext?.connected || false;
  const joinConversation = socketContext?.joinConversation || (() => {});
  const leaveConversation = socketContext?.leaveConversation || (() => {});
  
  const { 
    conversations,
    messages,
    activeConversation,
    getConversations,
    getConversationMessages,
    initializeSocketListeners,
    cleanupSocketListeners,
    sendMessageSocket,
    sendMessage,
    initUser,
    loading,
    error
  } = useMessageStore();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [showConversations, setShowConversations] = useState(true); // For mobile view
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      if (!isMobile) setShowConversations(true);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to navigate back to dashboard based on user role
  const handleBackToDashboard = () => {
    if (user?.role === 'tenant') {
      navigate('/tenant/dashboard');
    } else {
      navigate('/dashboard'); // For landlord
    }
  };

  // Initialize user in message store
  useEffect(() => {
    if (user) {
      console.log("Initialize user in message store:", user.id);
      initUser();
    }
  }, [user]);
  
  // Load conversations and monitor socket connection
  useEffect(() => {
    console.log("Setting up messaging page with socket:", socket?.id);
    
    // Always fetch conversations on load
    getConversations().catch(err => {
      console.error("Failed to load conversations:", err);
    });
    
    // Initialize socket listeners only when connected
    if (socket && connected && user) {
      console.log("Initializing socket listeners for user:", user.id);
      initializeSocketListeners(socket, user.id);
    }
    
    return () => {
      // Cleanup socket listeners
      if (socket) {
        cleanupSocketListeners(socket);
      }
    };
  }, [socket, connected, user]);
  
  // Handle direct conversation if userId is provided
  useEffect(() => {
    if (userId && user && conversations?.length > 0) {
      console.log("Direct conversation requested with:", userId);
      handleSelectConversation(userId);
      
      // On mobile, switch to conversation view
      if (mobileView) {
        setShowConversations(false);
      }
    }
  }, [userId, user, conversations, mobileView]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Mark messages as read when conversation is selected or new messages arrive
  useEffect(() => {
    if (activeConversation && messages.length > 0 && socketContext?.markMessagesAsRead) {
      // Find only unread messages from the other user
      const hasUnreadMessages = messages.some(
        msg => msg.sender_id._id === activeConversation && !msg.isRead
      );
      
      // Only mark messages as read if there are unread messages
      if (hasUnreadMessages) {
        console.log("Marking messages as read for:", activeConversation);
        socketContext.markMessagesAsRead(activeConversation);
      }
    }
  }, [activeConversation, messages]); // Trigger on both conversation changes and new messages
  
  // Handle conversation selection
  const handleSelectConversation = async (userId) => {
    if (!userId) return;
    
    try {
      console.log("Selecting conversation with:", userId);
      
      // On mobile, hide conversation list when selecting a conversation
      if (mobileView) {
        setShowConversations(false);
      }
      
      // Leave previous conversation if any
      if (activeConversation && user) {
        const prevConvId = generateConversationId(user.id, activeConversation);
        leaveConversation(prevConvId);
      }
      
      // Load conversation messages
      await getConversationMessages(userId);
      const selectedUserData = conversations.find(c => c.otherUser?._id === userId)?.otherUser;
      setSelectedUser(selectedUserData);
      
      // Join the conversation room
      if (user) {
        const convId = generateConversationId(user.id, userId);
        console.log("Joining conversation room:", convId);
        joinConversation(convId);
      }
      
      // Update URL without reload
      navigate(`/messages/${userId}`, { replace: true });
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };
  
  // Handle message sending
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;
    
    console.log("Sending message to:", activeConversation);
    
    if (socket && connected) {
      // Use socket for real-time messaging if available
      sendMessageSocket(activeConversation, messageInput.trim());
    } else {
      // Fall back to HTTP if socket is not available
      sendMessage(activeConversation, messageInput.trim());
    }
    
    setMessageInput('');
  };
  
  const handleBackToList = () => {
    setShowConversations(true);
    navigate('/messages', { replace: true });
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {!connected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <p>Socket connection unavailable. Messages will be sent using HTTP fallback.</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-grow overflow-hidden">
        {/* Conversation List Sidebar - Show based on mobile/desktop view */}
        {(!mobileView || showConversations) && (
          <div className={`${mobileView ? 'w-full' : 'w-1/3'} border-r bg-white overflow-y-auto flex flex-col`}>
            {/* Header with back button */}
            <div className="p-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center mb-2">
                <button 
                  onClick={handleBackToDashboard}
                  className="flex items-center text-gray-600 hover:text-blue-600 mr-3 p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <FaArrowLeft className="mr-1" />
                  <span>Back</span>
                </button>
                <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
              </div>
            </div>
            
            {/* Loading state */}
            {loading && !conversations?.length && (
              <div className="p-4 flex-grow">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 ml-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Error state */}
            {error && !loading && (
              <div className="p-6 text-center flex-grow flex flex-col items-center justify-center">
                <div className="bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-3">
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
                <h3 className="font-medium text-red-800">Failed to load conversations</h3>
                <p className="text-red-600 text-sm mt-1 mb-4">{error?.message || 'Please try again later'}</p>
                <button 
                  onClick={() => getConversations()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Conversations list */}
            {!loading && !error && (
              <ConversationsList 
                conversations={conversations || []}
                activeConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                hideHeader={true}
              />
            )}
          </div>
        )}
        
        {/* Conversation Detail - Only show on desktop or when a conversation is selected on mobile */}
        {(!mobileView || !showConversations) && (
          <div className={`${mobileView ? 'w-full' : 'w-2/3'} flex flex-col`}>
            {/* Back button for mobile view */}
            {mobileView && (
              <div className="p-3 border-b bg-white">
                <button
                  onClick={handleBackToList}
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <FaArrowLeft className="mr-2" />
                  <span>Back to conversations</span>
                </button>
              </div>
            )}
            
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => {
                if (activeConversation) {
                  getConversationMessages(activeConversation);
                }
              }}
            >
              {activeConversation ? (
                <ConversationDetail
                  messages={messages}
                  user={user}
                  selectedUser={selectedUser}
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  handleSendMessage={handleSendMessage}
                  messagesEndRef={messagesEndRef}
                />
              ) : (
                <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
                  <div className="text-center max-w-md">
                    <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                      <FaArrowLeft className="text-gray-400 text-xl" />
                    </div>
                    <h3 className="font-medium text-gray-700 text-lg">Select a conversation</h3>
                    <p className="text-gray-500 mt-2">
                      Choose a conversation from the list to start messaging or search for a specific person
                    </p>
                  </div>
                </div>
              )}
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;