import express from "express";
import { verifyToken, authorize } from "../middleware/auth.middleware.js"; // Import verifyToken if separate from authorize
import { 
  getLandlordTenants, 
  getTenantById, 
  getTenantsWithNoApartments 
} from "../controllers/tenant.controller.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Now add specific routes with role authorization
router.get("/landlord-tenants", authorize("landlord"), getLandlordTenants);

// Add authentication and authorization to the unassigned route
router.get('/unassigned', authorize("landlord"), getTenantsWithNoApartments);

router.get("/:id", authorize("landlord"), getTenantById);

export default router;