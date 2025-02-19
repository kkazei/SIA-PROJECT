import express from "express";
import {
    createMaintenance,
    getMaintenance,
    updateMaintenance,
    deleteMaintenance,
    archiveMaintenance,
} from "../controllers/maintenance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createMaintenance);
router.get("/", verifyToken, getMaintenance);
router.put("/:id", verifyToken, updateMaintenance);
router.delete("/:id", verifyToken, deleteMaintenance);
router.put("/archive/:id", verifyToken, archiveMaintenance);

export default router;
