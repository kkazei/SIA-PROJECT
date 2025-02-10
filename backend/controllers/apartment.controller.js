import { Apartment } from '../models/apartment.model.js';
import { User } from '../models/user.model.js';

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