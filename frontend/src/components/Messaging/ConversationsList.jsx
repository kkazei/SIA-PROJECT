import React, { useEffect, useState } from 'react';
import ConversationListItem from './ConversationListItem';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import { useApartmentStore } from '../../store/apartmentStore'; // Add this import
import { format } from 'date-fns';

const ConversationsList = ({ onSelectConversation, activeConversationId }) => {
  const { 
    conversations, 
    fetchConversations,
    getOrCreateConversation,
    unreadCounts,
    isLoading 
  } = useMessageStore();
  
  const { user } = useAuthStore();
  const { onlineUsers, isUserOnline } = useSocket();
  
  // For tenant - to get landlord info
  const { getTenantApartment } = useApartmentStore();
  
  const [landlordId, setLandlordId] = useState(null);
  
  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
    
    // If user is tenant, get their apartment to find the landlord
    if (user?.role === 'tenant') {
      const fetchLandlord = async () => {
        const apartment = await getTenantApartment();
        
        // Extract the ID correctly from the landlord object
        if (apartment && apartment.landlord_id) {
          // Check if landlord_id is an object with _id or a string
          const id = typeof apartment.landlord_id === 'object' 
            ? apartment.landlord_id._id  // Use the _id from the object
            : apartment.landlord_id;     // Use directly if it's already a string
            
          setLandlordId(id);
        }
      };
      
      fetchLandlord();
    }
  }, [fetchConversations, user?.role, getTenantApartment]);
  
  // Add online status to conversations
  const conversationsWithStatus = conversations.map(conversation => ({
    ...conversation,
    otherUser: {
      ...conversation.otherUser,
      online: onlineUsers.has(conversation.otherUser?._id)
    }
  }));
  
  // Handle messaging landlord
  const handleMessageLandlord = async () => {
    if (!landlordId) return;
    
    try {
      const conversation = await getOrCreateConversation(landlordId);
      if (conversation) {
        onSelectConversation(conversation);
      }
    } catch (error) {
      console.error("Error starting conversation with landlord:", error);
    }
  };
  
  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };
  
  // Check if a user is online - with safety check
  const checkUserOnline = (userId) => {
    // Add defensive check to avoid the error
    try {
      if (typeof isUserOnline === 'function') {
        return isUserOnline(userId);
      }
      return false; // Default: not online
    } catch (error) {
      console.log("Error checking online status:", error);
      return false;
    }
  };
  
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Add Message Landlord button for tenants */}
      {user?.role === 'tenant' && landlordId && (
        <div className="p-3 border-b">
          <button
            onClick={handleMessageLandlord}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 4v16m8-8H4" />
            </svg>
            Message Landlord
          </button>
        </div>
      )}
      
      <div className="overflow-y-auto flex-grow">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4 text-center">
            <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium mb-1">No conversations yet</p>
            <p className="text-sm">
              {user?.role === 'tenant' 
                ? "Start a conversation with your landlord using the button above" 
                : "Your conversations with tenants will appear here"}
            </p>
          </div>
        ) : (
          conversationsWithStatus.map(conversation => (
            <ConversationListItem
              key={conversation._id}
              conversation={conversation}
              isActive={activeConversationId === conversation._id}
              unreadCount={unreadCounts[conversation._id] || 0}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationsList;