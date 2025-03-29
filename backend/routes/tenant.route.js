import express from "express";
import { verifyToken, authorize } from "../middleware/auth.middleware.js"; // Import verifyToken if separate from authorize
import { 
  getLandlordTenants, 
  getTenantById 
} from "../controllers/tenant.controller.js";

const router = express.Router();

router.get("/landlord-tenants", verifyToken, authorize("landlord"), getLandlordTenants);

// Get details for a specific tenant
router.get("/:id", verifyToken, authorize("landlord"), getTenantById);


export default router;