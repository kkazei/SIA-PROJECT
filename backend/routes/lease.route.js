import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { 
  uploadLeaseDocument, 
  getTenantLeaseDocuments, 
  getLeaseDocument,
  deleteLeaseDocument, 
  uploadLeaseMiddleware 
} from '../controllers/lease.controller.js';

const router = express.Router();

// All lease routes require authentication
router.use(verifyToken);

// Upload a new lease document
router.post('/upload', uploadLeaseMiddleware, uploadLeaseDocument);

// Get all lease documents for a tenant
router.get('/tenant/:tenant_id', getTenantLeaseDocuments);

// Get a specific lease document
router.get('/:id', getLeaseDocument);

// Delete a lease document
router.delete('/:id', deleteLeaseDocument);

export default router;