import express from "express";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import { 
    getTenantAnnouncements,
    getAllAnnouncementsForTenant 
} from "../controllers/tenant-post.controller.js";

const router = express.Router();

// Main route to get tenant-specific announcements
// Add tenant role authorization
router.get("/", verifyToken, authorize('tenant'), getTenantAnnouncements);

// Fallback route if the main one fails
// Add tenant role authorization
router.get("/all", verifyToken, authorize('tenant'), getAllAnnouncementsForTenant);

export default router;