import express from 'express';
import { createApartment, getApartments } from '../controllers/apartment.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { getApartmentsWithTenants } from "../controllers/apartment.controller.js"; 

const router = express.Router();

// Route to create a new apartment, protected by verifyToken middleware
router.post('/apartments', verifyToken, createApartment);
router.get('/apartments', verifyToken, getApartments);
router.get('/apartments-with-tenants', verifyToken, getApartmentsWithTenants);

export default router;