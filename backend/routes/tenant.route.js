import express from "express";
import { Tenant } from "../models/tenant.model.js";
import { assignTenantToApartment } from "../controllers/apartment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
    getAllTenants, 
    getTenantById, 
    updateTenantStatus,
    uploadPaymentQR,
    getTenantDetails  // Add this import
} from "../controllers/tenant.controller.js";

const router = express.Router();

// GET all tenants by landlord ID
router.get("/tenants", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "User ID is required" });

        const tenants = await Tenant.find({ landlord_id: userId });
        res.json(tenants);
    } catch (error) {
        console.error("Error fetching tenants:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET all tenants for the authenticated landlord
router.get("/landlord/tenants", verifyToken, getAllTenants);

// GET a specific tenant by ID
router.get("/tenants/:id", verifyToken, getTenantById);

// Update tenant status (paid, pending, overdue)
router.patch("/tenants/:id/status", verifyToken, updateTenantStatus);

// Upload payment QR code
router.post("/payment-qr", verifyToken, uploadPaymentQR);

// Get tenant details with apartment info
router.get("/tenant/details", verifyToken, getTenantDetails);

// Assign a tenant to an apartment
router.post("/assign-tenant", verifyToken, assignTenantToApartment);

export default router;
