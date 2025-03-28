import express from "express";
import { 
    createMaintenance, 
    getMaintenances, 
    getMaintenanceById, 
    updateMaintenance, 
    deleteMaintenance 
} from "../controllers/maintenance.controller.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import { Apartment } from "../models/apartment.model.js";
import { Maintenance } from "../models/maintenance.model.js";

const router = express.Router();

// Apply authorization middleware - only landlords can access maintenance routes
// Create maintenance request
router.post("/", verifyToken, authorize('landlord'), createMaintenance);

// Get all maintenance requests for a landlord
router.get("/", verifyToken, authorize('landlord'), getMaintenances);

// Get specific maintenance request by ID
router.get("/:id", verifyToken, authorize('landlord'), getMaintenanceById);

// Update maintenance request
router.put("/:id", verifyToken, authorize('landlord'), updateMaintenance);

// Delete maintenance request
router.delete("/:id", verifyToken, authorize('landlord'), deleteMaintenance);

// TENANT SPECIFIC ROUTES:

// Get maintenance requests for a tenant's apartment
router.get("/tenant/requests", verifyToken, authorize('tenant'), async (req, res) => {
    try {
        const tenantId = req.user.id;
        
        // First, find the apartment assigned to this tenant
        const apartment = await Apartment.findOne({ tenant_id: tenantId });
        
        if (!apartment) {
            return res.status(200).json({
                success: true,
                message: "No apartment assigned to tenant",
                data: []
            });
        }
        
        // Find maintenance requests for this apartment
        const maintenanceRequests = await Maintenance.find({ 
            apartment_id: apartment._id 
        })
        .populate("apartment_id", "room")
        .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: maintenanceRequests.length,
            data: maintenanceRequests
        });
    } catch (error) {
        console.error("Error fetching tenant maintenance requests:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching maintenance requests",
            error: error.message
        });
    }
});

// Submit new maintenance request as a tenant
router.post("/tenant/request", verifyToken, authorize('tenant'), async (req, res) => {
    try {
        const tenantId = req.user.id;
        
        // Find tenant's apartment
        const apartment = await Apartment.findOne({ tenant_id: tenantId });
        
        if (!apartment) {
            return res.status(400).json({
                success: false,
                message: "You don't have an assigned apartment"
            });
        }
        
        // Create maintenance request
        const maintenance = new Maintenance({
            description: req.body.description,
            start_date: new Date(),
            apartment_id: apartment._id,
            landlord_id: apartment.landlord_id,
            status: "pending"
        });
        
        await maintenance.save();
        
        res.status(201).json({
            success: true,
            message: "Maintenance request submitted successfully",
            data: maintenance
        });
    } catch (error) {
        console.error("Error creating tenant maintenance request:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting maintenance request",
            error: error.message
        });
    }
});

export default router;