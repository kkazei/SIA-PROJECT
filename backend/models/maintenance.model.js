import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
    {
        room:{
            type: String,
            ref: "Apartment",
            required: true,
        },
        apartment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Apartment",
            required: true,
        },
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
        },
    },
    { timestamps: true }
);

export const Maintenance = mongoose.model("Maintenance", maintenanceSchema);
