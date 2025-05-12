import { saveMessage } from '../controllers/message.controller.js';

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
};

export default messageHandler;