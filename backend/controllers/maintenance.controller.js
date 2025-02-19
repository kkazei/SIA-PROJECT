import { Maintenance } from "../models/maintenance.model.js";

// Create a new maintenance task
export const createMaintenance = async (req, res) => {
    try {
        const newTask = new Maintenance({
            ...req.body,
            landlord_id: req.user.id,
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Error creating maintenance task", error });
    }
};

// Get all maintenance tasks
export const getMaintenance = async (req, res) => {
    try {
        const tasks = await Maintenance.find({ landlord_id: req.user.id, isVisible: true }).populate("apartment_id");
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching maintenance tasks", error });
    }
};

// Update a maintenance task
export const updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await Maintenance.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Error updating maintenance task", error });
    }
};

// Delete a maintenance task (Soft delete - Hide instead of remove)
export const deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        await Maintenance.findByIdAndUpdate(id, { isVisible: false });
        res.status(200).json({ message: "Maintenance task hidden successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting maintenance task", error });
    }
};

// Archive a maintenance task
export const archiveMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        await Maintenance.findByIdAndUpdate(id, { status: "completed" });
        res.status(200).json({ message: "Maintenance task archived" });
    } catch (error) {
        res.status(500).json({ message: "Error archiving maintenance task", error });
    }
};
