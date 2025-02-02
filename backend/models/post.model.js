import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
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

export const Post = mongoose.model("Post", postSchema);