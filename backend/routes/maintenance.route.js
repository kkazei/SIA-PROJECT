import express from "express";
import { 
  createMaintenance, 
  getMaintenancesByLandlord, 
  getMaintenanceById, 
  updateMaintenance, 
  deleteMaintenance, 
  getMaintenanceStats,
  archiveMaintenance,
  getArchivedMaintenances,
  restoreArchive,
  permanentlyDeleteMaintenance
} from "../controllers/maintenance.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create maintenance record - only for authenticated users
router.post("/create", verifyToken, createMaintenance);

// Get all maintenance records for logged-in landlord
router.get("/landlord", verifyToken, getMaintenancesByLandlord);

// Get maintenance statistics
router.get("/stats", verifyToken, getMaintenanceStats);

// Archive-related routes
router.get("/archived", verifyToken, getArchivedMaintenances);
router.put("/archive/:id", verifyToken, archiveMaintenance);
router.put("/restore/:id", verifyToken, restoreArchive);

// Permanently delete specific maintenance record by ID
router.delete("/permanent/:id", verifyToken, permanentlyDeleteMaintenance);

// Get, update, delete specific maintenance record by ID
router.get("/:id", verifyToken, getMaintenanceById);
router.put("/:id", verifyToken, updateMaintenance);
router.delete("/:id", verifyToken, deleteMaintenance);

export default router;