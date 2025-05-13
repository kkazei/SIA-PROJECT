import { saveMessage } from '../controllers/message.controller.js';
import { Message } from '../models/message.model.js'; // Add this import

const messageHandler = (io, socket) => {
  // Handle sending messages
  socket.on('send_message', async (payload) => {
    try {
      console.log('Socket message received from user:', socket.user.id);
      const { receiver_id, content, attachments, tempId } = payload;
      
      // Save message to database using the controller function
      const savedMessage = await saveMessage({
        sender_id: socket.user.id,
        receiver_id,
        content,
        attachments
      });
      
      // Calculate conversation ID
      const sortedIds = [socket.user.id, receiver_id].sort();
      const conversation_id = `${sortedIds[0]}_${sortedIds[1]}`;
      
      // Send confirmation back to sender with the tempId
      socket.emit('message_confirmation', { 
        tempId, 
        message: savedMessage 
      });
      
      // Emit message to receiver directly
      socket.to(receiver_id).emit('receive_message', savedMessage);
      
      // Emit to conversation room for anyone viewing the conversation
      socket.to(conversation_id).emit('receive_message', savedMessage);
      
      console.log('Message sent successfully via socket');
    } catch (error) {
      console.error('Socket message error:', error);
      // Notify sender of the error
      socket.emit('message_error', {
        tempId: payload.tempId,
        error: 'Failed to send message. Please try again.'
      });
    }
  });
  
  // Handle joining a conversation
  socket.on('join_conversation', ({ conversationId }) => {
    console.log(`User ${socket.user.id} joining conversation: ${conversationId}`);
    socket.join(conversationId);
  });
  
  // Handle leaving a conversation
  socket.on('leave_conversation', ({ conversationId }) => {
    console.log(`User ${socket.user.id} leaving conversation: ${conversationId}`);
    socket.leave(conversationId);
  });
  
  // Handle typing indicators
  socket.on('typing_start', ({ receiver_id }) => {
    console.log(`User ${socket.user.id} typing to: ${receiver_id}`);
    io.to(receiver_id).emit('typing_indicator', {
      user_id: socket.user.id,
      typing: true
    });
  });
  
  socket.on('typing_stop', ({ receiver_id }) => {
    io.to(receiver_id).emit('typing_indicator', {
      user_id: socket.user.id,
      typing: false
    });
  });
  
  // Handle message read status
  socket.on('mark_read', async ({ message_ids }) => {
    try {
      // Update read status in database
      // ... (implement this)
      
      // Notify senders their messages were read
      // ... (implement this)
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Add this near the top to track recent updates
  const recentReadUpdates = new Map();

  // Modify your mark_messages_read handler to add debouncing
  socket.on('mark_messages_read', async ({ sender_id }) => {
    try {
      // Create a key for this specific update
      const updateKey = `${socket.user.id}-${sender_id}`;
      const now = Date.now();
      
      // Check if we've processed a similar update recently (within 3 seconds)
      if (recentReadUpdates.has(updateKey) && 
          now - recentReadUpdates.get(updateKey) < 3000) {
        return; // Skip this update, too soon after previous one
      }
      
      // Record this update time
      recentReadUpdates.set(updateKey, now);
      
      // Clean up old entries every minute
      if (now % 60000 < 1000) {
        for (const [key, timestamp] of recentReadUpdates.entries()) {
          if (now - timestamp > 60000) recentReadUpdates.delete(key);
        }
      }
      
      console.log(`User ${socket.user.id} marking messages from ${sender_id} as read`);
      
      // Update read status in database
      const result = await Message.updateMany(
        { 
          sender_id: sender_id,
          receiver_id: socket.user.id,
          isRead: false 
        },
        { 
          $set: {
            isRead: true, 
            readAt: new Date()
          }
        }
      );
      
      console.log(`Updated ${result.modifiedCount} messages to read status`);
      
      // Find all updated messages to get their IDs
      const updatedMessages = await Message.find({
        sender_id: sender_id,
        receiver_id: socket.user.id,
        isRead: true
      }).select('_id');
      
      const messageIds = updatedMessages.map(msg => msg._id);
      
      // Notify sender their messages were read with message IDs
      if (messageIds.length > 0) {
        io.to(sender_id).emit('messages_read', {
          reader_id: socket.user.id,
          timestamp: new Date().toISOString(),
          message_ids: messageIds // Send the IDs of messages that were marked as read
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle message delivery receipt
  socket.on('message_delivered', ({ message_id }) => {
    // Find message sender and emit delivery confirmation
    Message.findById(message_id)
      .then(message => {
        if (message && message.sender_id) {
          io.to(message.sender_id.toString()).emit('delivery_confirmation', {
            message_id,
            delivered_to: socket.user.id,
            timestamp: new Date()
          });
        }
      })
      .catch(err => console.error('Error processing delivery receipt:', err));
  });
};

export default messageHandler;