import express from 'express';
import { createApartment, getApartments } from '../controllers/apartment.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Route to create a new apartment, protected by verifyToken middleware
router.post('/apartments', verifyToken, createApartment);
router.get('/apartments', getApartments);
export default router;