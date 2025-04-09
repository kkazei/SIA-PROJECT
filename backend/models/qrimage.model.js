import mongoose from "mongoose";

const QRimageSchema = new mongoose.Schema({
    details: {
        type: String,
        required: true
    },
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image_path: {
        type: String,
        default: null
    }
}, { timestamps: true });

export const QRimage = mongoose.model("QRimage", QRimageSchema);
