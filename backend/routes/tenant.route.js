import express from "express";
import { User } from "../models/user.model.js";
import { assignTenantToApartment } from "../controllers/apartment.controller.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import { 
    getAllTenants, 
    getTenantById, 
    updateTenantStatus,
    uploadPaymentQR,
    getTenantDetails
} from "../controllers/tenantDetails.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Set up storage for QR code images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), "uploads/qr-codes");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `qr-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const qrUpload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
}).single("qrImage");

// Routes for landlords to manage tenants
router.get("/landlord/tenants", verifyToken, authorize('landlord'), getAllTenants);
router.get("/landlord/tenants/:id", verifyToken, authorize('landlord'), getTenantById);
router.patch("/landlord/tenants/:id/status", verifyToken, authorize('landlord'), updateTenantStatus);
router.post("/landlord/payment-qr", verifyToken, authorize('landlord'), qrUpload, uploadPaymentQR);
router.post("/landlord/assign-tenant", verifyToken, authorize('landlord'), assignTenantToApartment);

// Routes for tenants
router.get("/tenant/details", verifyToken, authorize('tenant'), getTenantDetails);

// Route to search for users with 'tenant' role (for landlord to assign to apartments)
router.get("/search/tenants", verifyToken, authorize('landlord'), async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: "Search query must be at least 2 characters" 
            });
        }
        
        // Find users with tenant role matching the search query
        const tenants = await User.find({
            role: 'tenant',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('_id name email')
        .limit(10);
        
        res.status(200).json({
            success: true,
            count: tenants.length,
            data: tenants
        });
    } catch (error) {
        console.error("Error searching tenants:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;