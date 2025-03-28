import express from "express";
import {
  getAllTenants,
  getUnassignedTenants,
  getTenantById,
  searchTenants,
  getFilteredTenants
} from "../controllers/user.controller.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();





// Tenant routes
router.get("/tenants", verifyToken, getAllTenants);
router.get("/tenants/unassigned", verifyToken, getUnassignedTenants);
router.get("/tenants/search", verifyToken, searchTenants);
router.get("/tenants/filter", verifyToken, getFilteredTenants);
router.get("/tenants/:id", verifyToken, getTenantById);

export default router;