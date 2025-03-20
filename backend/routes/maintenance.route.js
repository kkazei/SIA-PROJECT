import express from "express";
import { 
    createMaintenance, 
    getMaintenances, 
    getMaintenanceById, 
    updateMaintenance, 
    deleteMaintenance 
} from "../controllers/maintenance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Apply verifyToken to all routes
router.post("/", verifyToken, createMaintenance);
router.get("/", verifyToken, getMaintenances);
router.get("/:id", verifyToken, getMaintenanceById);
router.put("/:id", verifyToken, updateMaintenance);
router.delete("/:id", verifyToken, deleteMaintenance);

export default router;