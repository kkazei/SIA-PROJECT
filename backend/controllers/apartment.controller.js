import { Apartment } from '../models/apartment.model.js';
import { User } from '../models/user.model.js';
// Remove the Tenant import since we're using User model for both landlords and tenants

// Function to create a new apartment
export const createApartment = async (req, res) => {
    try {
        const { room, rent, description } = req.body;
        const landlord_id = req.userId; // Fetch the landlord_id from the authenticated user

        // Validate landlord_id
        const landlord = await User.findById(landlord_id);
        if (!landlord || landlord.role !== 'landlord') { // Updated to match your User schema
            return res.status(400).json({ message: 'Invalid landlord ID or user is not a landlord' });
        }

        // Create a new apartment instance
        const newApartment = new Apartment({
            room,
            rent,
            description,
            landlord_id
        });

        // Save the apartment to the database
        const savedApartment = await newApartment.save();

        // Send a success response
        res.status(201).json(savedApartment);
    } catch (error) {
        // Send an error response
        res.status(500).json({ message: error.message });
    }
};

// Function to fetch all apartments created by the authenticated landlord
export const getApartments = async (req, res) => {
    try {
        const landlord_id = req.userId; // Fetch the landlord_id from the authenticated user
        const apartments = await Apartment.find({ landlord_id }).populate('landlord_id', 'name email'); // Updated field names
        res.status(200).json(apartments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to fetch apartments with tenants created by the authenticated landlord
export const getApartmentsWithTenants = async (req, res) => {
    try {
        const landlord_id = req.userId; // Fetch the landlord_id from the authenticated user
        const apartments = await Apartment.find({ landlord_id })
            .populate('tenant_id', 'name email') // Updated to fetch tenant details from User model
            .populate('landlord_id', 'name email'); // Updated field names

        res.status(200).json(apartments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to assign a tenant to an apartment
export const assignTenantToApartment = async (req, res) => {
    try {
        const { apartmentId, tenantId } = req.body;
        const landlord_id = req.userId; // Fetch the landlord_id from the authenticated user
        
        console.log('Request data:', {
            apartmentId,
            tenantId,
            landlord_id: landlord_id,
            requestUserId: req.userId,
            cookies: req.cookies
        });

        // Find the apartment without filtering by landlord_id first
        const apartment = await Apartment.findById(apartmentId);
        
        if (!apartment) {
            return res.status(404).json({ message: "Apartment not found" });
        }
        
        console.log('Apartment found:', {
            apartment_id: apartment._id,
            apartment_landlord: apartment.landlord_id,
            apartment_landlord_str: apartment.landlord_id.toString(),
            requesting_landlord: landlord_id,
            requesting_landlord_str: landlord_id.toString(),
            isMatch: apartment.landlord_id.toString() === landlord_id.toString()
        });
        
        // Check if landlord owns the apartment
        if (apartment.landlord_id.toString() !== landlord_id.toString()) {
            return res.status(403).json({ 
                message: "This apartment is not owned by you",
                apartment_landlord: apartment.landlord_id.toString(),
                requesting_landlord: landlord_id.toString()
            });
        }

        // Find the tenant (now in the User model with role = tenant)
        const tenant = await User.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }
        
        // Check if the user is actually a tenant
        if (tenant.role !== 'tenant') {
            return res.status(400).json({ message: "Selected user is not a tenant" });
        }

        // Assign the tenant to the apartment
        apartment.tenant_id = tenantId;
        apartment.status = 'occupied'; // Update apartment status to occupied
        await apartment.save();

        // Update the tenant with rental information 
        // Note: You may want to create a separate TenantDetails collection for storing rent-specific information
        // For now, we'll return the tenant data from the User model

        res.status(200).json({ 
            message: "Tenant assigned successfully", 
            apartment,
            tenant: {
                _id: tenant._id,
                name: tenant.name,
                email: tenant.email
            }
        });
    } catch (error) {
        console.error("Error assigning tenant:", error);
        res.status(500).json({ message: "Error assigning tenant", error: error.message });
    }
};