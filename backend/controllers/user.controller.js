import { User } from "../models/user.model.js";
import { Apartment } from "../models/apartment.model.js";
import mongoose from "mongoose";

// ... existing controller methods ...

// Get all tenants
export const getAllTenants = async (req, res) => {
  try {
    // Only allow landlords or admins to access all tenants
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access tenant information'
      });
    }

    // Find users with tenant role
    const tenants = await User.find({ role: 'tenant' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tenants.length,
      users: tenants
    });
  } catch (error) {
    console.error('Get all tenants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get unassigned tenants (those not assigned to any apartment)
export const getUnassignedTenants = async (req, res) => {
  try {
    // Only allow landlords or admins to access
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access tenant information'
      });
    }

    // Get IDs of all tenants who are assigned to apartments
    const assignedTenantIds = await Apartment.distinct('tenant_id', {
      tenant_id: { $ne: null }
    });

    // Find all tenant users who are not in the assigned list
    const unassignedTenants = await User.find({
      role: 'tenant',
      _id: { $nin: assignedTenantIds }
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: unassignedTenants.length,
      users: unassignedTenants
    });
  } catch (error) {
    console.error('Get unassigned tenants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get tenant by ID
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID' });
    }

    // Only allow landlords, admins or the tenant themselves
    if (
      req.user.role !== 'landlord' &&
      req.user.role !== 'admin' &&
      req.user.id !== id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this tenant information'
      });
    }

    // Find tenant by ID
    const tenant = await User.findOne({ _id: id, role: 'tenant' }).select('-password');

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // If landlord, check if tenant is assigned to one of their apartments
    if (req.user.role === 'landlord' && req.user.id !== tenant._id.toString()) {
      const apartment = await Apartment.findOne({
        landlord_id: req.user.id,
        tenant_id: tenant._id
      });

      // If landlord and tenant is not in their properties, deny access
      if (!apartment && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only access tenants assigned to your properties'
        });
      }
    }

    res.status(200).json({
      success: true,
      user: tenant
    });
  } catch (error) {
    console.error('Get tenant by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search tenants by name or email
export const searchTenants = async (req, res) => {
  try {
    // Only allow landlords or admins
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to search tenants'
      });
    }

    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search for tenants by name or email
    const tenants = await User.find({
      role: 'tenant',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: tenants.length,
      users: tenants
    });
  } catch (error) {
    console.error('Search tenants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Filter tenants (occupied/unoccupied)
export const getFilteredTenants = async (req, res) => {
  try {
    // Only allow landlords or admins
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to filter tenants'
      });
    }

    const { occupied } = req.query;
    
    // If occupied parameter is not provided, return all tenants
    if (occupied === undefined) {
      return getAllTenants(req, res);
    }
    
    // Convert string to boolean
    const isOccupied = occupied === 'true';
    
    // Get IDs of all tenants who are assigned to apartments
    const assignedTenantIds = await Apartment.distinct('tenant_id', {
      tenant_id: { $ne: null }
    });
    
    // Prepare filter based on occupancy
    let filter = { role: 'tenant' };
    if (isOccupied) {
      filter._id = { $in: assignedTenantIds };
    } else {
      filter._id = { $nin: assignedTenantIds };
    }
    
    // Find tenants based on filter
    const tenants = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: tenants.length,
      users: tenants
    });
  } catch (error) {
    console.error('Filter tenants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add or update this method
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Getting user by ID:', userId);
    
    const user = await User.findById(userId).select('name email role avatar');
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User found:', user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ... remaining controller methods ...