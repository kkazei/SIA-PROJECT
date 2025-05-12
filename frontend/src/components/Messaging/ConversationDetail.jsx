import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';

// Add this function at the top of your component
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // If invalid date, return empty string
  if (isNaN(messageDate)) return '';
  
  // Same day - show time only
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // This week (within 7 days) - show day name and time
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(now.getDate() - 6);
  if (messageDate >= sixDaysAgo) {
    return messageDate.toLocaleDateString([], { weekday: 'short' }) + 
           ' at ' + 
           messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Older - show full date
  return messageDate.toLocaleDateString([], { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

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
  
  const renderMessages = () => {
    if (!messages.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
          <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-center">No messages yet. Send a message to start the conversation.</p>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col-reverse p-4 space-y-reverse space-y-3 overflow-y-auto">
        {messages.map((message) => {
          // Determine if the message is from the current user by comparing IDs
          const isCurrentUser = message.sender_id?._id === user.id;
          
          return (
            <div 
              key={message._id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg p-3 ${
                  isCurrentUser 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="break-words">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm underline"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {attachment.filename || 'Attachment'}
                      </a>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1 text-right">
                  {formatTimestamp(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
        {renderMessages()}
        
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