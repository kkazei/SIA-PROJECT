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

router.post("/", verifyToken, createMaintenance);
router.get("/", verifyToken, getMaintenances);
router.get("/:id", getMaintenanceById);
router.put("/:id", updateMaintenance);
router.delete("/:id", deleteMaintenance);

export default router;
