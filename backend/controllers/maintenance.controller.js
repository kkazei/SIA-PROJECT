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
        const maintenances = await Maintenance.find({ landlord_id: req.userId })
            .populate("landlord_id", "name email")
            .populate("apartment_id", "room"); // Added apartment population
            
        res.status(200).json(maintenances);
    } catch (error) {
        console.error("Error fetching maintenance requests:", error);
        res.status(500).json({ message: "Error fetching maintenance requests", error: error.message });
    }
};

// Get a single maintenance request (restricted to landlord's account)
export const getMaintenanceById = async (req, res) => {
    try {
        const maintenance = await Maintenance.findOne({ 
            _id: req.params.id, 
            landlord_id: req.userId 
        })
        .populate("landlord_id", "name email")
        .populate("apartment_id", "room"); // Added apartment population

        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance request not found" });
        }
        res.status(200).json(maintenance);
    } catch (error) {
        console.error("Error fetching maintenance request:", error);
        res.status(500).json({ message: "Error fetching maintenance request", error: error.message });
    }
};

// Update a maintenance request (landlord's account)
export const updateMaintenance = async (req, res) => {
    try {
        // Log incoming request data for debugging
        console.log("Update maintenance request:", {
            id: req.params.id,
            userId: req.userId,
            requestBody: req.body
        });

        // Validate MongoDB ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid maintenance ID format" });
        }

        // Find the maintenance record first to check if it exists
        const existingMaintenance = await Maintenance.findById(req.params.id);
        if (!existingMaintenance) {
            return res.status(404).json({ message: "Maintenance request not found" });
        }

        // For debugging - log ownership check results
        console.log("Ownership check:", {
            maintenanceLandlordId: existingMaintenance.landlord_id,
            requestUserId: req.userId,
            isMatch: existingMaintenance.landlord_id.toString() === req.userId
        });

        // Perform the update with ownership check
        const maintenance = await Maintenance.findOneAndUpdate(
            { _id: req.params.id, landlord_id: req.userId },
            req.body,
            { new: true, runValidators: true }
        )
        .populate("landlord_id", "name email")
        .populate("apartment_id", "room"); // Added apartment population

        if (!maintenance) {
            return res.status(403).json({ 
                message: "Not authorized to update this maintenance request" 
            });
        }

        console.log("Maintenance updated successfully:", maintenance);
        res.status(200).json(maintenance);
    } catch (error) {
        console.error("Error updating maintenance request:", error);
        res.status(500).json({ 
            message: "Error updating maintenance request", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Delete a maintenance request (landlord's account)
export const deleteMaintenance = async (req, res) => {
    try {
        // Log incoming request data for debugging
        console.log("Delete maintenance request:", {
            id: req.params.id,
            userId: req.userId
        });

        // Validate MongoDB ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid maintenance ID format" });
        }

        // Find the maintenance record first to check if it exists
        const existingMaintenance = await Maintenance.findById(req.params.id);
        if (!existingMaintenance) {
            return res.status(404).json({ message: "Maintenance request not found" });
        }

        // For debugging - log ownership check results
        console.log("Ownership check:", {
            maintenanceLandlordId: existingMaintenance.landlord_id,
            requestUserId: req.userId,
            isMatch: existingMaintenance.landlord_id.toString() === req.userId
        });

        // Perform the delete with ownership check
        const maintenance = await Maintenance.findOneAndDelete({ 
            _id: req.params.id, 
            landlord_id: req.userId 
        });

        if (!maintenance) {
            return res.status(403).json({ 
                message: "Not authorized to delete this maintenance request" 
            });
        }

        console.log("Maintenance deleted successfully");
        res.status(200).json({ message: "Maintenance request deleted successfully" });
    } catch (error) {
        console.error("Error deleting maintenance request:", error);
        res.status(500).json({ 
            message: "Error deleting maintenance request", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};