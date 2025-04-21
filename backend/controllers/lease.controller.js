import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { User } from '../models/user.model.js';
import Lease from '../models/lease.model.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory for lease documents if it doesn't exist
const leaseDocumentsDir = path.join(__dirname, '../../uploads/lease_documents');
if (!fs.existsSync(leaseDocumentsDir)) {
  fs.mkdirSync(leaseDocumentsDir, { recursive: true });
  console.log('Created lease documents directory:', leaseDocumentsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, leaseDocumentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `lease-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow only PDFs and images
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files (JPEG, PNG, JPG) are allowed!'));
    }
  }
});

// Upload a lease document
export const uploadLeaseDocument = async (req, res) => {
  try {
    console.log('Lease document upload received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { tenant_id, documentType, description, expiryDate } = req.body;
    
    // Validate required fields
    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required'
      });
    }
    
    // Check if tenant exists
    const tenant = await User.findOne({ _id: tenant_id, role: 'tenant' });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }
    
    // Create new lease document
    const leaseDocument = new Lease({
      tenant_id,
      apartment_id: req.body.apartment_id || undefined,
      filePath: `/uploads/lease_documents/${req.file.filename}`,
      documentType: documentType || 'lease',
      description: description || 'Lease Agreement',
      uploadDate: new Date(),
      uploadedBy: req.user._id,
      expiryDate: expiryDate || undefined,
      isActive: true
    });
    
    await leaseDocument.save();
    
    res.status(200).json({
      success: true,
      message: 'Lease document uploaded successfully',
      document: leaseDocument
    });
    
  } catch (error) {
    console.error('Error uploading lease document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload lease document'
    });
  }
};

// Get all lease documents for a tenant
export const getTenantLeaseDocuments = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    
    // Validate user authorization - only landlords or the tenant themselves
    if (req.user.role !== 'landlord' && req.user.role !== 'admin' && req.user.id !== tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these lease documents'
      });
    }
    
    // Find all lease documents for the tenant
    const leaseDocuments = await Lease.find({ 
      tenant_id: tenant_id 
    }).sort({ uploadDate: -1 });
    
    res.status(200).json({
      success: true,
      count: leaseDocuments.length,
      data: leaseDocuments
    });
    
  } catch (error) {
    console.error('Error getting tenant lease documents:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve lease documents'
    });
  }
};

// Get a specific lease document
export const getLeaseDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the lease document
    const leaseDocument = await Lease.findById(id);
    
    if (!leaseDocument) {
      return res.status(404).json({
        success: false,
        message: 'Lease document not found'
      });
    }
    
    // Validate user authorization - only landlords or the tenant themselves
    if (req.user.role !== 'landlord' && req.user.role !== 'admin' && req.user.id !== leaseDocument.tenant_id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lease document'
      });
    }
    
    res.status(200).json({
      success: true,
      data: leaseDocument
    });
    
  } catch (error) {
    console.error('Error getting lease document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve lease document'
    });
  }
};

// Delete a lease document
export const deleteLeaseDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow landlords or admins to delete lease documents
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete lease documents'
      });
    }
    
    // Find the lease document
    const leaseDocument = await Lease.findById(id);
    
    if (!leaseDocument) {
      return res.status(404).json({
        success: false,
        message: 'Lease document not found'
      });
    }
    
    // Delete the file from the filesystem
    if (leaseDocument.filePath) {
      const filePath = path.join(__dirname, '../../', leaseDocument.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete the document from the database
    await Lease.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Lease document deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting lease document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete lease document'
    });
  }
};

// Export multer middleware for use in routes
export const uploadLeaseMiddleware = upload.single('file');