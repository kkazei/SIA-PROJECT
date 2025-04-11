import { Apartment } from "../models/apartment.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodeGeocoder from 'node-geocoder';

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

// Configure multer
export const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Initialize geocoder
const geocoder = nodeGeocoder({
    provider: 'openstreetmap'
});

// Get all apartments for a landlord
export const getApartments = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { landlord_id: req.user.id };
        
        // Filter by status if provided
        if (status && ['available', 'occupied', 'maintenance'].includes(status)) {
            filter.status = status;
        }
        
        const apartments = await Apartment.find(filter)
            .populate('tenant_id', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apartments.length,
            data: apartments
        });
    } catch (error) {
        console.error("Error fetching apartments:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get a specific apartment by ID
export const getApartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate apartment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
        }
        
        const apartment = await Apartment.findById(id)
            .populate('tenant_id', 'name email avatar')
            .populate('landlord_id', 'name email avatar');

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: "Apartment not found"
            });
        }

        // Check if user is the landlord or the tenant of this apartment
        const isLandlord = apartment.landlord_id._id.toString() === req.user.id;
        const isTenant = apartment.tenant_id && apartment.tenant_id._id.toString() === req.user.id;

        if (!isLandlord && !isTenant) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to view this apartment' 
            });
        }

        res.status(200).json({
            success: true,
            data: apartment
        });
    } catch (error) {
        console.error("Error fetching apartment:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Create a new apartment
export const createApartment = async (req, res) => {
    try {
        const { 
            room, 
            rent, 
            description, 
            bedrooms, 
            bathrooms, 
            address
        } = req.body;

        // Parse address if it's a string
        let addressData = address;
        if (typeof address === 'string') {
            try {
                addressData = JSON.parse(address);
            } catch (e) {
                console.error('Error parsing address:', e);
                addressData = {};
            }
        }

        // Geocode the address
        let coordinates = {};
        const addressString = `${addressData.street}, ${addressData.city}, ${addressData.state}, ${addressData.zipCode}, ${addressData.country || 'Philippines'}`;
        
        try {
            const geoResults = await geocoder.geocode(addressString);
            
            if (geoResults && geoResults.length > 0) {
                coordinates = {
                    lat: geoResults[0].latitude,
                    lng: geoResults[0].longitude
                };
                console.log(`Geocoded address: ${addressString}`, coordinates);
            }
        } catch (geoError) {
            console.error('Geocoding error:', geoError);
            // Continue without coordinates if geocoding fails
        }

        // Create apartment object with coordinates
        const apartment = new Apartment({
            room,
            rent,
            description,
            bedrooms,
            bathrooms,
            address: {
                ...addressData,
                coordinates
            },
            landlord_id: req.user.id,
            status: 'available'
        });

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            apartment.images = req.files.map(file => `/uploads/${file.filename}`);
            console.log("Saved apartment images:", apartment.images);
        }

        await apartment.save();
        res.status(201).json({
            success: true,
            data: apartment
        });
    } catch (error) {
        console.error("Error creating apartment:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating apartment"
        });
    }
};

