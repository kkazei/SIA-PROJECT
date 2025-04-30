import express from "express";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import {
  submitApplication,
  getLandlordApplications,
  getTenantApplications,
  processApplication,
  getApplicationById,
  getActiveTenantApplication
} from "../controllers/application.controller.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Tenant routes
router.post("/submit", authorize("tenant"), submitApplication);
router.get("/tenant", authorize("tenant"), getTenantApplications);

// Add this new route
router.get("/tenant/:tenantId/active", verifyToken, getActiveTenantApplication);

// Landlord routes
router.get("/landlord", authorize("landlord"), getLandlordApplications);
router.patch("/:applicationId/process", authorize("landlord"), processApplication);

// Shared routes (for both tenants and landlords)
router.get("/:applicationId", getApplicationById);

export default router;