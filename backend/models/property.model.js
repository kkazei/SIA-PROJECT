import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Property description is required']
  },
  address: {
    type: String,
    required: [true, 'Property address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'house', 'condo', 'room']
  },
  rentAmount: {
    type: Number,
    required: [true, 'Rent amount is required']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required']
  },
  images: [String],
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Changed from isAvailable to more descriptive isOccupied
  isOccupied: {
    type: Boolean,
    default: false
  },
  // Added tenant fields
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  occupiedSince: {
    type: Date,
    default: null
  },
  leaseStart: {
    type: Date,
    default: null
  },
  leaseEnd: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export const Property = mongoose.model('Property', propertySchema);