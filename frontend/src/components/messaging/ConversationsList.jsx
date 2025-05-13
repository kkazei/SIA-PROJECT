import { useState, useEffect, useMemo } from 'react';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { useMessageStore } from '../../store/messageStore';
import { FaUser, FaSearch, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ConversationsList = ({ conversations, activeConversation, onSelectConversation, hideHeader = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingStates, setLoadingStates] = useState({});
  const { unreadCounts } = useMessageStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Memoize filtered conversations for performance
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    
    return conversations.filter(conv => 
      conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);
  
  // Improved timestamp formatting
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else if (isThisYear(date)) {
        return format(date, 'MMM d');
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleImageError = (userId) => {
    setLoadingStates(prev => ({...prev, [userId]: 'error'}));
  };

  const handleImageLoad = (userId) => {
    setLoadingStates(prev => ({...prev, [userId]: 'loaded'}));
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && (
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="mt-2 relative">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full p-2 pl-10 pr-10 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {hideHeader && (
        <div className="px-4 pt-2 pb-2 relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full p-2 pl-10 pr-10 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Empty state when no conversations match search */}
      {searchTerm && filteredConversations.length === 0 && (
        <div className="p-6 text-center">
          <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-3">
            <FaSearch className="text-gray-400 text-xl" />
          </div>
          <h3 className="font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500 text-sm mt-1">
            We couldn't find any conversations matching "{searchTerm}"
          </p>
          <button 
            onClick={clearSearch}
            className="mt-4 text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      )}
      
      {/* Conversation List */}
      <div className="flex-grow overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map(conversation => {
              const isActive = activeConversation === conversation.otherUser?._id;
              const unreadCount = unreadCounts[conversation.otherUser?._id] || 0;
              const userId = conversation.otherUser?._id || 'unknown';
              const hasAvatar = !!conversation.otherUser?.avatar;
              const loadingState = loadingStates[userId];
              
              return (
                <motion.div 
                  key={conversation.conversation_id || userId}
                  onClick={() => onSelectConversation(conversation.otherUser?._id)}
                  className={`p-4 flex cursor-pointer hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50' : ''
                  }`}
                  whileHover={{ backgroundColor: isActive ? 'rgba(219, 234, 254, 1)' : 'rgba(249, 250, 251, 1)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Avatar with improved loading state */}
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 mr-3 overflow-hidden relative">
                    {hasAvatar ? (
                      <>
                        {loadingState !== 'loaded' && (
                          <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-gray-300">
                            <FaUser className="text-gray-400 text-lg" />
                          </div>
                        )}
                        <img 
                          src={conversation.otherUser.avatar} 
                          alt=""
                          className={`h-full w-full object-cover transition-opacity duration-200 ${loadingState === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                          onError={() => handleImageError(userId)}
                          onLoad={() => handleImageLoad(userId)}
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg font-semibold">
                        {conversation.otherUser?.name?.[0]?.toUpperCase() || <FaUser />}
                      </div>
                    )}
                    
                    {/* Online indicator could be added here */}
                    {conversation.otherUser?.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate text-gray-800">
                        {conversation.otherUser?.name || 'Unknown User'}
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          {conversation.otherUser?.role && `(${conversation.otherUser.role})`}
                        </span>
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                        {formatTime(conversation.lastMessage?.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                        {conversation.lastMessage?.content || 'Start a conversation'}
                      </p>
                      
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 font-medium">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : !searchTerm && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-3">
              <FaUser className="text-gray-400 text-xl" />
            </div>
            <h3 className="font-medium text-gray-700">No conversations yet</h3>
            <p className="text-gray-500 text-sm mt-1">
              Start messaging with tenants or landlords
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;