import express from 'express';
import { 
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty, 
  deleteProperty 
} from '../controllers/property.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all protected routes
router.use(verifyToken);

// Public routes that don't require authentication
router.get('/', getAllProperties);

// IMPORTANT: Place specific routes before parameterized routes
router.get('/landlord/my-properties', authorize('landlord'), getMyProperties);

// Create property - only landlords can create
router.post('/', authorize('landlord'), createProperty);

// Routes with parameters
router.get('/:id', getPropertyById);
router.put('/:id', authorize('landlord'), updateProperty);
router.delete('/:id', authorize('landlord'), deleteProperty);

export default router;