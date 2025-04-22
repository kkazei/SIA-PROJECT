import express from 'express';
import { 
  uploadAndCreatePayment, 
  getAllPayments, 
  getTenantPayments, 
  getPaymentById,
  updatePaymentStatus,
  uploadMiddleware
} from '../controllers/payment.controller.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Payment route is working!' });
});

// Upload payment proof and create payment record (combined endpoint)
router.post('/upload-and-create', uploadMiddleware, uploadAndCreatePayment);

// Get all payments (admin route)
router.get('/', getAllPayments);

// Get payments for a specific tenant
router.get('/tenant/:tenant_id', getTenantPayments);

// Get a specific payment by ID
router.get('/:id', getPaymentById);

// Update payment status (admin route)
router.put('/:id', updatePaymentStatus);

export default router;
