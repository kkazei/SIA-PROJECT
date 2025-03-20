import { Maintenance } from "../models/maintenance.model.js";

// Create a new maintenance request (landlord can only create their own)
export const createMaintenance = async (req, res) => {
    try {
        const maintenance = new Maintenance({
            ...req.body,
            landlord_id: req.userId, // Automatically set from JWT
        });

        await maintenance.save();
        res.status(201).json(maintenance);
    } catch (error) {
        console.error("Error creating maintenance request:", error);
        res.status(500).json({ message: "Error creating maintenance request", error: error.message });
    }
};

// Get all maintenance requests (restricted to logged-in landlord)
export const getMaintenances = async (req, res) => {
    try {
        const maintenances = await Maintenance.find({ landlord_id: req.userId }).populate("landlord_id", "name email");
        res.status(200).json(maintenances);
    } catch (error) {
        console.error("Error fetching maintenance requests:", error);
        res.status(500).json({ message: "Error fetching maintenance requests", error: error.message });
    }
};

// Get a single maintenance request (restricted to landlord's account)
export const getMaintenanceById = async (req, res) => {
    try {
        const maintenance = await Maintenance.findOne({ _id: req.params.id, landlord_id: req.userId }).populate("landlord_id", "name email");

        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance request not found" });
        }
        res.status(200).json(maintenance);
    } catch (error) {
        console.error("Error fetching maintenance request:", error);
        res.status(500).json({ message: "Error fetching maintenance request", error: error.message });
    }
};

// Update a maintenance request (restricted to landlord's account)
export const updateMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.findOneAndUpdate(
            { _id: req.params.id, landlord_id: req.userId }, // Ensure ownership
            req.body,
            { new: true }
        ).populate("landlord_id", "name email");

        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance request not found or unauthorized" });
        }
        res.status(200).json(maintenance);
    } catch (error) {
        console.error("Error updating maintenance request:", error);
        res.status(500).json({ message: "Error updating maintenance request", error: error.message });
    }
};

// Delete a maintenance request (restricted to landlord's account)
export const deleteMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.findOneAndDelete({ _id: req.params.id, landlord_id: req.userId });

        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance request not found or unauthorized" });
        }
        res.status(200).json({ message: "Maintenance request deleted successfully" });
    } catch (error) {
        console.error("Error deleting maintenance request:", error);
        res.status(500).json({ message: "Error deleting maintenance request", error: error.message });
    }
};
