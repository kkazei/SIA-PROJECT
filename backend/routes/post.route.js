import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
} from "../controllers/post.controller.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `announcement-${uniqueSuffix}${ext}`);
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Landlord routes - require landlord role
router.get("/", verifyToken, authorize('landlord'), getAllPosts);
router.get("/:id", verifyToken, authorize('landlord'), getPostById);
router.post("/", verifyToken, authorize('landlord'), upload.single('image'), createPost);
router.put("/:id", verifyToken, authorize('landlord'), upload.single('image'), updatePost);
router.delete("/:id", verifyToken, authorize('landlord'), deletePost);

// Tenant route - to view posts from their landlord
router.get("/tenant/announcements", verifyToken, authorize('tenant'), async (req, res) => {
    try {
        const tenantId = req.user.id;
        
        // Find the apartment the tenant is assigned to
        const { Apartment } = await import('../models/apartment.model.js');
        const apartment = await Apartment.findOne({ tenant_id: tenantId });
        
        if (!apartment) {
            return res.status(200).json({
                success: true,
                message: "No apartment assigned to tenant",
                data: []
            });
        }
        
        // Find posts by the landlord
        const { Post } = await import('../models/post.model.js');
        const posts = await Post.find({ 
            landlord_id: apartment.landlord_id 
        }).sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error("Error fetching announcements for tenant:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching announcements",
            error: error.message
        });
    }
});

export default router;