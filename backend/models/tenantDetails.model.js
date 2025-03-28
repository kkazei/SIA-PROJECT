import mongoose from "mongoose";

const tenantDetailsSchema = new mongoose.Schema({
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apartment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true
    },
    room: {
        type: String,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    due_date: {
        type: Date,
        default: () => {
            // Set due date to the first day of next month
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
    },
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenant_phone: {
        type: String,
        default: null
    },
    payment_history: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        status: String,
        notes: String
    }]
}, { timestamps: true });

// Create indexes for faster queries
tenantDetailsSchema.index({ tenant_id: 1 });
tenantDetailsSchema.index({ apartment_id: 1 });
tenantDetailsSchema.index({ landlord_id: 1 });
tenantDetailsSchema.index({ payment_status: 1 });

export const TenantDetails = mongoose.model("TenantDetails", tenantDetailsSchema);