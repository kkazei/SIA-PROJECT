import { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { FiSend, FiPaperclip, FiImage, FiSmile } from 'react-icons/fi';
import { FaUser, FaCheckDouble, FaCheck } from 'react-icons/fa';
import { useMessageStore } from '../../store/messageStore';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

const ConversationDetail = ({ 
  messages, 
  user, 
  selectedUser, 
  messageInput, 
  setMessageInput, 
  handleSendMessage, 
  messagesEndRef 
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const [groupedMessages, setGroupedMessages] = useState([]);
  
  useEffect(() => {
    setAvatarLoaded(false);
  }, [selectedUser?.avatar]);
  
  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const connected = socketContext?.connected || false;
  const sendTypingIndicator = socketContext?.sendTypingIndicator || (() => {});
  const typingUsers = socketContext?.typingUsers || {};
  
  const otherUserTyping = selectedUser && typingUsers && 
    selectedUser._id && typingUsers[selectedUser._id];
  
  // Group messages by date for displaying date separators
  useEffect(() => {
    if (!messages?.length) {
      setGroupedMessages([]);
      return;
    }
    
    try {
      // Create groups of messages with date separators
      const groups = [];
      let currentDate = null;
      let currentGroup = [];
      
      messages.forEach(message => {
        const messageDate = new Date(message.createdAt);
        const messageDateStr = messageDate.toDateString();
        
        if (messageDateStr !== currentDate) {
          // Start a new group when date changes
          if (currentGroup.length > 0) {
            groups.push({
              type: 'messages',
              date: currentDate,
              messages: currentGroup
            });
          }
          
          // Add a date separator
          groups.push({
            type: 'dateSeparator',
            date: messageDateStr
          });
          
          currentDate = messageDateStr;
          currentGroup = [message];
        } else {
          currentGroup.push(message);
        }
      });
      
      // Add the last group
      if (currentGroup.length > 0) {
        groups.push({
          type: 'messages',
          date: currentDate,
          messages: currentGroup
        });
      }
      
      setGroupedMessages(groups);
    } catch (err) {
      console.error('Error grouping messages:', err);
      // Fallback to ungrouped messages
      setGroupedMessages([{
        type: 'messages',
        date: null,
        messages: messages
      }]);
    }
  }, [messages]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageInput]);
  
  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      return '';
    }
  };
  
  const formatDateSeparator = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      
      if (isToday(date)) {
        return 'Today';
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMMM d, yyyy');
      }
    } catch (error) {
      return dateStr;
    }
  };
  
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (!isTyping && e.target.value.trim() && selectedUser?._id) {
      setIsTyping(true);
      sendTypingIndicator(true, selectedUser._id);
    }
    
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    typingTimerRef.current = setTimeout(() => {
      if (selectedUser?._id) {
        setIsTyping(false);
        sendTypingIndicator(false, selectedUser._id);
      }
    }, 3000);
  };
  
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      if (selectedUser && selectedUser._id && sendTypingIndicator) {
        sendTypingIndicator(false, selectedUser._id);
      }
    };
  }, [selectedUser, sendTypingIndicator]);
  
  return (
    <>
      <div className="p-3 border-b bg-white flex items-center shadow-sm">
        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3 relative flex items-center justify-center">
          {selectedUser?.avatar ? (
            <>
              {!avatarLoaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300"></div>}
              <img 
                src={selectedUser.avatar} 
                alt=""
                className={`h-full w-full object-cover transition-opacity duration-300 ${avatarLoaded ? 'opacity-100' : 'opacity-0'}`}
                onError={() => setAvatarLoaded(true)} 
                onLoad={() => setAvatarLoaded(true)}
              />
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
              {selectedUser?.name?.[0]?.toUpperCase() || <FaUser className="text-white" />}
            </div>
          )}
          
          {/* Online status indicator */}
          {selectedUser?.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            {selectedUser?.name || (
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
            )}
          </h3>
          <p className="text-xs text-gray-500 flex items-center">
            {selectedUser?.isOnline ? (
              <><span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span> Online</>
            ) : selectedUser?.lastSeen ? (
              `Last seen ${format(new Date(selectedUser.lastSeen), 'h:mm a')}`
            ) : selectedUser?.role ? (
              selectedUser.role
            ) : (
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50 scroll-smooth">
        <div className="space-y-3 max-w-3xl mx-auto">
          {groupedMessages.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-3">
                <FiSend className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm">Send a message to start the conversation</p>
            </div>
          )}
          
          {groupedMessages.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`}>
              {group.type === 'dateSeparator' && (
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 rounded-full px-4 py-1 text-xs font-medium text-gray-600">
                    {formatDateSeparator(group.date)}
                  </div>
                </div>
              )}
              
              {group.type === 'messages' && group.messages.map((message) => {
                const isOwnMessage = user && message.sender_id && 
                  message.sender_id._id === user.id;
                
                const messageKey = message._id?.startsWith('temp-') ? message._id : `msg-${message._id}`;
                
                return (
                  <motion.div 
                    key={messageKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwnMessage && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2 mt-1 flex-shrink-0">
                        {selectedUser?.avatar ? (
                          <img 
                            src={selectedUser.avatar} 
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = '';
                              e.target.className = 'hidden';
                              e.target.parentNode.innerHTML = `<div class="h-full w-full flex items-center justify-center bg-blue-500 text-white font-semibold">${selectedUser?.name?.[0]?.toUpperCase() || ''}</div>`;
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-semibold">
                            {selectedUser?.name?.[0]?.toUpperCase() || <FaUser />}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white'} rounded-2xl p-3 shadow-sm`}>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'} flex items-center justify-end space-x-1`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        
                        {isOwnMessage && (
                          <span className="ml-1">
                            {message._id?.startsWith('temp-') ? (
                              <span className="text-blue-200 text-xs">sending...</span>
                            ) : message.isRead ? (
                              <FaCheckDouble className="text-blue-200" title="Read" />
                            ) : message.isDelivered ? (
                              <FaCheckDouble className="text-blue-300 opacity-70" title="Delivered" />
                            ) : (
                              <FaCheck className="text-blue-300 opacity-70" title="Sent" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isOwnMessage && (
                      <div className="w-8 flex-shrink-0">
                        {/* Space for balancing */}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
          
          <AnimatePresence>
            {otherUserTyping && (
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2 flex-shrink-0">
                  {selectedUser?.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-semibold">
                      {selectedUser?.name?.[0]?.toUpperCase() || <FaUser />}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm max-w-[70%]">
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-gray-400"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-gray-400" 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-gray-400"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-3 border-t bg-white">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }} className="flex space-x-2">
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
            disabled={!selectedUser}
            title="Attach files"
          >
            <FiPaperclip className="h-5 w-5" />
          </button>
          
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
            disabled={!selectedUser}
            title="Add images"
          >
            <FiImage className="h-5 w-5" />
          </button>
          
          <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={handleInputChange}
              placeholder={selectedUser ? "Type a message..." : "Select a conversation to start messaging"}
              className="flex-grow p-3 border rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none w-full max-h-32 bg-gray-50"
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
              type="button" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-100"
              disabled={!selectedUser}
              title="Add emoji"
            >
              <FiSmile className="h-5 w-5" />
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={!messageInput.trim() || !selectedUser}
            className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
              messageInput.trim() && selectedUser 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <FiSend className="h-5 w-5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default ConversationDetail;