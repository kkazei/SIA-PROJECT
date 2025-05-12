import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ConversationListItem = ({ conversation, isActive, unreadCount = 0, onClick }) => {
  const { lastMessage, otherUser } = conversation;
  
  // Format the last message time
  const formattedTime = lastMessage?.createdAt 
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
    : '';
  
  // Extract preview text from last message
  const previewText = lastMessage?.content || 'New conversation';
  
  // Get appropriate styling based on active state and unread messages
  const containerClasses = `flex items-center p-3 border-b cursor-pointer transition-colors ${
    isActive 
      ? 'bg-blue-50 border-blue-100' 
      : unreadCount > 0
        ? 'bg-gray-50 hover:bg-gray-100' 
        : 'hover:bg-gray-100'
  }`;
  
  return (
    <div className={containerClasses} onClick={onClick}>
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            {otherUser?.avatar ? (
              <img 
                src={otherUser.avatar} 
                alt={otherUser.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-300">
                <span className="text-gray-600 text-lg font-medium">
                  {otherUser?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
          
          {/* Online indicator */}
          {otherUser?.online && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
      </div>
      
      {/* Conversation details */}
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium text-gray-900 truncate">
            {otherUser?.name || 'Unknown User'}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {formattedTime}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
            {previewText}
          </p>
          
          {/* Unread indicator */}
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;