import { Apartment } from '../models/apartment.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

export const createApartment = async (req, res) => {
  try {
    const { room, rent, description } = req.body;
    
    // Validate required fields
    if (!room || !rent || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide room, rent and description' 
      });
    }
    
    // Check if user is a landlord
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only landlords can create apartments' 
      });
    }
    
    // Create new apartment
    const newApartment = new Apartment({
      room,
      rent,
      description,
      landlord_id: req.user.id
    });
    
    const savedApartment = await newApartment.save();
    
    res.status(201).json({
      success: true,
      message: 'Apartment created successfully',
      apartment: savedApartment
    });
    
  } catch (error) {
    console.error('Create apartment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { room, rent, description, status } = req.body;
    
    // Validate apartment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
    }
    
    // Find the apartment
    const apartment = await Apartment.findById(id);
    
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }
    
    // Check if user is the landlord of this apartment
    if (apartment.landlord_id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own apartments' 
      });
    }
    
    // Update apartment fields if provided
    if (room) apartment.room = room;
    if (rent) apartment.rent = rent;
    if (description) apartment.description = description;
    if (status && ['available', 'occupied', 'maintenance'].includes(status)) {
      apartment.status = status;
    }
    
    const updatedApartment = await apartment.save();
    
    res.status(200).json({
      success: true,
      message: 'Apartment updated successfully',
      apartment: updatedApartment
    });
    
  } catch (error) {
    console.error('Update apartment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteApartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate apartment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
    }
    
    // Find the apartment
    const apartment = await Apartment.findById(id);
    
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }
    
    // Check if user is the landlord of this apartment
    if (apartment.landlord_id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own apartments' 
      });
    }
    
    // Check if apartment is occupied
    if (apartment.status === 'occupied') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete an occupied apartment. Please remove tenant first.' 
      });
    }
    
    await Apartment.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Apartment deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete apartment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const assignTenant = async (req, res) => {
  try {
    const { apartmentId, tenantId } = req.body;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(apartmentId) || !mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ success: false, message: 'Invalid apartment or tenant ID' });
    }
    
    // Find the apartment
    const apartment = await Apartment.findById(apartmentId);
    
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }
    
    // Check if user is the landlord of this apartment
    if (apartment.landlord_id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only assign tenants to your own apartments' 
      });
    }
    
    // Check if apartment is available
    if (apartment.status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot assign tenant. Apartment is currently ${apartment.status}` 
      });
    }
    
    // Verify tenant exists and is a tenant
    const tenant = await User.findOne({ _id: tenantId, role: 'tenant' });
    
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    
    // Assign tenant and update status
    apartment.tenant_id = tenantId;
    apartment.status = 'occupied';
    
    const updatedApartment = await apartment.save();
    
    res.status(200).json({
      success: true,
      message: 'Tenant assigned successfully',
      apartment: updatedApartment
    });
    
  } catch (error) {
    console.error('Assign tenant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const removeTenant = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    
    // Validate apartment ID
    if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
    }
    
    // Find the apartment
    const apartment = await Apartment.findById(apartmentId);
    
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }
    
    // Check if user is the landlord of this apartment
    if (apartment.landlord_id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only manage tenants for your own apartments' 
      });
    }
    
    // Check if apartment has a tenant
    if (!apartment.tenant_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'This apartment does not have an assigned tenant' 
      });
    }
    
    // Remove tenant and update status
    apartment.tenant_id = null;
    apartment.status = 'available';
    
    const updatedApartment = await apartment.save();
    
    res.status(200).json({
      success: true,
      message: 'Tenant removed successfully',
      apartment: updatedApartment
    });
    
  } catch (error) {
    console.error('Remove tenant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getApartments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { landlord_id: req.user.id };
    
    // Filter by status if provided
    if (status && ['available', 'occupied', 'maintenance'].includes(status)) {
      filter.status = status;
    }
    
    const apartments = await Apartment.find(filter)
      .populate('tenant_id', 'name email avatar')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: apartments.length,
      apartments
    });
    
  } catch (error) {
    console.error('Get apartments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getApartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate apartment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
    }
    
    const apartment = await Apartment.findById(id)
      .populate('tenant_id', 'name email avatar')
      .populate('landlord_id', 'name email avatar');
    
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }
    
    // Check if user is the landlord or the tenant of this apartment
    const isLandlord = apartment.landlord_id._id.toString() === req.user.id;
    const isTenant = apartment.tenant_id && apartment.tenant_id._id.toString() === req.user.id;
    
    if (!isLandlord && !isTenant) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to view this apartment' 
      });
    }
    
    res.status(200).json({
      success: true,
      apartment
    });
    
  } catch (error) {
    console.error('Get apartment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};