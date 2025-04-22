import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import { 
  uploadLeaseDocument, 
  getTenantLeaseDocuments, 
  getLeaseDocument,
  deleteLeaseDocument, 
  uploadLeaseMiddleware 
} from '../controllers/lease.controller.js';

const router = express.Router();

// Upload a new lease document (accessible to landlords only)
router.post('/upload', verifyToken, authorize('landlord'), uploadLeaseMiddleware, uploadLeaseDocument);

// Get all lease documents for a tenant
// Both landlords and tenants can access, but tenants should only access their own documents
router.get('/tenant/:tenant_id', verifyToken, getTenantLeaseDocuments);

// Get a specific lease document (both landlords and tenants can access)
router.get('/:id', verifyToken, getLeaseDocument);

// Delete a lease document (only landlords can delete)
router.delete('/:id', verifyToken, authorize('landlord'), deleteLeaseDocument);

export default router;