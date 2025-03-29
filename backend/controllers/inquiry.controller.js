import { Inquiry } from "../models/inquiry.model.js";
import { User } from "../models/user.model.js";
import { Apartment } from "../models/apartment.model.js";
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
        cb(null, "uploads/inquiries/"); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
export const upload = multer({ storage });

// Get all inquiries for a tenant
export const getTenantInquiries = async (req, res) => {
    try {
        // Ensure user is a tenant
        if (req.user.role !== 'tenant') {
            return res.status(403).json({
                success: false,
                message: "Only tenants can access their inquiries"
            });
        }

        const tenant_id = req.user.id;
        
        const inquiries = await Inquiry.find({ tenant_id })
            .sort({ createdAt: -1 })
            .populate('assigned_to', 'name email')
            .populate('responses.responder_id', 'name role');
        
        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        console.error("Error fetching tenant inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get all inquiries for a landlord
export const getLandlordInquiries = async (req, res) => {
    try {
        // Ensure user is a landlord
        if (req.user.role !== 'landlord') {
            return res.status(403).json({
                success: false,
                message: "Only landlords can access these inquiries"
            });
        }

        const landlord_id = req.user.id;
        
        // First get all apartments owned by this landlord
        const apartments = await Apartment.find({ landlord_id });
        const apartmentIds = apartments.map(apt => apt._id);
        
        // Then find inquiries for these apartments
        const inquiries = await Inquiry.find({ apartment_id: { $in: apartmentIds } })
            .sort({ createdAt: -1 })
            .populate('tenant_id', 'name email')
            .populate('apartment_id', 'name unit_number')
            .populate('responses.responder_id', 'name role');
        
        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        console.error("Error fetching landlord inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get a single inquiry
export const getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
            .populate('tenant_id', 'name email')
            .populate('apartment_id', 'name unit_number')
            .populate('assigned_to', 'name email')
            .populate('responses.responder_id', 'name role');
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }
        
        // Check authorization
        if (req.user.role === 'tenant') {
            // Tenants can only view their own inquiries
            if (inquiry.tenant_id._id.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to access this inquiry"
                });
            }
        } else if (req.user.role === 'landlord') {
            // Landlords can view inquiries for their properties
            const apartment = await Apartment.findById(inquiry.apartment_id);
            if (!apartment || apartment.landlord_id.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to access this inquiry"
                });
            }
        }
        
        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error("Error fetching inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Create an inquiry (for tenants)
export const createInquiry = async (req, res) => {
    try {
        // Ensure user is a tenant
        if (req.user.role !== 'tenant') {
            return res.status(403).json({
                success: false,
                message: "Only tenants can create inquiries"
            });
        }

        const { apartment_id, subject, description, category } = req.body;
        const tenant_id = req.user.id;
        
        // Validate tenant is assigned to this apartment
        const apartment = await Apartment.findById(apartment_id);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: "Apartment not found"
            });
        }
        
        if (apartment.tenant_id.toString() !== tenant_id) {
            return res.status(403).json({
                success: false,
                message: "You can only create inquiries for your assigned apartment"
            });
        }
        
        // Process uploaded images if any
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/inquiries/${file.filename}`);
        }
        
        // Create the inquiry
        const newInquiry = new Inquiry({
            apartment_id,
            tenant_id,
            subject,
            description,
            category,
            images,
            // Automatically assign to the landlord of the apartment
            assigned_to: apartment.landlord_id
        });
        
        await newInquiry.save();
        
        res.status(201).json({
            success: true,
            data: newInquiry
        });
    } catch (error) {
        console.error("Error creating inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Add a response to an inquiry
export const addResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const responder_id = req.user.id;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Response message is required"
            });
        }
        
        const inquiry = await Inquiry.findById(id);
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }
        
        // Check authorization
        if (req.user.role === 'tenant') {
            // Tenants can only respond to their own inquiries
            if (inquiry.tenant_id.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to respond to this inquiry"
                });
            }
        } else if (req.user.role === 'landlord') {
            // Landlords can respond to inquiries for their properties
            const apartment = await Apartment.findById(inquiry.apartment_id);
            if (!apartment || apartment.landlord_id.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to respond to this inquiry"
                });
            }
        }
        
        // Add the response
        inquiry.responses.push({
            responder_id,
            message
        });
        
        // If it's a landlord responding, update status to "In Progress" if it's still "Open"
        if (req.user.role === 'landlord' && inquiry.status === 'Open') {
            inquiry.status = 'In Progress';
        }
        
        await inquiry.save();
        
        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error("Error adding response to inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Update inquiry status (landlord only)
export const updateInquiryStatus = async (req, res) => {
    try {
        // Ensure user is a landlord
        if (req.user.role !== 'landlord') {
            return res.status(403).json({
                success: false,
                message: "Only landlords can update inquiry status"
            });
        }

        const { id } = req.params;
        const { status, resolution_type, message } = req.body;
        
        const inquiry = await Inquiry.findById(id);
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }
        
        // Verify this landlord owns the apartment
        const apartment = await Apartment.findById(inquiry.apartment_id);
        if (!apartment || apartment.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this inquiry"
            });
        }
        
        // Update status
        inquiry.status = status;
        
        // If status is Resolved or Closed, add resolution details
        if (status === 'Resolved' || status === 'Closed') {
            inquiry.resolution_type = resolution_type;
            inquiry.resolvedAt = Date.now();
        }
        
        // If status is Approved, set resolution_type to Approved
        if (status === 'Approved') {
            inquiry.resolution_type = 'Approved';
        }
        
        // If a message was provided, add it as a response
        if (message) {
            inquiry.responses.push({
                responder_id: req.user.id,
                message
            });
        }
        
        await inquiry.save();
        
        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error("Error updating inquiry status:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Delete an inquiry (admin functionality)
export const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Only admins should be able to delete inquiries completely
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only admins can delete inquiries"
            });
        }
        
        const inquiry = await Inquiry.findById(id);
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }
        
        // Delete any associated images from the filesystem
        if (inquiry.images && inquiry.images.length > 0) {
            inquiry.images.forEach(image => {
                const imagePath = path.join(__dirname, '..', image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }
        
        await Inquiry.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: "Inquiry deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};