import { User } from "../models/user.model.js";
import { Apartment } from "../models/apartment.model.js";
import { TenantDetails } from "../models/tenantDetails.model.js";
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

export const upload = multer({ 
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
        
        // First find all apartments belonging to this landlord that have tenants
        const apartments = await Apartment.find({ 
            landlord_id, 
            tenant_id: { $ne: null } 
        }).populate('tenant_id', 'name email');
        
        if (apartments.length === 0) {
            return res.status(200).json([]);
        }
        
        // Get the tenant details for each apartment tenant
        const tenantIds = apartments.map(apt => apt.tenant_id);
        
        // Find tenant details
        const tenantDetails = await TenantDetails.find({
            tenant_id: { $in: tenantIds.map(id => id._id) }
        });
        
        // Combine the data
        const tenants = apartments.map(apartment => {
            const details = tenantDetails.find(
                td => td.tenant_id.toString() === apartment.tenant_id._id.toString()
            ) || {};
            
            return {
                tenant_id: apartment.tenant_id._id,
                name: apartment.tenant_id.name,
                email: apartment.tenant_id.email,
                apartment_id: apartment._id,
                room: apartment.room,
                rent: apartment.rent,
                payment_status: details.payment_status || 'pending',
                due_date: details.due_date,
                tenant_phone: details.tenant_phone,
                landlord_id: landlord_id
            };
        });
        
        res.status(200).json(tenants);
    } catch (error) {
        console.error("Error fetching tenants:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get a specific tenant by ID
export const getTenantById = async (req, res) => {
    try {
        const landlord_id = req.userId;
        const tenant_id = req.params.id;
        
        // First check if the tenant is in one of the landlord's apartments
        const apartment = await Apartment.findOne({ 
            landlord_id,
            tenant_id
        }).populate('tenant_id', 'name email');
        
        if (!apartment) {
            return res.status(404).json({ message: "Tenant not found or not associated with your apartments" });
        }
        
        // Get tenant details
        const details = await TenantDetails.findOne({ tenant_id });
        
        const tenant = {
            tenant_id: apartment.tenant_id._id,
            name: apartment.tenant_id.name,
            email: apartment.tenant_id.email,
            apartment_id: apartment._id,
            room: apartment.room,
            rent: apartment.rent,
            payment_status: details ? details.payment_status : 'pending',
            due_date: details ? details.due_date : null,
            tenant_phone: details ? details.tenant_phone : null,
            payment_history: details ? details.payment_history : []
        };
        
        res.status(200).json(tenant);
    } catch (error) {
        console.error("Error fetching tenant:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update tenant payment status
export const updateTenantStatus = async (req, res) => {
    try {
        const { payment_status } = req.body;
        const landlord_id = req.userId;
        const tenant_id = req.params.id;
        
        // First check if the tenant is in one of the landlord's apartments
        const apartment = await Apartment.findOne({ 
            landlord_id,
            tenant_id
        });
        
        if (!apartment) {
            return res.status(404).json({ message: "Tenant not found or not associated with your apartments" });
        }
        
        // Find or create tenant details
        let tenantDetails = await TenantDetails.findOne({ tenant_id });
        
        if (!tenantDetails) {
            tenantDetails = new TenantDetails({
                tenant_id,
                apartment_id: apartment._id,
                landlord_id,
                room: apartment.room,
                rent: apartment.rent
            });
        }
        
        // Update payment status and add to history
        tenantDetails.payment_status = payment_status;
        
        // Add payment history entry if status changed
        tenantDetails.payment_history.push({
            amount: apartment.rent,
            status: payment_status,
            notes: req.body.notes || `Payment status updated to ${payment_status}`
        });
        
        await tenantDetails.save();
        
        res.status(200).json({ 
            message: "Payment status updated successfully", 
            tenantDetails 
        });
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

// Get tenant details with apartment information (for tenant accessing their own info)
export const getTenantDetails = async (req, res) => {
    try {
        const tenantId = req.userId;
        console.log("Fetching details for tenant:", tenantId);
        
        // Find the user
        const tenant = await User.findById(tenantId);
        if (!tenant || tenant.role !== 'tenant') {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }
        
        // Get apartment details
        const apartment = await Apartment.findOne({ tenant_id: tenantId });
        if (!apartment) {
            return res.status(200).json({
                success: true,
                tenant: {
                    _id: tenant._id,
                    name: tenant.name,
                    email: tenant.email,
                    apartment: null,
                    landlord: null
                }
            });
        }
        
        // Get landlord details
        const landlord = await User.findById(apartment.landlord_id, 'name email');
        
        // Get tenant details if they exist
        const tenantDetails = await TenantDetails.findOne({ tenant_id: tenantId });
        
        // Calculate days remaining until due date
        let daysRemaining = null;
        if (tenantDetails && tenantDetails.due_date) {
            const dueDate = new Date(tenantDetails.due_date);
            const today = new Date();
            const diffTime = dueDate - today;
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        // Get payment QR code if available
        let paymentQR = null;
        try {
            // Import dynamically if PaymentQR model exists
            const { PaymentQR } = await import('../models/paymentQR.model.js');
            paymentQR = await PaymentQR.findOne({ landlord_id: apartment.landlord_id });
        } catch (err) {
            console.log("PaymentQR model not available yet:", err.message);
        }
        
        // Get announcements if available
        let announcements = [];
        try {
            // Import dynamically if Post model exists
            const { Post } = await import('../models/post.model.js');
            announcements = await Post.find({ landlord_id: apartment.landlord_id })
                .sort({ createdAt: -1 });
        } catch (err) {
            console.log("Post model not available yet:", err.message);
        }
        
        res.status(200).json({
            success: true,
            tenant: {
                _id: tenant._id,
                name: tenant.name,
                email: tenant.email,
                phone: tenantDetails ? tenantDetails.tenant_phone : null,
                room: apartment.room,
                rent: apartment.rent,
                payment_status: tenantDetails ? tenantDetails.payment_status : 'pending',
                due_date: tenantDetails ? tenantDetails.due_date : null,
                daysRemaining,
                apartment: {
                    _id: apartment._id,
                    room: apartment.room,
                    description: apartment.description,
                    rent: apartment.rent
                },
                landlord: landlord ? {
                    _id: landlord._id,
                    name: landlord.name,
                    email: landlord.email
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