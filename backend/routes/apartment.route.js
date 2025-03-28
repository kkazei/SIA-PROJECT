import express from 'express';
import { 
    createApartment, 
    getApartments, 
    getApartmentsWithTenants,
    assignTenantToApartment 
} from '../controllers/apartment.controller.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apartments - landlord only routes
router.post('/apartments', verifyToken, authorize('landlord'), createApartment);
router.get('/apartments', verifyToken, authorize('landlord'), getApartments);
router.get('/apartments-with-tenants', verifyToken, authorize('landlord'), getApartmentsWithTenants);
router.post('/apartments/assign-tenant', verifyToken, authorize('landlord'), assignTenantToApartment);

// Available apartments - accessible by tenants and landlords
router.get('/apartments/available', verifyToken, async (req, res) => {
    try {
        // Find all available apartments
        const apartments = await Apartment.find({ status: 'available' })
            .populate('landlord_id', 'name email');
        
        res.status(200).json(apartments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get apartment by ID - accessible by both tenants and landlords
router.get('/apartments/:id', verifyToken, async (req, res) => {
    try {
        const apartment = await Apartment.findById(req.params.id)
            .populate('landlord_id', 'name email')
            .populate('tenant_id', 'name email');
        
        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }
        
        // If user is a tenant, they can only view their own apartment or available ones
        if (req.user.role === 'tenant' && 
            apartment.tenant_id && 
            apartment.tenant_id._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // If user is a landlord, they can only view their own apartments
        if (req.user.role === 'landlord' && 
            apartment.landlord_id._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.status(200).json(apartment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// For tenant to view their assigned apartment
router.get('/my-apartment', verifyToken, authorize('tenant'), async (req, res) => {
    try {
        const tenantId = req.user.id;
        const apartment = await Apartment.findOne({ tenant_id: tenantId })
            .populate('landlord_id', 'name email');
        
        if (!apartment) {
            return res.status(404).json({ message: 'You are not assigned to any apartment' });
        }
        
        res.status(200).json(apartment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;