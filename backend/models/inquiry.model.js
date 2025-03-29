import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['General Inquiry', 'Maintenance', 'Payment Issue'],
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    image_path: {
        type: String,
        default: null
    }
}, { timestamps: true });

export const Inquiry = mongoose.model("Inquiry", inquirySchema);