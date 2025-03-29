import { Application } from "../models/application.model.js";
import { Apartment } from "../models/apartment.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";


export const submitApplication = async (req, res) => {
  try {
    const { apartmentId, moveInDate, phoneNumber, additionalComments } = req.body;
    
    // Get tenant ID from authenticated user
    const tenantId = req.user.id;
    
    // Validate tenant role
    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: "Only tenants can submit applications"
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
    
    // Create new application with both sets of fields
    const newApplication = new Application({
      tenant_id: tenantId,
      apartment_id: apartmentId,
      landlord_id: landlordId,
      details: {
        moveInDate,
        phoneNumber,
        additionalComments: additionalComments || ""
      },
      // Add these fields to match the old index in your database
      tenant: tenantId,
      property: apartmentId
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
        message: "You already have an application for this apartment"
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
        message: "You can only process applications for your own apartments"
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
      // Update application status
      application.status = status;
      application.processedDate = new Date();
      application.processedReason = reason || "";
      
      await application.save({ session });
      
      // If approved, update apartment and assign tenant
      if (status === 'approved') {
        const apartment = await Apartment.findById(application.apartment_id);
        
        // Check if apartment still available
        if (!apartment || apartment.tenant_id || apartment.status !== 'available') {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "This apartment is no longer available"
          });
        }

        // Check if tenant already has an assigned apartment
        const existingAssignment = await Apartment.findOne({
          tenant_id: application.tenant_id,
          status: 'occupied'
        });

        if (existingAssignment) {
          // This tenant already has an assigned apartment - we should prevent this
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "This tenant is already assigned to another apartment"
          });
        }

        // Get move-in date from application
        const moveInDate = new Date(application.details.moveInDate);
        
        // Calculate payment due date (1 month from move-in date, not today)
        const dueDate = new Date(moveInDate);
        dueDate.setMonth(dueDate.getMonth() + 1);
        
        // Update apartment with tenant, change status to occupied, and set due date
        apartment.tenant_id = application.tenant_id;
        apartment.status = 'occupied';
        apartment.paymentInfo = {
          nextDueDate: dueDate,
          lastPaymentDate: null,
          paymentStatus: 'pending',
          moveInDate: moveInDate // Store the move-in date for reference
        };
        
        await apartment.save({ session });
        
        // Reject all other pending applications for this apartment
        await Application.updateMany(
          { 
            apartment_id: application.apartment_id, 
            status: 'pending',
            _id: { $ne: application._id }
          },
          { 
            status: 'rejected',
            processedDate: new Date(),
            processedReason: "Another applicant has been selected for this apartment."
          },
          { session }
        );
        
        // Also reject all other pending applications from this tenant for other apartments
        await Application.updateMany(
          {
            tenant_id: application.tenant_id,
            status: 'pending',
            _id: { $ne: application._id }
          },
          {
            status: 'rejected',
            processedDate: new Date(),
            processedReason: "You have been assigned to a different apartment."
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
        message: "Access denied. Only landlords can access this resource."
      });
    }
    
    // Find all applications for apartments owned by this landlord
    const applications = await Application.find({ 
      landlord_id: landlordId 
    })
    .populate({
      path: 'tenant_id',
      select: 'name email avatar'
    })
    .populate({
      path: 'apartment_id',
      select: 'room rent status images'
    })
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
    
  } catch (error) {
    console.error("Error fetching landlord applications:", error);
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
        message: "Access denied. Only tenants can access this resource."
      });
    }
    
    // Find all applications submitted by this tenant
    const applications = await Application.find({ 
      tenant_id: tenantId 
    })
    .populate({
      path: 'apartment_id',
      select: 'room rent status images address'
    })
    .populate({
      path: 'landlord_id',
      select: 'name email'
    })
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
    
  } catch (error) {
    console.error("Error fetching tenant applications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications"
    });
  }
};