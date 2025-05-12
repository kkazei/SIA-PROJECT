import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

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
    required: [true, 'Message content is required'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: String,
    type: String, // 'image', 'document', etc.
    name: String
  }]
}, { timestamps: true });

// Create a compound index for efficient conversation queries
messageSchema.index({ conversation_id: 1, createdAt: -1 });

// Add pagination plugin
messageSchema.plugin(mongoosePaginate);

export const Message = mongoose.model('Message', messageSchema);