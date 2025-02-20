import { Maintenance } from "../models/maintenance.model.js";

// Create a new maintenance request
export const createMaintenance = async (req, res) => {
    try {
        const maintenance = new Maintenance(req.body);
        await maintenance.save();
        res.status(201).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: "Error creating maintenance request", error: error.message });
    }
};

// Get all maintenance requests
export const getMaintenances = async (req, res) => {
    try {
        const maintenances = await Maintenance.find()
            .populate("apartment_id", "room") // Fetch only room name
            .populate("landlord_id", "name email"); // Fetch landlord details
        res.status(200).json(maintenances);
    } catch (error) {
        res.status(500).json({ message: "Error fetching maintenance requests", error: error.message });
    }
};

// Get a single maintenance request by ID
export const getMaintenanceById = async (req, res) => {
    try {
        const maintenance = await Maintenance.findById(req.params.id)
            .populate("apartment_id", "room")
            .populate("landlord_id", "name email");
        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance request not found" });
        }
        res.status(200).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: "Error fetching maintenance request", error: error.message });
    }
};

// Update a maintenance request
export const updateMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("apartment_id", "room")
            .populate("landlord_id", "name email");
        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance request not found" });
        }
        res.status(200).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: "Error updating maintenance request", error: error.message });
    }
};

// Delete a maintenance request
export const deleteMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance request not found" });
        }
        res.status(200).json({ message: "Maintenance request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting maintenance request", error: error.message });
    }
};