// Update an apartment
export const updateApartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            room, 
            rent, 
            description, 
            status,
            bedrooms, 
            bathrooms, 
            address,
            existingImages
        } = req.body;

        // Validate apartment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
        }

        // Find the apartment
        const apartment = await Apartment.findById(id);

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: "Apartment not found"
            });
        }

        // Check if user is the landlord of this apartment
        if (apartment.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this apartment"
            });
        }

        // Process uploaded images
        const newImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                newImages.push(`/uploads/${file.filename}`);
            }
        }

        // Combine existing and new images
        let updatedImages = [];
        
        // If existingImages is provided, use it (handles image reordering or deletion)
        if (existingImages) {
            if (typeof existingImages === 'string') {
                try {
                    updatedImages = JSON.parse(existingImages);
                } catch (e) {
                    console.error('Error parsing existingImages:', e);
                    updatedImages = [];
                }
            } else if (Array.isArray(existingImages)) {
                updatedImages = existingImages;
            }
        } else {
            // If not provided, keep all existing images
            updatedImages = apartment.images || [];
        }
        
        // Add new images
        updatedImages = [...updatedImages, ...newImages];

        // Update fields
        if (room) apartment.room = room;
        if (rent) apartment.rent = Number(rent);
        if (description) apartment.description = description;
        if (status && ['available', 'occupied', 'maintenance'].includes(status)) {
            apartment.status = status;
        }
        if (bedrooms) apartment.bedrooms = Number(bedrooms);
        if (bathrooms) apartment.bathrooms = Number(bathrooms);
        
        // Update images
        apartment.images = updatedImages;

        // Update address if provided
        if (address) {
            let addressData;
            if (typeof address === 'string') {
                try {
                    addressData = JSON.parse(address);
                } catch (e) {
                    console.error('Error parsing address:', e);
                }
            } else if (typeof address === 'object') {
                addressData = address;
            }

            if (addressData) {
                // Geocode the updated address
                let coordinates = apartment.address?.coordinates || {};
                const addressString = `${addressData.street || apartment.address?.street || ''}, 
                                      ${addressData.city || apartment.address?.city || ''}, 
                                      ${addressData.state || apartment.address?.state || ''}, 
                                      ${addressData.zipCode || apartment.address?.zipCode || ''}, 
                                      ${addressData.country || apartment.address?.country || 'Philippines'}`;
                
                try {
                    const geoResults = await geocoder.geocode(addressString);
                    
                    if (geoResults && geoResults.length > 0) {
                        coordinates = {
                            lat: geoResults[0].latitude,
                            lng: geoResults[0].longitude
                        };
                    }
                } catch (geoError) {
                    console.error('Geocoding error:', geoError);
                    // Continue with existing coordinates if geocoding fails
                }

                apartment.address = {
                    street: addressData.street || apartment.address?.street || '',
                    city: addressData.city || apartment.address?.city || '',
                    state: addressData.state || apartment.address?.state || '',
                    zipCode: addressData.zipCode || apartment.address?.zipCode || '',
                    country: addressData.country || apartment.address?.country || 'Philippines',
                    coordinates: coordinates
                };
            }
        }

        await apartment.save();

        res.status(200).json({
            success: true,
            message: "Apartment updated successfully",
            data: apartment
        });

    } catch (error) {
        console.error("Error updating apartment:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Delete an apartment
export const deleteApartment = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate apartment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
        }

        // Find the apartment
        const apartment = await Apartment.findById(id);

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: "Apartment not found"
            });
        }

        // Check if user is the landlord of this apartment
        if (apartment.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this apartment"
            });
        }

        // Check if apartment is occupied
        if (apartment.status === 'occupied') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete an occupied apartment. Please vacate the tenant first."
            });
        }

        // Delete apartment images
        if (apartment.images && apartment.images.length > 0) {
            for (const imagePath of apartment.images) {
                const fullPath = path.join(__dirname, '..', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }

        // Delete the apartment
        await Apartment.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Apartment deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting apartment:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Assign a tenant to an apartment
export const assignTenant = async (req, res) => {
    try {
        const { apartmentId, tenantId } = req.body;
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(apartmentId) || !mongoose.Types.ObjectId.isValid(tenantId)) {
            return res.status(400).json({ success: false, message: 'Invalid apartment or tenant ID' });
        }
        
        // Find the apartment
        const apartment = await Apartment.findById(apartmentId);
        
        if (!apartment) {
            return res.status(404).json({ success: false, message: 'Apartment not found' });
        }
        
        // Check if user is the landlord of this apartment
        if (apartment.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only assign tenants to your own apartments' 
            });
        }
        
        // Check if apartment is available
        if (apartment.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'This apartment is not available for assignment'
            });
        }
        
        // Verify tenant exists and is a tenant
        const tenant = await User.findById(tenantId);
        
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        
        if (tenant.role !== 'tenant') {
            return res.status(400).json({ success: false, message: 'Selected user is not a tenant' });
        }
        
        // Check if tenant is already assigned to another apartment
        const existingAssignment = await Apartment.findOne({
            tenant_id: tenantId,
            status: 'occupied'
        });
        
        if (existingAssignment) {
            return res.status(400).json({ 
                success: false, 
                message: 'This tenant is already assigned to another apartment' 
            });
        }
        
        // Calculate due date (1 month from now)
        const currentDate = new Date();
        const dueDate = new Date();
        dueDate.setMonth(currentDate.getMonth() + 1);
        
        // Update apartment with tenant, change status to occupied, and set due date
        apartment.tenant_id = tenantId;
        apartment.status = 'occupied';
        apartment.paymentInfo = {
            nextDueDate: dueDate,
            lastPaymentDate: null,
            paymentStatus: 'pending'
        };
        
        await apartment.save();
        
        res.status(200).json({
            success: true,
            message: 'Tenant assigned successfully',
            data: apartment
        });
        
    } catch (error) {
        console.error("Error assigning tenant:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Vacate an apartment (remove tenant)
export const vacateApartment = async (req, res) => {
    try {
        const { apartmentId } = req.body;
        
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid apartment ID' });
        }
        
        // Find the apartment
        const apartment = await Apartment.findById(apartmentId);
        
        if (!apartment) {
            return res.status(404).json({ success: false, message: 'Apartment not found' });
        }
        
        // Check if user is the landlord of this apartment
        if (apartment.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only vacate your own apartments' 
            });
        }
        
        // Check if apartment is actually occupied
        if (apartment.status !== 'occupied' || !apartment.tenant_id) {
            return res.status(400).json({
                success: false,
                message: 'This apartment is not currently occupied'
            });
        }
        
        // Update apartment: remove tenant, change status to available, clear payment info
        apartment.tenant_id = null;
        apartment.status = 'available';
        apartment.paymentInfo = {
            nextDueDate: null,
            lastPaymentDate: null,
            paymentStatus: null
        };
        
        await apartment.save();
        
        res.status(200).json({
            success: true,
            message: 'Apartment vacated successfully',
            data: apartment
        });
        
    } catch (error) {
        console.error("Error vacating apartment:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get available apartments for tenants
export const getAvailableApartments = async (req, res) => {
    try {
        const apartments = await Apartment.find({ status: 'available' })
            .populate('landlord_id', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apartments.length,
            data: apartments
        });
    } catch (error) {
        console.error("Error fetching available apartments:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const getTenantApartment = async (req, res) => {
    try {
        // Check if user is a tenant
        if (req.user.role !== 'tenant') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only tenants can access this endpoint' 
            });
        }
        
        // Find apartment where this user is assigned as tenant
        const apartment = await Apartment.findOne({ 
            tenant_id: req.user.id,
            status: 'occupied'
        }).populate('landlord_id', 'name email phone avatar');
        
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: "You don't have any assigned apartment"
            });
        }
        
        // Calculate days remaining until next payment
        let daysRemaining = null;
        let paymentStatus = apartment.paymentInfo?.paymentStatus || 'pending';
        
        if (apartment.paymentInfo && apartment.paymentInfo.nextDueDate) {
            const today = new Date();
            const dueDate = new Date(apartment.paymentInfo.nextDueDate);
            const timeDiff = dueDate - today;
            daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            // Update payment status based on due date
            if (daysRemaining < 0) {
                paymentStatus = 'overdue';
                // Also update the apartment record
                apartment.paymentInfo.paymentStatus = 'overdue';
                await apartment.save();
            }
        }
        
        // Include payment status and days remaining in the response
        const apartmentData = apartment.toObject();
        apartmentData.daysRemaining = daysRemaining;
        apartmentData.paymentStatus = paymentStatus;

        res.status(200).json({
            success: true,
            data: apartmentData
        });
    } catch (error) {
        console.error("Error fetching tenant's apartment:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};