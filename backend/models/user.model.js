import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: true,
        unique: true
    },
    user_fullname: {
        type: String,
        required: true
    },
    user_phone: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    user_role: {
        type: String,
        enum: ['tenant', 'landlord'],
        default: 'tenant'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);

// createdAt and updatedAt fields are automatically added to the schema