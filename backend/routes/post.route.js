import express from "express";
import { 
    getAllPosts, 
    getPostById, 
    createPost, 
    updatePost, 
    deletePost 
} from "../controllers/post.controller.js";
import { upload } from "../controllers/post.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all posts for the logged-in landlord
router.get("/", verifyToken, getAllPosts);

// Get a specific post by ID
router.get("/:id", verifyToken, getPostById);

// Create a new post - with file upload support
router.post("/", verifyToken, upload.single('image'), createPost);

// Update an existing post - with file upload support
router.put("/:id", verifyToken, upload.single('image'), updatePost);

// Delete a post
router.delete("/:id", verifyToken, deletePost);

export default router;