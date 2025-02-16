import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { upload, createPost, getPosts, updatePost, deletePost } from "../controllers/post.controller.js";

const router = express.Router();

// Define Post Routes
router.post("/", verifyToken, upload.single("image"), createPost);
router.get("/", verifyToken, getPosts);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", deletePost);

export default router;
