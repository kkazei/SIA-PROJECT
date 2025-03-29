import express from 'express';
import { 
  createInquiry, 
  getAllInquiries, 
  getInquiriesByTenant, 
  getInquiryById, 
  updateInquiryStatus, 
  updateInquiry, 
  deleteInquiry,
  getInquiriesByStatus,
  getInquiriesByCategory
} from '../controllers/inquiry.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new inquiry
router.post('/', verifyToken, createInquiry);

// Get all inquiries
router.get('/', verifyToken, getAllInquiries);

// Get inquiries by tenant ID
router.get('/tenant/:tenantId', verifyToken, getInquiriesByTenant);

// Get inquiries by status
router.get('/status/:status', verifyToken, getInquiriesByStatus);

// Get inquiries by category
router.get('/category/:category', verifyToken, getInquiriesByCategory);

// Get inquiry by ID
router.get('/:id', verifyToken, getInquiryById);

// Update inquiry status
router.patch('/:id/status', verifyToken, updateInquiryStatus);

// Update inquiry details
router.put('/:id', verifyToken, updateInquiry);

// Delete inquiry
router.delete('/:id', verifyToken, deleteInquiry);

export default router;