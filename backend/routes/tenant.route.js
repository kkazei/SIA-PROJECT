import express from "express";
import { Tenant } from "../models/tenant.model.js";
import { assignTenantToApartment } from "../controllers/apartment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET all tenants by landlord ID using query parameter
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

// GET all tenants by landlord ID using route parameter
router.get("/tenants/landlord/:landlordId", async (req, res) => {
    try {
        const { landlordId } = req.params;
        const tenants = await Tenant.find({ landlord_id: landlordId });

        if (!tenants.length) {
            return res.status(404).json({ message: "No tenants found for this landlord." });
        }

        res.json(tenants);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
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
router.post("/assign-tenant", (req, res, next) => {
    console.log("Request headers:", req.headers);
    console.log("Request cookies:", req.cookies);
    console.log("Request body:", req.body);
    next();
}, verifyToken, (req, res, next) => {
    console.log("After verifyToken, userId:", req.userId);
    next();
}, assignTenantToApartment);

export default router;
