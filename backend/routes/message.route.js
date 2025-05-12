import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getConversation,
  sendMessage,
  getUserConversations
} from '../controllers/message.controller.js';

const router = express.Router();

// Apply auth middleware to all message routes
router.use(verifyToken);

// Get all conversations for current user
router.get('/conversations', getUserConversations);

// Get conversation with specific user
router.get('/conversations/:userId', getConversation);

// Send a message
router.post('/', sendMessage);

export default router;