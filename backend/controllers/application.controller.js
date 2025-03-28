import { Application } from '../models/application.model.js';
import { Property } from '../models/property.model.js';
import { User } from '../models/user.model.js'; 

// Submit a new application (for tenants)
export const submitApplication = async (req, res) => {
  try {
    // Check if user is a tenant
    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can apply for properties'
      });
    }

    const { propertyId, moveInDate, message, documents } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      tenant: req.user.id,
      property: propertyId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this property'
      });
    }

    // Create new application
    const newApplication = new Application({
      tenant: req.user.id,
      property: propertyId,
      landlord: property.landlord,
      moveInDate: new Date(moveInDate),
      message,
      documents: documents || []
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

// Get all applications for a specific property (for landlords)
export const getPropertyApplications = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Verify user is a landlord
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify property belongs to landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: req.user.id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or you do not have permission to access it'
      });
    }

    // Get applications
    const applications = await Application.find({ property: propertyId })
      .populate('tenant', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get property applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get all applications by a tenant
export const getMyApplications = async (req, res) => {
  try {
    // Verify user is a tenant
    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get applications
    const applications = await Application.find({ tenant: req.user.id })
      .populate('property')
      .populate('landlord', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your applications',
      error: error.message
    });
  }
};

// Get all applications to a landlord
export const getLandlordApplications = async (req, res) => {
  try {
    // Verify user is a landlord
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get applications
    const applications = await Application.find({ landlord: req.user.id })
      .populate('property')
      .populate('tenant', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get landlord applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Update application status (for landlords)
export const updateApplicationStatus = async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, notes, leaseStart, leaseEnd } = req.body;
  
      // Verify user is a landlord
      if (req.user.role !== 'landlord') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
  
      // Find application and check ownership
      const application = await Application.findById(applicationId);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
  
      if (application.landlord.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update applications for your own properties'
        });
      }
  
      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
  
      // Update application
      application.status = status;
      if (notes) {
        application.landlordNotes = notes;
      }
      
      await application.save();
  
      // If approved, reject all other applications for this property and assign tenant to property
      if (status === 'approved') {
        // Reject other applications
        await Application.updateMany(
          { 
            property: application.property,
            _id: { $ne: applicationId },
            status: 'pending' 
          },
          { status: 'rejected', landlordNotes: 'Another applicant was selected for this property.' }
        );
        
        // Calculate lease dates
        // Use provided dates if available, otherwise use defaults
        const defaultLeaseStart = application.moveInDate || new Date();
        const defaultLeaseEnd = new Date(new Date(defaultLeaseStart).setMonth(
          new Date(defaultLeaseStart).getMonth() + 12
        ));
        
        const finalLeaseStart = leaseStart ? new Date(leaseStart) : defaultLeaseStart;
        const finalLeaseEnd = leaseEnd ? new Date(leaseEnd) : defaultLeaseEnd;
        
        // Update the property to assign the tenant
        await Property.findByIdAndUpdate(
          application.property,
          { 
            tenant: application.tenant,
            isOccupied: true,
            occupiedSince: new Date(),
            leaseStart: finalLeaseStart,
            leaseEnd: finalLeaseEnd
          }
        );
      }
  
      // Get updated application with populated references
      const updatedApplication = await Application.findById(applicationId)
        .populate('property')
        .populate('tenant', 'name email avatar')
        .populate('landlord', 'name email');
  
      res.status(200).json({
        success: true,
        message: `Application ${status} successfully`,
        application: updatedApplication
      });
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating application status',
        error: error.message
      });
    }
  };

  export const updateLeaseTerm = async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { leaseStart, leaseEnd } = req.body;
  
      // Verify user is a landlord
      if (req.user.role !== 'landlord') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
  
      // Find property and verify ownership
      const property = await Property.findOne({
        _id: propertyId,
        landlord: req.user.id
      });
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found or you do not have permission to manage it'
        });
      }
  
      // Verify property has a tenant assigned
      if (!property.tenant) {
        return res.status(400).json({
          success: false,
          message: 'This property does not have a tenant assigned'
        });
      }
  
      // Validate input
      if (!leaseStart || !leaseEnd) {
        return res.status(400).json({
          success: false,
          message: 'Both lease start and end dates are required'
        });
      }
  
      const newLeaseStart = new Date(leaseStart);
      const newLeaseEnd = new Date(leaseEnd);
  
      // Validate dates
      if (newLeaseEnd <= newLeaseStart) {
        return res.status(400).json({
          success: false,
          message: 'Lease end date must be after lease start date'
        });
      }
  
      // Update the property with new lease terms
      property.leaseStart = newLeaseStart;
      property.leaseEnd = newLeaseEnd;
      await property.save();
  
      // Get updated property with tenant info
      const updatedProperty = await Property.findById(propertyId)
        .populate('tenant', 'name email avatar')
        .populate('landlord', 'name email');
  
      res.status(200).json({
        success: true,
        message: 'Lease terms updated successfully',
        property: updatedProperty
      });
    } catch (error) {
      console.error('Update lease terms error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating lease terms',
        error: error.message
      });
    }
  };

// Cancel an application (for tenants)
export const cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify user is a tenant
    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find application and check ownership
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own applications'
      });
    }

    // Can't cancel if already approved or rejected
    if (['approved', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an application that is already ${application.status}`
      });
    }

    // Update application
    application.status = 'canceled';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application canceled successfully',
      application
    });
  } catch (error) {
    console.error('Cancel application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling application',
      error: error.message
    });
  }
};

// Get application details (for both tenant and landlord)
export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId)
      .populate('property')
      .populate('tenant', 'name email avatar')
      .populate('landlord', 'name email');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions - only the tenant who submitted or the landlord can view
    if (
      application.tenant._id.toString() !== req.user.id &&
      application.landlord._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this application'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};