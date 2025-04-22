import Payment from '../models/payment.model.js';
import { Apartment } from "../models/apartment.model.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory for payment proofs if it doesn't exist
const paymentProofsDir = path.join(__dirname, '../../uploads/payment_proofs');
if (!fs.existsSync(paymentProofsDir)) {
  fs.mkdirSync(paymentProofsDir, { recursive: true });
  console.log('Created payment proofs directory:', paymentProofsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, paymentProofsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `payment-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) are allowed!'));
    }
  }
});

// Handle file upload and create payment
export const uploadAndCreatePayment = async (req, res) => {
  try {
    console.log('Payment upload received');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Get data from request body
    const { tenant_id, apartment_id, amount, reference_number, tenant_fullname } = req.body;
    
    // Log received data for debugging
    console.log('Payment data received:', {
      tenant_id,
      apartment_id,
      amount,
      reference_number,
      tenant_fullname,
      file: req.file.filename
    });
    
    // Validate required fields
    if (!tenant_id || !apartment_id || !amount || !reference_number || !tenant_fullname) {
      // Delete uploaded file if validation fails
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: {
          tenant_id: !tenant_id ? 'Tenant ID is required' : undefined,
          apartment_id: !apartment_id ? 'Apartment ID is required' : undefined,
          amount: !amount ? 'Amount is required' : undefined,
          reference_number: !reference_number ? 'Reference number is required' : undefined,
          tenant_fullname: !tenant_fullname ? 'Tenant name is required' : undefined
        }
      });
    }
    
    // Create payment record
    const image_path = `/uploads/payment_proofs/${req.file.filename}`;
    
    const payment = new Payment({
      tenant_id,
      apartment_id,
      amount: Number(amount),
      reference_number,
      tenant_fullname,
      image_path
    });
    
    await payment.save();
    console.log('Payment saved successfully:', payment._id);
    
    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully',
      payment
    });
  } catch (error) {
    console.error('Error in uploadAndCreatePayment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment submission',
      error: error.message
    });
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving payments',
      error: error.message
    });
  }
};

// Get tenant payments
export const getTenantPayments = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    const payments = await Payment.find({ tenant_id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving tenant payments',
      error: error.message
    });
  }
};

// Get single payment
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment',
      error: error.message
    });
  }
};

// Update payment status (for admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, admin_remarks } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, admin_remarks },
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // If payment is approved, update the due date (extend by 1 month)
    if (status === 'approved') {
      // Find the apartment associated with this payment
      const apartment = await Apartment.findById(payment.apartment_id);
      
      if (apartment) {
        // Calculate new due date (current due date + 1 month)
        let newDueDate;
        
        // Check if paymentInfo and nextDueDate exist and if the date is in the future
        if (apartment.paymentInfo && 
            apartment.paymentInfo.nextDueDate && 
            new Date(apartment.paymentInfo.nextDueDate) > new Date()) {
          // If there's a future due date, add a month to it
          newDueDate = new Date(apartment.paymentInfo.nextDueDate);
        } else {
          // If due date is in the past or not set, start from current date
          newDueDate = new Date();
        }
        
        // Add one month to the date
        newDueDate.setMonth(newDueDate.getMonth() + 1);
        
        // Update the apartment with the new due date inside paymentInfo
        await Apartment.findByIdAndUpdate(
          payment.apartment_id,
          { 
            'paymentInfo.nextDueDate': newDueDate,
            'paymentInfo.lastPaymentDate': new Date(),
            'paymentInfo.paymentStatus': 'paid'
          },
          { new: true }
        );
        
        console.log(`Payment approved: Due date extended to ${newDueDate.toISOString().split('T')[0]} for apartment ${apartment._id}`);
      } else {
        console.warn(`Apartment ${payment.apartment_id} not found for payment ${payment._id}`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: error.message
    });
  }
};

// Export multer middleware for use in routes
export const uploadMiddleware = upload.single('file');
