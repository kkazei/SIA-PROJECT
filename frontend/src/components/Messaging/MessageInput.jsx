import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaImage, FaTimes } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';

const MessageInput = ({ onSendMessage, receiverId, conversationId }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { emitTyping, emitStopTyping } = useSocket();
  
  // Handle typing indicators with debouncing
  useEffect(() => {
    if (!message || !receiverId) return;
    
    if (message && !isTyping) {
      setIsTyping(true);
      emitTyping(receiverId);
    }
    
    // Debounce stop typing event
    const typingTimer = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitStopTyping(receiverId);
      }
    }, 2000);
    
    return () => clearTimeout(typingTimer);
  }, [message, isTyping, receiverId, emitTyping, emitStopTyping]);
  
  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (isTyping && receiverId) {
        emitStopTyping(receiverId);
      }
    };
  }, [isTyping, receiverId, emitStopTyping]);
  
  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if ((!message.trim() && attachments.length === 0) || !receiverId) return;
    
    onSendMessage(message.trim(), attachments);
    
    // Clear form
    setMessage('');
    setAttachments([]);
    setPreviews([]);
    
    // Stop typing indicator
    setIsTyping(false);
    emitStopTyping(receiverId);
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Add new files to attachments
    setAttachments(prev => [...prev, ...files]);
    
    // Create previews for images
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return {
          file,
          preview: URL.createObjectURL(file),
          type: 'image'
        };
      }
      
      return {
        file,
        name: file.name,
        type: 'file'
      };
    });
    
    setPreviews(prev => [...prev, ...newPreviews]);
  };
  
  // Handle removing an attachment
  const handleRemoveAttachment = (index) => {
    // Release object URL to prevent memory leaks
    if (previews[index].preview) {
      URL.revokeObjectURL(previews[index].preview);
    }
    
    // Remove from state
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {/* Attachment previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {preview.type === 'image' ? (
                <div className="h-20 w-20 rounded overflow-hidden border border-gray-300">
                  <img 
                    src={preview.preview} 
                    alt="Attachment preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded flex items-center justify-center bg-gray-100 border border-gray-300 p-2">
                  <div className="text-xs text-center overflow-hidden text-gray-700">
                    {preview.name}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => handleRemoveAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Message input form */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="text-gray-500 hover:text-blue-500 transition-colors self-end p-2"
        >
          <FaImage size={18} />
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <div className="flex-grow relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() && attachments.length === 0}
          className={`p-3 rounded-full ${
            !message.trim() && attachments.length === 0
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } transition-colors`}
        >
          <FaPaperPlane size={16} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;