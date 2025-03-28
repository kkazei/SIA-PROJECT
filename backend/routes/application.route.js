import express from 'express';
import { 
  submitApplication,
  getPropertyApplications,
  getMyApplications,
  getLandlordApplications,
  updateApplicationStatus,
  cancelApplication,
  getApplicationById
} from '../controllers/application.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Tenant routes
router.post('/', authorize('tenant'), submitApplication);
router.get('/tenant/my-applications', authorize('tenant'), getMyApplications);
router.put('/:id/cancel', authorize('tenant'), cancelApplication);

// Landlord routes
router.get('/property/:propertyId', authorize('landlord'), getPropertyApplications);
router.get('/landlord/all', authorize('landlord'), getLandlordApplications);
router.put('/:applicationId/status', authorize('landlord'), updateApplicationStatus);

// Shared route - accessible to both tenants and landlords (permission check is in the controller)
router.get('/:id', getApplicationById);

export default router;