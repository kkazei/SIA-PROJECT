import { useState } from 'react';
import { format } from 'date-fns';
import { useMessageStore } from '../../store/messageStore';

const ConversationsList = ({ conversations, activeConversation, onSelectConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { unreadCounts } = useMessageStore();

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format the timestamp to a readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      // Today - show time only
      return format(date, 'h:mm a');
    } else if (date.getFullYear() === now.getFullYear()) {
      // This year - show month and day
      return format(date, 'MMM d');
    } else {
      // Different year - show month, day and year
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-grow overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map(conversation => {
              const isActive = activeConversation === conversation.otherUser?._id;
              const unreadCount = unreadCounts[conversation.otherUser?._id] || 0;
              
              return (
                <div 
                  key={conversation.conversation_id}
                  onClick={() => onSelectConversation(conversation.otherUser?._id)}
                  className={`p-4 flex cursor-pointer hover:bg-gray-50 ${
                    isActive ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0 mr-3 overflow-hidden">
                    {conversation.otherUser?.avatar ? (
                      <img 
                        src={conversation.otherUser.avatar} 
                        alt={conversation.otherUser?.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-400 text-white text-lg font-semibold">
                        {conversation.otherUser?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-semibold truncate">
                        {conversation.otherUser?.name}
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          ({conversation.otherUser?.role})
                        </span>
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                        {formatTime(conversation.lastMessage?.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || 'No messages'}
                      </p>
                      
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {conversations.length === 0 ? 'No conversations yet' : 'No matching conversations'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;