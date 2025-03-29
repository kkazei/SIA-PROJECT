import express from "express";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import {
  submitApplication,
  getLandlordApplications,
  getTenantApplications,
  processApplication
} from "../controllers/application.controller.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Tenant routes
router.post("/submit", authorize("tenant"), submitApplication);
router.get("/tenant", authorize("tenant"), getTenantApplications);

// Landlord routes
router.get("/landlord", authorize("landlord"), getLandlordApplications);
router.patch("/:applicationId/process", authorize("landlord"), processApplication);

export default router;