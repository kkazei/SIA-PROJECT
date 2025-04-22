import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema({
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  apartment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
  },
  filePath: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    default: 'lease',
    enum: ['lease', 'addendum', 'notice', 'other']
  },
  description: {
    type: String,
    default: 'Lease Agreement'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Lease', leaseSchema);