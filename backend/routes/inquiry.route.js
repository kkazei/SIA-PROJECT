import express from "express";
import { 
    getTenantInquiries,
    getLandlordInquiries,
    getInquiryById,
    createInquiry,
    addResponse,
    updateInquiryStatus,
    deleteInquiry
} from "../controllers/inquiry.controller.js";
import { upload } from "../controllers/inquiry.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all inquiries for logged-in tenant
router.get("/tenant", verifyToken, getTenantInquiries);

// Get all inquiries for logged-in landlord's properties
router.get("/landlord", verifyToken, getLandlordInquiries);

// Get a specific inquiry by ID
router.get("/:id", verifyToken, getInquiryById);

// Create a new inquiry (tenant only) - with image upload support
router.post("/", verifyToken, upload.array('images', 5), createInquiry);

// Add a response to an inquiry
router.post("/:id/respond", verifyToken, addResponse);

// Update inquiry status (landlord only)
router.patch("/:id/status", verifyToken, updateInquiryStatus);

// Delete an inquiry (admin only)
router.delete("/:id", verifyToken, deleteInquiry);

export default router;