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
        ref: 'Tenant',
        default: null
    },
    tenant_fullname: {
        type: String,
        default: null
    }
}, { timestamps: true });

export const Apartment = mongoose.model("Apartment", apartmentSchema);