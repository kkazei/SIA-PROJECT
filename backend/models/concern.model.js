import mongoose from "mongoose";

const concernSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    image_path: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'solved'],
        default: 'pending'
    }
}, { timestamps: true });

export const Concern = mongoose.model("Concern", concernSchema);