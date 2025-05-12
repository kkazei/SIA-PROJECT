import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  sendMessage,
  getConversations,
  getConversation
} from '../controllers/message.controller.js';

const router = express.Router();

// Protect all routes
router.use(verifyToken);

// Send a message
router.post('/', sendMessage);

// Get all conversations
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/:userId', getConversation);

export default router;