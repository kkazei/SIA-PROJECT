import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const MessageBubble = ({ message, isOwnMessage }) => {
  // Format timestamp
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex max-w-[75%]">
        {/* Avatar for other user's messages */}
        {!isOwnMessage && (
          <div className="flex-shrink-0 mr-3">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender_id?.avatar ? (
                <img 
                  src={message.sender_id.avatar} 
                  alt={message.sender_id.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-600 text-sm font-medium">
                    {message.sender_id?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-col">
          <div 
            className={`px-4 py-2 rounded-lg ${
              isOwnMessage 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-gray-200 text-gray-800 rounded-tl-none'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            
            {/* Attachments if any */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center">
                    {attachment.type.startsWith('image/') ? (
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={attachment.url} 
                          alt={attachment.name || 'Attachment'} 
                          className="max-h-40 rounded"
                        />
                      </a>
                    ) : (
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center p-2 rounded ${
                          isOwnMessage ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm truncate max-w-xs">
                          {attachment.name || 'Attachment'}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formattedTime}
            
            {/* Read receipt for own messages */}
            {isOwnMessage && (
              <span className="ml-2">
                {message.read ? (
                  <svg className="h-3 w-3 text-blue-500 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3 text-gray-400 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;