import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
    {
        landlord_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            default: null,
        },
        description: {
            type: String,
            required: true,
        },
        expenses: {
            type: Number,
            default: 0.0,
        },
        status: {
            type: String,
            enum: ["ongoing", "pending", "completed"],
            default: "pending",
        },
        isVisible: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

// Add index for faster queries
maintenanceSchema.index({ landlord_id: 1 });

export const Maintenance = mongoose.model("Maintenance", maintenanceSchema);