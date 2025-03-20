import { Apartment } from '../models/apartment.model.js';
import { User } from '../models/user.model.js';
import { Tenant } from '../models/tenant.model.js';

// Function to create a new apartment
export const createApartment = async (req, res) => {
    try {
        const { room, rent, description } = req.body;
        const landlord_id = req.userId; // Fetch the landlord_id from the authenticated user

        // Validate landlord_id
        const landlord = await User.findById(landlord_id);
        if (!landlord || landlord.user_role !== 'landlord') {
            return res.status(400).json({ message: 'Invalid landlord ID' });
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
        const apartments = await Apartment.find({ landlord_id }).populate('landlord_id', 'user_fullname user_email');
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
            .populate('tenant_id', 'tenant_fullname tenant_email tenant_phone') // Fetch tenant details
            .populate('landlord_id', 'user_fullname user_email'); // Fetch landlord details

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



        // Find the tenant
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        // Assign the tenant to the apartment
        apartment.tenant_id = tenantId;
        await apartment.save();

        // Set due date to the current date + 30 days (or your preferred duration)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        // Update all relevant tenant fields
        tenant.apartment_id = apartmentId;
        tenant.room = apartment.room;
        tenant.rent = apartment.rent;
        tenant.status = 'pending'; // or whichever initial status you prefer
        tenant.due_date = dueDate;
        
        await tenant.save();

        res.status(200).json({ 
            message: "Tenant assigned successfully", 
            apartment,
            tenant: {
                _id: tenant._id,
                tenant_fullname: tenant.tenant_fullname,
                tenant_email: tenant.tenant_email,
                room: tenant.room,
                rent: tenant.rent,
                status: tenant.status,
                due_date: tenant.due_date,
                apartment_id: tenant.apartment_id
            }
        });
    } catch (error) {
        console.error("Error assigning tenant:", error);
        res.status(500).json({ message: "Error assigning tenant", error: error.message });
    }
};