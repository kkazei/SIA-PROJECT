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

// Get all tenants who don't have apartments assigned
export const getTenantsWithNoApartments = async (req, res) => {
    try {
      // Check if req.user exists first
      if (!req.user) {
        console.error("User not found in request");
        return res.status(401).json({
          success: false,
          message: "Authentication failed. User not found in request."
        });
      }
  
      // Get the landlord ID from the authenticated user
      const landlordId = req.user.id;
      
      console.log("Looking for unassigned tenants, landlord ID:", landlordId);
      
      // Find all tenant IDs who are already assigned to any apartment
      // This is more efficient than filtering after fetching all tenants
      const assignedApartments = await Apartment.find({
        tenant_id: { $exists: true, $ne: null }
      }).select('tenant_id');
      
      const assignedTenantIds = assignedApartments.map(apt => apt.tenant_id);
      console.log(`Found ${assignedTenantIds.length} assigned tenant IDs`);
      
      // Find all users with the 'tenant' role who are NOT assigned to any apartment
      const unassignedTenants = await User.find({
        role: 'tenant',
        _id: { $nin: assignedTenantIds }
      }).select('-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt');
      
      console.log(`Found ${unassignedTenants.length} unassigned tenants`);
      
      // Format the response
      const tenantData = unassignedTenants.map(tenant => ({
        _id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        avatar: tenant.avatar || null,
        createdAt: tenant.createdAt
      }));
      
      res.status(200).json({
        success: true,
        count: tenantData.length,
        data: tenantData
      });
      
    } catch (error) {
      console.error("Error fetching unassigned tenants:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching unassigned tenants",
        error: error.message
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