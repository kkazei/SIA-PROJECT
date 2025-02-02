import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema({
    imgName: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    room: {
        type: String,
        required: true
    },
    tenant_fullname: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Lease = mongoose.model("Lease", leaseSchema);