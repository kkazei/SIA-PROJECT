import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
    apartment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // This can store the landlord ID who's handling the inquiry
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['General Inquiry', 'Maintenance', 'Payment Issue', 'Complaint', 'Other'],
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Approved', 'Resolved', 'Closed'],
        default: 'Open'
    },
    resolution_type: {
        type: String,
        enum: ['Approved', 'Denied', 'Needs More Information', 'Other'],
        // To categorize how an inquiry was resolved
    },
    images: [{
        type: String
    }],
    responses: [{
        responder_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolvedAt: {
        type: Date
    }
}, { timestamps: true });

// Add indexes for faster queries
inquirySchema.index({ tenant_id: 1 });
inquirySchema.index({ apartment_id: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ assigned_to: 1 });

export const Inquiry = mongoose.model("Inquiry", inquirySchema);