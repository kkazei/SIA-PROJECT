import mongoose from 'mongoose';
import { Message } from '../models/message.model.js';
import { User } from '../models/user.model.js';
import { Apartment } from '../models/apartment.model.js';
import { io } from '../server.js';

// Helper function to generate a unique conversation ID from two user IDs
export const generateConversationId = (id1, id2) => {
  // Sort IDs to ensure consistency regardless of parameter order
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Helper to verify if tenant and landlord can message each other
export const verifyMessagingPermission = async (tenantId, landlordId) => {
  try {
    // Verify roles
    const [tenant, landlord] = await Promise.all([
      User.findById(tenantId),
      User.findById(landlordId)
    ]);
    
    if (!tenant || tenant.role !== 'tenant') {
      return { allowed: false, message: "Invalid tenant" };
    }
    
    if (!landlord || landlord.role !== 'landlord') {
      return { allowed: false, message: "Invalid landlord" };
    }
    
    // Find if tenant is assigned to any of the landlord's apartments
    const apartment = await Apartment.findOne({
      landlord_id: landlordId,
      tenant_id: tenantId
    });
    
    if (!apartment) {
      return { allowed: false, message: "Tenant is not assigned to any of this landlord's apartments" };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error("Error verifying messaging permission:", error);
    return { allowed: false, message: "Error verifying messaging permission" };
  }
};

// Save a message
export const saveMessage = async (messageData) => {
  try {
    const { sender_id, receiver_id, content, attachments = [] } = messageData;
    
    // Generate conversation ID
    const conversation_id = generateConversationId(sender_id, receiver_id);
    
    // Create the new message
    const newMessage = new Message({
      sender_id,
      receiver_id,
      conversation_id,
      content,
      attachments,
      isRead: false,  // Changed from 'read: false'
      isDelivered: false
    });
    
    // Save the message
    const savedMessage = await newMessage.save();
    
    // Populate sender and receiver details
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender_id', 'name avatar role')
      .populate('receiver_id', 'name avatar role');
    
    return populatedMessage;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

// Send a message (HTTP endpoint)
export const sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, content, attachments } = req.body;
    
    // Validate required fields
    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and content are required"
      });
    }
    
    // Check if the users can message each other
    let permission;
    
    // If tenant messaging landlord
    if (req.user.role === 'tenant') {
      permission = await verifyMessagingPermission(sender_id, receiver_id);
    } 
    // If landlord messaging tenant
    else if (req.user.role === 'landlord') {
      permission = await verifyMessagingPermission(receiver_id, sender_id);
    } 
    // Admin can message anyone
    else if (req.user.role === 'admin') {
      permission = { allowed: true };
    } 
    else {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to send messages"
      });
    }
    
    // Check if messaging is allowed
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.message
      });
    }
    
    // Save the message
    const savedMessage = await saveMessage({
      sender_id,
      receiver_id,
      content,
      attachments
    });
    
    // Emit real-time event to receiver
    const conversation_id = generateConversationId(sender_id, receiver_id);
    io.to(receiver_id.toString()).emit('receive_message', savedMessage);
    io.to(conversation_id).emit('conversation_updated', savedMessage);
    
    // Send response
    res.status(201).json({
      success: true,
      data: savedMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending message"
    });
  }
};

// Get conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the most recent message for each conversation
    const conversations = await Message.aggregate([
      // Match messages where the user is either sender or receiver and not deleted by the user
      {
        $match: {
          $and: [
            { 
              $or: [
                { sender_id: new mongoose.Types.ObjectId(userId) },  // Use "new" here
                { receiver_id: new mongoose.Types.ObjectId(userId) } // Use "new" here
              ]
            },
            {
              deleted_by: { $ne: new mongoose.Types.ObjectId(userId) } // Use "new" here
            }
          ]
        }
      },
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },
      // Group by conversation_id
      {
        $group: {
          _id: "$conversation_id",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiver_id", new mongoose.Types.ObjectId(userId)] }, // Use "new" here
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      // Lookup the other user in the conversation
      {
        $project: {
          conversation_id: "$_id",
          lastMessage: 1,
          unreadCount: 1,
          otherUserId: {
            $cond: [
              { $eq: ["$lastMessage.sender_id", new mongoose.Types.ObjectId(userId)] }, // Use "new" here
              "$lastMessage.receiver_id",
              "$lastMessage.sender_id"
            ]
          }
        }
      },
      // Sort by the last message timestamp
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);

    // Populate the other user's details
    const populatedConversations = await Promise.all(conversations.map(async (conversation) => {
      const otherUser = await User.findById(conversation.otherUserId)
        .select('name email avatar role');
        
      return {
        ...conversation,
        otherUser
      };
    }));
    
    res.status(200).json({
      success: true,
      data: populatedConversations
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting conversations"
    });
  }
};

// Get messages for a conversation
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    
    // Check if the users can message each other
    let permission;
    
    // Get user roles
    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);
    
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify permissions based on roles
    if (currentUser.role === 'tenant' && otherUser.role === 'landlord') {
      permission = await verifyMessagingPermission(currentUserId, userId);
    } else if (currentUser.role === 'landlord' && otherUser.role === 'tenant') {
      permission = await verifyMessagingPermission(userId, currentUserId);
    } else if (currentUser.role === 'admin') {
      permission = { allowed: true };
    } else {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this conversation"
      });
    }
    
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.message
      });
    }
    
    // Generate conversation ID
    const conversation_id = generateConversationId(currentUserId, userId);
    
    // Fetch messages
    const messages = await Message.find({
      conversation_id,
      deleted_by: { $ne: currentUserId }
    })
    .sort({ createdAt: 1 })
    .populate('sender_id', 'name avatar role')
    .populate('receiver_id', 'name avatar role');
    
    // Mark all unread messages as read
    await Message.updateMany(
      { 
        conversation_id,
        receiver_id: currentUserId,
        isRead: false  // Changed from 'read: false'
      },
      { 
        isRead: true,  // Changed from 'read: true'
        readAt: new Date() // Add timestamp
      }
    );
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting conversation"
    });
  }
};