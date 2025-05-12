import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';

const ConversationDetail = ({ conversation, onBackClick }) => {
  const {
    messages,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    currentConversation,
    userTyping,
    loading
  } = useMessageStore();
  
  const { user } = useAuthStore();
  const { joinConversation, leaveConversation, markAsRead } = useSocket();
  const messagesEndRef = useRef(null);
  
  // Join conversation room on mount
  useEffect(() => {
    if (conversation?._id) {
      joinConversation(conversation._id);
      
      // Get messages when conversation changes
      fetchMessages(conversation.otherUser?._id);
      
      return () => {
        leaveConversation(conversation._id);
      };
    }
  }, [conversation, joinConversation, leaveConversation, fetchMessages]);
  
  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (conversation?._id && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => !msg.read && msg.sender_id._id !== user?.id
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg._id);
        markAsRead(conversation._id, messageIds);
        markMessagesAsRead(conversation._id);
      }
    }
  }, [conversation, messages, markAsRead, markMessagesAsRead, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async (content, attachments) => {
    if (!conversation?.otherUser?._id) return;
    
    // Extract the actual user ID if it's a temporary conversation
    let receiverId = conversation.otherUser._id;
    
    // If we have a temporary conversation (ID starts with 'temp_')
    // Get the user ID directly from the otherUser object
    if (conversation._id && conversation._id.startsWith('temp_')) {
      console.log('Sending first message in temp conversation');
    }
    
    await sendMessage(receiverId, content, attachments);
  };
  
  // Handle loading more messages
  const handleLoadMore = () => {
    if (currentConversation?.hasMoreMessages) {
      fetchMessages(
        conversation.otherUser._id,
        currentConversation.currentPage + 1
      );
    }
  };
  
  if (!conversation) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 border-l">
        <div className="text-center p-6">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No conversation selected</h3>
          <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full border-l">
      {/* Conversation header */}
      <div className="border-b flex items-center p-3 bg-white shadow-sm">
        <button 
          onClick={onBackClick}
          className="md:hidden mr-3 text-gray-500"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex-shrink-0 mr-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              {conversation.otherUser?.avatar ? (
                <img 
                  src={conversation.otherUser.avatar} 
                  alt={conversation.otherUser.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-600 text-lg font-medium">
                    {conversation.otherUser?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            
            {conversation.otherUser?.online && (
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
        </div>
        
        <div className="flex-grow">
          <h2 className="font-medium text-gray-900">
            {conversation.otherUser?.name || 'Unknown User'}
          </h2>
          <p className="text-xs text-gray-500">
            {conversation.otherUser?.online ? 'Online' : 'Offline'}
            {conversation.otherUser?.role && ` • ${conversation.otherUser.role.charAt(0).toUpperCase() + conversation.otherUser.role.slice(1)}`}
          </p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {/* Load more button */}
        {currentConversation?.hasMoreMessages && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-1">↻</span> 
                  Loading...
                </>
              ) : (
                'Load earlier messages'
              )}
            </button>
          </div>
        )}
        
        {/* Messages */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map(message => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={message.sender_id._id === user?.id}
              />
            ))
          )}
        </div>
        
        {/* Typing indicator */}
        {userTyping === conversation.otherUser?._id && (
          <div className="text-gray-500 text-sm mt-2 flex items-center">
            <div className="flex space-x-1 mr-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>{conversation.otherUser?.name} is typing...</span>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        receiverId={conversation.otherUser?._id}
        conversationId={conversation._id}
      />
    </div>
  );
};

export default ConversationDetail;