import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import { useMessageStore } from '../../store/messageStore';
import { useSocket } from '../../context/SocketContext';

// Update props to match what MessagingPage is sending
const ConversationDetail = ({ 
  messages, 
  user, 
  selectedUser, 
  messageInput,  // Accept messageInput from props
  setMessageInput, // Accept setMessageInput from props
  handleSendMessage, // Accept handleSendMessage from props
  messagesEndRef 
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  
  // We don't need these anymore since we're getting them as props
  // const { sendMessage, sendMessageSocket } = useMessageStore();
  
  // Safely destructure socket context with fallbacks
  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const connected = socketContext?.connected || false;
  const sendTypingIndicator = socketContext?.sendTypingIndicator || (() => {});
  const typingUsers = socketContext?.typingUsers || {};
  
  // Check if the other user is typing - with safe access
  const otherUserTyping = selectedUser && typingUsers && 
    selectedUser._id && typingUsers[selectedUser._id];
  
  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]); // Use messageInput from props
  
  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      return ''; // Return empty string if date is invalid
    }
  };
  
  // Handle message input change - update to use props
  const handleInputChange = (e) => {
    // Use setMessageInput from props
    setMessageInput(e.target.value);
    
    // Handle typing indicator - with safe access
    if (!isTyping && e.target.value && selectedUser && 
        selectedUser._id && sendTypingIndicator) {
      setIsTyping(true);
      sendTypingIndicator(true, selectedUser._id);
    }
    
    // Clear previous timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    // Set a new timer
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedUser && selectedUser._id && sendTypingIndicator) {
        sendTypingIndicator(false, selectedUser._id);
      }
    }, 2000);
  };
  
  // Clean up typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Clear typing indicator when component unmounts
      if (selectedUser && selectedUser._id && sendTypingIndicator) {
        sendTypingIndicator(false, selectedUser._id);
      }
    };
  }, [selectedUser, sendTypingIndicator]);
  
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden mr-3">
          {selectedUser?.avatar ? (
            <img 
              src={selectedUser.avatar} 
              alt={selectedUser?.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-400 text-white font-semibold">
              {selectedUser?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold">{selectedUser?.name || 'Loading...'}</h3>
          <p className="text-xs text-gray-500">{selectedUser?.role || ''}</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-3">
          {messages.map((message) => {
            // Safe check for sender ID
            const isOwnMessage = user && message.sender_id && 
              message.sender_id._id === user.id;
            
            // Use a unique key that won't have collisions between temp and confirmed messages
            const messageKey = message._id.startsWith('temp-') ? message._id : `msg-${message._id}`;
            
            return (
              <div 
                key={messageKey}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white'} rounded-lg p-3 shadow`}>
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'} text-right`}>
                    {formatMessageTime(message.createdAt)}
                    {message._id.startsWith('temp-') && <span className="ml-2 opacity-70">✓</span>}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3 shadow max-w-[70%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* This element is used to scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }} className="flex space-x-2">
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={!selectedUser}
          >
            <FiPaperclip className="h-5 w-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            value={messageInput}
            onChange={handleInputChange}
            placeholder={selectedUser ? "Type a message..." : "Select a conversation to start messaging"}
            className="flex-grow p-2 border rounded-md focus:outline-none focus:border-blue-500 resize-none max-h-32"
            rows="1"
            disabled={!selectedUser}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && selectedUser) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <button 
            type="submit" 
            disabled={!messageInput.trim() || !selectedUser}
            className={`p-2 rounded-md ${
              messageInput.trim() && selectedUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
            } focus:outline-none`}
          >
            <FiSend className="h-5 w-5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default ConversationDetail;