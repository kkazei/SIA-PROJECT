import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference_number: {
        type: String,
        default: null
    },
    proof_of_payment: {
        type: String,
        default: null
    },
    tenant_fullname: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Invoice = mongoose.model("Invoice", invoiceSchema);