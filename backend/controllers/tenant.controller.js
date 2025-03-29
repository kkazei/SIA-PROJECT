import { User } from "../models/user.model.js";
import { Apartment } from "../models/apartment.model.js"; // Adjust based on your actual model name
import mongoose from "mongoose";

// Get all tenants for a landlord's apartments
export const getLandlordTenants = async (req, res) => {
  try {
    // Get the landlord ID from the authenticated user
    const landlordId = req.user.id;
    
    // Find all apartments owned by this landlord
    const apartments = await Apartment.find({ 
      landlord_id: landlordId 
    }).populate({
      path: 'tenant_id', // Assuming this is how you reference the tenant
      select: '-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt' // Exclude sensitive fields
    });
    
    // Extract only occupied apartments with tenants
    const occupiedApartments = apartments.filter(apt => 
      apt.status === 'occupied' && apt.tenant_id
    );
    
    // Format the response with relevant information
    const tenantData = occupiedApartments.map(apt => ({
      _id: apt.tenant_id._id,
      name: apt.tenant_id.name,
      email: apt.tenant_id.email,
      avatar: apt.tenant_id.avatar,
      apartment: {
        _id: apt._id,
        room: apt.room,
        rent: apt.rent,
        status: apt.status
      },
      // Add any other fields you need
    }));
    
    res.status(200).json({
      success: true,
      count: tenantData.length,
      data: tenantData
    });
    
  } catch (error) {
    console.error("Error fetching landlord tenants:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get a single tenant's details
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;
    
    // Validate tenant ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant ID"
      });
    }
    
    // Find the tenant
    const tenant = await User.findOne({ 
      _id: id, 
      role: 'tenant' 
    }).select('-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt');
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }
    
    // Find the apartment associated with this tenant and landlord
    const apartment = await Apartment.findOne({
      landlord_id: landlordId,
      tenant_id: id,
      status: 'occupied'
    });
    
    // Check if this tenant belongs to one of the landlord's apartments
    if (!apartment) {
      return res.status(403).json({
        success: false,
        message: "No permission to access this tenant's data"
      });
    }
    
    // Format the response
    const tenantData = {
      _id: tenant._id,
      name: tenant.name,
      email: tenant.email,
      avatar: tenant.avatar,
      createdAt: tenant.createdAt,
      lastLogin: tenant.lastLogin,
      apartment: {
        _id: apartment._id,
        room: apartment.room,
        rent: apartment.rent,
        status: apartment.status,
        // Include any other apartment details needed
      }
      // Add any other tenant fields you need
    };
    
    res.status(200).json({
      success: true,
      data: tenantData
    });
    
  } catch (error) {
    console.error("Error fetching tenant details:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Add more tenant-related controller functions as needed