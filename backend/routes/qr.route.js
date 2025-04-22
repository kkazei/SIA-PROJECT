import express from "express";
import { 
    getAllQRImages, 
    getQRImageById, 
    createQRImage, 
    updateQRImage, 
    deleteQRImage,
    getQRImagesForTenant
} from "../controllers/qr.controller.js";
import { upload } from "../controllers/qr.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all QR images for the logged-in landlord
router.get("/", verifyToken, getAllQRImages);

// Get QR images for tenant (from their landlord)
router.get("/tenant/qr-images", verifyToken, getQRImagesForTenant);

// Get a specific QR image by ID
router.get("/:id", verifyToken, getQRImageById);

// Create a new QR image - with file upload support
router.post("/", verifyToken, upload.single('image'), createQRImage);

// Update an existing QR image - with file upload support
router.put("/:id", verifyToken, upload.single('image'), updateQRImage);

// Delete a QR image
router.delete("/:id", verifyToken, deleteQRImage);

export default router;