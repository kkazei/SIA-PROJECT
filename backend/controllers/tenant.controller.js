import { Tenant } from "../models/tenant.model.js";
import { User } from "../models/user.model.js";
import { Apartment } from "../models/apartment.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up storage for QR code images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/qr-codes";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `qr-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
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

// Get all tenants for a landlord
export const getAllTenants = async (req, res) => {
    try {
        const landlord_id = req.userId;
        const tenants = await Tenant.find({ landlord_id });
        res.status(200).json(tenants);
    } catch (error) {
        console.error("Error fetching tenants:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get a specific tenant by ID
export const getTenantById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }
        
        // Check if tenant belongs to the authenticated landlord
        if (tenant.landlord_id.toString() !== req.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        res.status(200).json(tenant);
    } catch (error) {
        console.error("Error fetching tenant:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update tenant status
export const updateTenantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const tenant = await Tenant.findById(req.params.id);
        
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }
        
        // Check if tenant belongs to the authenticated landlord
        if (tenant.landlord_id.toString() !== req.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        tenant.status = status;
        await tenant.save();
        
        res.status(200).json({ message: "Status updated successfully", tenant });
    } catch (error) {
        console.error("Error updating tenant status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Upload payment QR code
export const uploadPaymentQR = async (req, res) => {
    try {
        const { imageUrl, details } = req.body;
        const landlord_id = req.userId;
        
        // First check if a QR already exists for this landlord
        let paymentQR = await PaymentQR.findOne({ landlord_id });
        
        if (paymentQR) {
            // Update existing QR
            paymentQR.imageUrl = imageUrl;
            paymentQR.details = details;
        } else {
            // Create new QR
            paymentQR = new PaymentQR({
                landlord_id,
                imageUrl,
                details
            });
        }
        
        await paymentQR.save();
        res.status(200).json({ message: "Payment QR updated successfully", paymentQR });
    } catch (error) {
        console.error("Error uploading payment QR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get tenant details with apartment information
export const getTenantDetails = async (req, res) => {
    try {
        const tenantId = req.userId;
        console.log("Fetching details for tenant:", tenantId);
        
        // Find the tenant
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }
        
        console.log("Found tenant:", tenant);
        
        // Get landlord details
        const landlord = await User.findById(tenant.landlord_id, 'user_fullname user_email user_phone');
        
        // Get apartment details if assigned
        let apartment = null;
        if (tenant.apartment_id) {
            apartment = await Apartment.findById(tenant.apartment_id);
        }
        
        // Calculate days remaining until due date
        let daysRemaining = null;
        if (tenant.due_date) {
            const dueDate = new Date(tenant.due_date);
            const today = new Date();
            const diffTime = dueDate - today;
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        // Get payment QR code if available
        let paymentQR = null;
        try {
            // Import dynamically if PaymentQR model exists
            const { PaymentQR } = await import('../models/paymentQR.model.js');
            paymentQR = await PaymentQR.findOne({ landlord_id: tenant.landlord_id });
        } catch (err) {
            console.log("PaymentQR model not available yet:", err.message);
        }
        
        // Get announcements if available
        let announcements = [];
        try {
            // Import dynamically if Announcement model exists
            const { Announcement } = await import('../models/post.model.js');
            announcements = await Announcement.find({ landlord_id: tenant.landlord_id })
                .sort({ createdAt: -1 });
        } catch (err) {
            console.log("Announcement model not available yet:", err.message);
        }
        
        res.status(200).json({
            success: true,
            tenant: {
                _id: tenant._id,
                tenant_fullname: tenant.tenant_fullname,
                tenant_email: tenant.tenant_email,
                tenant_phone: tenant.tenant_phone,
                room: tenant.room,
                rent: tenant.rent,
                status: tenant.status,
                due_date: tenant.due_date,
                daysRemaining,
                apartment: apartment ? {
                    _id: apartment._id,
                    room: apartment.room,
                    description: apartment.description,
                    rent: apartment.rent
                } : null,
                landlord: landlord ? {
                    _id: landlord._id,
                    name: landlord.user_fullname,
                    email: landlord.user_email,
                    phone: landlord.user_phone
                } : null,
                paymentQR: paymentQR ? {
                    _id: paymentQR._id,
                    imageUrl: paymentQR.imageUrl,
                    details: paymentQR.details
                } : null,
                announcements: announcements.map(a => ({
                    _id: a._id,
                    title: a.title,
                    content: a.content,
                    createdAt: a.createdAt
                }))
            }
        });
    } catch (error) {
        console.error("Error in getTenantDetails:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};