import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Changed from 'Tenant' to 'User'
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
}, { timestamps: true });

// Add an index for faster queries
apartmentSchema.index({ landlord_id: 1 });
apartmentSchema.index({ status: 1 });

export const Apartment = mongoose.model("Apartment", apartmentSchema);