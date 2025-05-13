import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation_id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [String],
  // Rename 'read' to 'isRead' for consistency with frontend
  isRead: {
    type: Boolean,
    default: false
  },
  // Add readAt timestamp
  readAt: {
    type: Date,
    default: null
  },
  // Add delivery status fields
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  deleted_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Existing index
messageSchema.index({ conversation_id: 1, createdAt: -1 });

// Add new indexes for efficient status queries
messageSchema.index({ sender_id: 1, receiver_id: 1, isRead: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ isDelivered: 1 });

export const Message = mongoose.model('Message', messageSchema);