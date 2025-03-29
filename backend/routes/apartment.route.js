import express from 'express';
import { 
    getApartments,
    getApartmentById,
    createApartment,
    updateApartment,
    deleteApartment,
    assignTenant,
    vacateApartment,
    getAvailableApartments,
    getTenantApartment,
    upload
} from '../controllers/apartment.controller.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Landlord routes (require landlord role)
router.get('/', verifyToken, authorize('landlord'), getApartments);
router.get('/:id', verifyToken, authorize('landlord'), getApartmentById);
router.post('/', verifyToken, authorize('landlord'), upload.array('images', 5), createApartment);
router.put('/:id', verifyToken, authorize('landlord'), upload.array('images', 5), updateApartment);
router.delete('/:id', verifyToken, authorize('landlord'), deleteApartment);
router.post('/assign-tenant', verifyToken, authorize('landlord'), assignTenant);
router.post('/vacate', verifyToken, authorize('landlord'), vacateApartment);


// Routes accessible to tenants
router.get('/list/available', verifyToken, authorize('tenant'), getAvailableApartments);
router.get('/tenant/current', verifyToken, authorize('tenant'), getTenantApartment);

export default router;