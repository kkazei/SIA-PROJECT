import express from "express";
import { Tenant } from "../models/tenant.model.js";
import { assignTenantToApartment } from "../controllers/apartment.controller.js";

const router = express.Router();

// GET all tenants created by the authenticated landlord
router.get("/tenants", async (req, res) => {
    try {
        const landlord_id = req.userId; // Fetch the landlord_id from the authenticated user
        const tenants = await Tenant.find({ landlord_id });
        res.status(200).json(tenants);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tenants", error });
    }
});

// GET a single tenant by ID
router.get("/tenants/:id", async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }
        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tenant", error });
    }
});

// Assign a tenant to an apartment
router.post("/assign-tenant", assignTenantToApartment);

export default router;
