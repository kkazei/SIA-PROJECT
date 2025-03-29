import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  // The tenant who applied
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // The apartment being applied for
  apartment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true
  },
  
  // The landlord who owns the apartment
  landlord_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Application details
  details: {
    moveInDate: {
      type: Date,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    additionalComments: {
      type: String,
      default: ""
    }
  },
  
  // Date when the application was processed (approved/rejected)
  processedDate: {
    type: Date
  },
  
  // Reason for approval/rejection (optional)
  processedReason: {
    type: String
  }
}, { timestamps: true });

// Create compound index to prevent duplicate applications
applicationSchema.index({ tenant_id: 1, apartment_id: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);