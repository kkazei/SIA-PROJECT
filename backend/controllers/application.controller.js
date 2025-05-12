import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Apartment } from "../models/apartment.model.js";
import { User } from "../models/user.model.js";
import fs from 'fs';
import path from 'path';

// Make sure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Submit a new application - Tenant
export const submitApplication = async (req, res) => {
  try {
    const { apartmentId, moveInDate, phoneNumber, additionalComments } = req.body;
    
    // Get the duration and explicitly convert it to a number
    const duration = Number(req.body.duration);
    
    // Debug what's being received
    console.log("Received duration:", req.body.duration, "Parsed as:", duration);
    
    // Get tenant ID from authenticated user
    const tenantId = req.user.id;
    
    // Validate tenant role
    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: "Only tenants can submit applications"
      });
    }
    
    // Validate duration
    if (isNaN(duration) || duration < 1) {
      return res.status(400).json({
        success: false,
        message: "Duration must be at least 1 month"
      });
    }
    
    // Verify apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found"
      });
    }
    
    // Check if apartment is available
    if (apartment.tenant_id || apartment.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: "This apartment is not available for application"
      });
    }
    
    // Get landlord ID from the apartment
    const landlordId = apartment.landlord_id;
    
    // Check if there's already a pending application for this tenant and apartment
    const existingApplication = await Application.findOne({
      tenant_id: tenantId,
      apartment_id: apartmentId,
      status: 'pending'
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending application for this apartment"
      });
    }
    
    // Get file paths from uploaded files
    const validIdPath = req.files?.validId ? req.files.validId[0].filename : null;
    let additionalDocsArray = [];
    
    if (req.files?.additionalDocuments) {
      additionalDocsArray = req.files.additionalDocuments.map(file => file.filename);
    }
    
    // Debug file information
    console.log("Valid ID file:", validIdPath);
    console.log("Additional documents:", additionalDocsArray);
    
    // Create new application with fields at root level
    const newApplication = new Application({
      tenant_id: tenantId,
      apartment_id: apartmentId,
      landlord_id: landlordId,
      moveInDate,
      phoneNumber,
      additionalComments: additionalComments || "",
      duration: Number(duration),
      tenant: tenantId,
      property: apartmentId,
      // Save document paths to database
      validId: validIdPath,
      additionalDocuments: additionalDocsArray
    });
    
    await newApplication.save();
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: newApplication
    });
    
  } catch (error) {
    console.error("Error submitting application:", error);
    // More detailed error response for duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You've already applied for this apartment"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while submitting application"
    });
  }
};

// Process an application (approve/reject) - Landlord
export const processApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reason } = req.body;
    const landlordId = req.user.id;
    
    // Validate landlord role
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: "Only landlords can process applications"
      });
    }
    
    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'"
      });
    }
    
    // Find the application
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    // Check if this landlord owns the application
    if (application.landlord_id.toString() !== landlordId) {
      return res.status(403).json({
        success: false,
        message: "You can only process applications for your own properties"
      });
    }
    
    // Check if application is already processed
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This application has already been ${application.status}`
      });
    }
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Update application
      application.status = status;
      application.processedDate = new Date();
      application.processedReason = reason;
      await application.save({ session });
      
      // If approved, update apartment and assign tenant
      if (status === 'approved') {
        const apartment = await Apartment.findById(application.apartment_id);
        
        if (!apartment) {
          throw new Error("Apartment not found");
        }
        
        if (apartment.tenant_id || apartment.status !== 'available') {
          throw new Error("This apartment is no longer available");
        }
        
        // Get move-in date and duration from application
        const moveInDate = new Date(application.moveInDate);
        const duration = application.duration;
        
        // Calculate lease end date based on duration
        const leaseEndDate = new Date(moveInDate);
        leaseEndDate.setMonth(leaseEndDate.getMonth() + duration);
        
        // Calculate payment due date (1 month from move-in date)
        const dueDate = new Date(moveInDate);
        dueDate.setMonth(dueDate.getMonth() + 1);
        
        // Update apartment with tenant, change status to occupied, and set due date
        apartment.tenant_id = application.tenant_id;
        apartment.status = 'occupied';
        apartment.paymentInfo = {
          nextDueDate: dueDate,
          lastPaymentDate: null,
          paymentStatus: 'pending',
          moveInDate: moveInDate,
          leaseEndDate: leaseEndDate,
          leaseDuration: duration
        };
        
        await apartment.save({ session });
        
        // Reject all other pending applications for this apartment
        await Application.updateMany(
          {
            _id: { $ne: applicationId },
            apartment_id: application.apartment_id,
            status: 'pending'
          },
          {
            status: 'rejected',
            processedDate: new Date(),
            processedReason: 'Another application for this property has been approved'
          },
          { session }
        );
      }
      
      await session.commitTransaction();
      
      res.status(200).json({
        success: true,
        message: `Application ${status} successfully`,
        data: application
      });
      
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      throw error;
    } finally {
      session.endSession();
    }
    
  } catch (error) {
    console.error("Error processing application:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing application"
    });
  }
};

// Get all pending applications for a landlord
export const getLandlordApplications = async (req, res) => {
  try {
    const landlordId = req.user.id;
    
    // Validate landlord role
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: "Access restricted to landlords"
      });
    }
    
    // Find all applications for apartments owned by this landlord
    const applications = await Application.find({ landlord_id: landlordId })
      .populate('tenant_id', 'name email profileImage')
      .populate('apartment_id', 'room rent address images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
    
  } catch (error) {
    console.error("Error getting landlord applications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications"
    });
  }
};

// Get all applications for a tenant
export const getTenantApplications = async (req, res) => {
  try {
    const tenantId = req.user.id;
    
    // Validate tenant role
    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: "Access restricted to tenants"
      });
    }
    
    // Get all applications by this tenant
    const applications = await Application.find({ tenant_id: tenantId })
      .populate('apartment_id', 'room rent address images')
      .populate('landlord_id', 'name email phoneNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
    
  } catch (error) {
    console.error("Error getting tenant applications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications"
    });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    
    // Find the application
    const application = await Application.findById(applicationId)
      .populate('tenant_id', 'name email profileImage')
      .populate('landlord_id', 'name email phoneNumber')
      .populate('apartment_id', 'room rent address images');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    // Check if user has permission to view this application
    if (
      application.tenant_id._id.toString() !== userId && 
      application.landlord_id._id.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this application"
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
    
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching application details"
    });
  }
};

// Add this new controller function

// Get active/approved application for a specific tenant
export const getActiveTenantApplication = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Find the most recent approved application for this tenant
    const application = await Application
      .findOne({ 
        tenant_id: tenantId, 
        status: 'approved' 
      })
      .sort({ processedDate: -1 })
      .populate('apartment_id', 'room rent address images');
    
    // If no approved application found, check if there's a pending one
    if (!application) {
      const pendingApplication = await Application
        .findOne({ 
          tenant_id: tenantId, 
          status: 'pending' 
        })
        .sort({ createdAt: -1 })
        .populate('apartment_id', 'room rent address images');
        
      if (!pendingApplication) {
        return res.status(200).json({
          success: true,
          data: null,
          message: "No active application found for this tenant"
        });
      }
      
      return res.status(200).json({
        success: true,
        data: pendingApplication
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
    
  } catch (error) {
    console.error("Error fetching tenant's active application:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching application"
    });
  }
};