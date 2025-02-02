import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    imgName: {
        type: String,
        required: true
    },
    img: {
        type: String,
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
    }
}, { timestamps: true });

export const Image = mongoose.model("Image", imageSchema);