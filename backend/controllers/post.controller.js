import { Post } from "../models/post.model.js";
import { Tenant } from "../models/tenant.model.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
export const upload = multer({ storage });

// Get all posts/announcements
export const getAllPosts = async (req, res) => {
    try {
        const landlord_id = req.userId;
        const posts = await Post.find({ landlord_id }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get a single post/announcement
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }
        
        // Check if post belongs to logged in landlord
        if (post.landlord_id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this post"
            });
        }
        
        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Create a Post
export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body; 
        const landlord_id = req.userId; // Fetch landlord ID from authenticated user
        const image_path = req.file ? `/uploads/${req.file.filename}` : null; // Handle uploaded image

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required!" });
        }

        const newPost = new Post({ title, content, landlord_id, image_path });
        await newPost.save();

        res.status(201).json({ success: true, data: newPost });
    } catch (error) {
        console.error("Error in Create Post:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Fetch announcements for the logged-in landlord
export const getPosts = async (req, res) => {
    try {
        const landlord_id = req.userId; // Get landlord ID from token
        const posts = await Post.find({ landlord_id });

        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Edit (Update) a Post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const image_path = req.file ? `/uploads/${req.file.filename}` : req.body.image_path;

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { title, content, image_path },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.json({ success: true, data: updatedPost });
    } catch (error) {
        console.error("Error in Edit Post:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete a Post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error in Delete Post:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

