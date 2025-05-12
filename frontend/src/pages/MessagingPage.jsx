import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { useSocket } from '../context/SocketContext';
import ConversationsList from '../components/messaging/ConversationsList';
import ConversationDetail from '../components/messaging/ConversationDetail';
import { generateConversationId } from '../utils/helpers';

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
  const socketStatus = socketContext?.socketStatus || {};
  
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
    initUser
  } = useMessageStore();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  
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
    console.log("Socket status:", socketStatus);
    
    // Always fetch conversations on load
    getConversations();
    
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
    if (userId && user) {
      console.log("Direct conversation requested with:", userId);
      handleSelectConversation(userId);
    }
  }, [userId, user, conversations]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle conversation selection
  const handleSelectConversation = async (userId) => {
    try {
      console.log("Selecting conversation with:", userId);
      
      // Leave previous conversation if any
      if (activeConversation && user) {
        const prevConvId = generateConversationId(user.id, activeConversation);
        leaveConversation(prevConvId);
      }
      
      // Load conversation messages
      await getConversationMessages(userId);
      const selectedUserData = conversations.find(c => c.otherUser._id === userId)?.otherUser;
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
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {!connected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm">
          <p>Socket connection unavailable. Messages will be sent using HTTP fallback.</p>
        </div>
      )}
      
      <div className="flex flex-grow overflow-hidden">
        {/* Conversation List Sidebar */}
        <div className="w-1/3 border-r bg-white overflow-y-auto">
          <ConversationsList 
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
          />
        </div>
        
        {/* Conversation Detail */}
        <div className="w-2/3 flex flex-col">
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
            <div className="flex-grow flex items-center justify-center bg-gray-50">
              <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;