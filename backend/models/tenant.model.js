import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
    tenant_email: {
        type: String,
        required: true,
        unique: true
    },
    tenant_fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
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
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    due_date: {
        type: Date,
        default: Date.now
    },
    apartment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        default: null
    },
    tenant_phone: {
        type: String,
        default: null
    }
}, { timestamps: true });

export const Tenant = mongoose.model("Tenant", tenantSchema);