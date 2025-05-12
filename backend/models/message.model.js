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
  read: {
    type: Boolean,
    default: false
  },
  deleted_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Create a compound index for efficient message retrieval
messageSchema.index({ conversation_id: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);