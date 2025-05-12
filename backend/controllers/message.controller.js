import { Message } from '../models/message.model.js';
import { User } from '../models/user.model.js';
import { Apartment } from '../models/apartment.model.js';
import mongoose from 'mongoose';

// Helper function to generate consistent conversation IDs
const generateConversationId = (userId1, userId2) => {
  // Ensure consistent ordering to get the same ID regardless of who initiates
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Save a new message (called by socket handler and REST API)
export const saveMessage = async (messageData) => {
  try {
    const { sender_id, receiver_id, content, attachments } = messageData;
    
    // Generate conversation ID if not provided
    const conversation_id = messageData.conversation_id || 
                            generateConversationId(sender_id, receiver_id);
    
    const newMessage = new Message({
      sender_id,
      receiver_id,
      conversation_id,
      content,
      attachments: attachments || [],
      read: false
    });
    
    await newMessage.save();
    
    // Populate sender and receiver info before returning
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender_id', 'name email role avatar')
      .populate('receiver_id', 'name email role avatar');
      
    return populatedMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, messageIds) => {
  try {
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        conversation_id: conversationId 
      },
      { $set: { read: true } }
    );
    return { success: true };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    // Validate other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if landlord-tenant relationship exists
    if (req.user.role === 'landlord' && otherUser.role === 'tenant') {
      // Check if tenant is assigned to one of landlord's apartments
      const tenantApartment = await Apartment.findOne({ 
        landlord_id: currentUserId,
        tenant_id: userId
      });
      
      if (!tenantApartment) {
        return res.status(403).json({
          success: false,
          message: 'You can only message tenants who are assigned to your properties'
        });
      }
    } else if (req.user.role === 'tenant' && otherUser.role === 'landlord') {
      // Check if tenant is assigned to landlord's apartment
      const tenantApartment = await Apartment.findOne({
        landlord_id: userId,
        tenant_id: currentUserId
      });
      
      if (!tenantApartment) {
        return res.status(403).json({
          success: false,
          message: 'You can only message your landlord'
        });
      }
    }
    
    // Generate conversation ID
    const conversationId = generateConversationId(currentUserId, userId);
    
    // Get paginated messages
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'sender_id', select: 'name email role avatar' },
        { path: 'receiver_id', select: 'name email role avatar' }
      ]
    };
    
    const messages = await Message.paginate(
      { conversation_id: conversationId },
      options
    );
    
    res.status(200).json({
      success: true,
      data: messages
    });
    
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Send a new message (REST API endpoint)
export const sendMessage = async (req, res) => {
  try {
    // More detailed logging to debug
    console.log('Received message request:');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);
    
    // Check if content and receiver_id are in the request body
    if (!req.body.receiver_id || !req.body.content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }
    
    // Rest of your function remains the same
    const receiver_id = new mongoose.Types.ObjectId(req.body.receiver_id);
    const sender_id = new mongoose.Types.ObjectId(req.user.id);
    const content = req.body.content;
    
    // Check if receiver exists
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }
    
    // Validate relationship (same logic as in getConversation)
    if (req.user.role === 'landlord' && receiver.role === 'tenant') {
      const tenantApartment = await Apartment.findOne({ 
        landlord_id: sender_id,
        tenant_id: receiver_id
      });
      
      if (!tenantApartment) {
        return res.status(403).json({
          success: false,
          message: 'You can only message tenants who are assigned to your properties'
        });
      }
    } else if (req.user.role === 'tenant' && receiver.role === 'landlord') {
      const tenantApartment = await Apartment.findOne({
        landlord_id: receiver_id,
        tenant_id: sender_id
      });
      
      if (!tenantApartment) {
        return res.status(403).json({
          success: false,
          message: 'You can only message your landlord'
        });
      }
    }
    
    // Create and save message
    const savedMessage = await saveMessage({
      sender_id,
      receiver_id,
      content,
      attachments: req.files
    });
    
    res.status(201).json({
      success: true,
      data: savedMessage
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all conversations for the current user
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all messages where user is either sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            // Add 'new' keyword here:
            { sender_id: new mongoose.Types.ObjectId(userId) },
            // And here:
            { receiver_id: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$conversation_id",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$read", false] },
                  // And here:
                  { $eq: ["$receiver_id", new mongoose.Types.ObjectId(userId)] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: {
            senderId: "$lastMessage.sender_id",
            receiverId: "$lastMessage.receiver_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [
                      { $eq: ["$_id", "$$senderId"] },
                      // And here:
                      { $ne: ["$$senderId", new mongoose.Types.ObjectId(userId)] }
                    ]},
                    { $and: [
                      { $eq: ["$_id", "$$receiverId"] },
                      // And here:
                      { $ne: ["$$receiverId", new mongoose.Types.ObjectId(userId)] }
                    ]}
                  ]
                }
              }
            },
            {
              $project: {
                name: 1,
                email: 1,
                role: 1,
                avatar: 1
              }
            }
          ],
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
    
  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};