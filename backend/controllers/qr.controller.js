import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { QRimage } from "../models/qrimage.model.js";
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
        // Now using req.user instead of req.userId
        const landlord_id = req.user.id;
        
        // No need for additional user role check since middleware already does this
        // if using the authorize middleware
        
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
        if (post.landlord_id.toString() !== req.user.id) { // Using req.user.id
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
        const landlord_id = req.user.id; // Using req.user.id instead of req.userId
        const image_path = req.file ? `/uploads/${req.file.filename}` : null;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required!" });
        }

        // You can still check the role for extra security, but this should be handled by middleware
        if (req.user.role !== 'landlord') {
            return res.status(403).json({ success: false, message: "Only landlords can create posts" });
        }

        const newPost = new Post({ title, content, landlord_id, image_path });
        await newPost.save();

        res.status(201).json({ success: true, data: newPost });
    } catch (error) {
        console.error("Error in Create Post:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update a Post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const landlord_id = req.user.id; // Using req.user.id
        const image_path = req.file ? `/uploads/${req.file.filename}` : req.body.image_path;

        // Check if post exists and belongs to the landlord
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (post.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this post" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { title, content, image_path },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedPost });
    } catch (error) {
        console.error("Error in Update Post:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete a Post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const landlord_id = req.user.id; // Using req.user.id

        // Check if post exists and belongs to the landlord
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (post.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
        }

        // If post has an image, delete it from the server
        if (post.image_path) {
            const imagePath = path.join(__dirname, '..', post.image_path);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Post.findByIdAndDelete(id);
        res.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error in Delete Post:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getLandlordAnnouncementsForTenant = async (req, res) => {
    try {
        // Only tenants should access this endpoint
        if (req.user.role !== 'tenant') {
            return res.status(403).json({
                success: false,
                message: "Only tenants can access this endpoint"
            });
        }
        
        // First, we need to find the tenant's apartment to get their landlord's ID
        const tenantId = req.user.id;
        
        // Find the apartment where this tenant is assigned
        const apartment = await mongoose.model('Apartment').findOne({ 
            tenant_id: tenantId,
            status: 'occupied'
        });
        
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: "You don't have any assigned apartment"
            });
        }
        
        // Get the landlord ID from the apartment
        const landlordId = apartment.landlord_id;
        
        // Find all announcements from this landlord
        const announcements = await Post.find({ 
            landlord_id: landlordId 
        }).sort({ 
            createdAt: -1 
        });
        
        res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
        
    } catch (error) {
        console.error("Error fetching landlord announcements for tenant:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get all QR images
export const getAllQRImages = async (req, res) => {
    try {
        const landlord_id = req.user.id;
        
        const qrImages = await QRimage.find({ landlord_id }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: qrImages.length,
            data: qrImages
        });
    } catch (error) {
        console.error("Error fetching QR images:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get a single QR image
export const getQRImageById = async (req, res) => {
    try {
        const qrImage = await QRimage.findById(req.params.id);
        
        if (!qrImage) {
            return res.status(404).json({
                success: false,
                message: "QR image not found"
            });
        }
        
        // Check if QR image belongs to logged in landlord
        if (qrImage.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this QR image"
            });
        }
        
        res.status(200).json({
            success: true,
            data: qrImage
        });
    } catch (error) {
        console.error("Error fetching QR image:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Create a QR image
export const createQRImage = async (req, res) => {
    try {
        const { details } = req.body; 
        const landlord_id = req.user.id;
        const image_path = req.file ? `/uploads/qr-codes/${req.file.filename}` : null;

        if (!details) {
            return res.status(400).json({ success: false, message: "Details are required!" });
        }

        if (req.user.role !== 'landlord') {
            return res.status(403).json({ success: false, message: "Only landlords can create QR images" });
        }

        const newQRImage = new QRimage({ details, landlord_id, image_path });
        await newQRImage.save();

        res.status(201).json({ success: true, data: newQRImage });
    } catch (error) {
        console.error("Error in Create QR Image:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update a QR image
export const updateQRImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { details } = req.body;
        const landlord_id = req.user.id;
        const image_path = req.file ? `/uploads/qr-codes/${req.file.filename}` : req.body.image_path;

        // Check if QR image exists and belongs to the landlord
        const qrImage = await QRimage.findById(id);
        if (!qrImage) {
            return res.status(404).json({ success: false, message: "QR image not found" });
        }

        if (qrImage.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this QR image" });
        }

        const updatedQRImage = await QRimage.findByIdAndUpdate(
            id,
            { details, image_path },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedQRImage });
    } catch (error) {
        console.error("Error in Update QR Image:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete a QR image
export const deleteQRImage = async (req, res) => {
    try {
        const { id } = req.params;
        const landlord_id = req.user.id;

        // Check if QR image exists and belongs to the landlord
        const qrImage = await QRimage.findById(id);
        if (!qrImage) {
            return res.status(404).json({ success: false, message: "QR image not found" });
        }

        if (qrImage.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this QR image" });
        }

        // If QR image has an image, delete it from the server
        if (qrImage.image_path) {
            const imagePath = path.join(__dirname, '..', qrImage.image_path);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await QRimage.findByIdAndDelete(id);
        res.json({ success: true, message: "QR image deleted successfully" });
    } catch (error) {
        console.error("Error in Delete QR Image:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get QR images for a tenant
export const getQRImagesForTenant = async (req, res) => {
    try {
        // Only tenants should access this endpoint
        if (req.user.role !== 'tenant') {
            return res.status(403).json({
                success: false,
                message: "Only tenants can access this endpoint"
            });
        }
        
        // Find the tenant's apartment to get their landlord's ID
        const tenantId = req.user.id;
        
        const apartment = await mongoose.model('Apartment').findOne({ 
            tenant_id: tenantId,
            status: 'occupied'
        });
        
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: "You don't have any assigned apartment"
            });
        }
        
        // Get the landlord ID from the apartment
        const landlordId = apartment.landlord_id;
        
        // Find all QR images from this landlord
        const qrImages = await QRimage.find({ 
            landlord_id: landlordId 
        }).sort({ 
            createdAt: -1 
        });
        
        res.status(200).json({
            success: true,
            count: qrImages.length,
            data: qrImages
        });
        
    } catch (error) {
        console.error("Error fetching QR images for tenant:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};