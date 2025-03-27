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
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Property = mongoose.model('Property', propertySchema);