import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'canceled'],
    default: 'pending'
  },
  moveInDate: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  documents: [{
    title: String,
    url: String
  }],
  landlordNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure a tenant can only have one active application per property
applicationSchema.index({ tenant: 1, property: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);