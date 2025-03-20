import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
    getTenantAnnouncements,
    getAllAnnouncementsForTenant 
} from "../controllers/tenant-post.controller.js";

const router = express.Router();

// Main route to get tenant-specific announcements
router.get("/", verifyToken, getTenantAnnouncements);

// Fallback route if the main one fails
router.get("/all", verifyToken, getAllAnnouncementsForTenant);

export default router;