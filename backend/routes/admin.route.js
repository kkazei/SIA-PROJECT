import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import {
    getSystemStats,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllApartments,
    verifyUser,
    resetUserPassword,
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken, authorize('admin'));

// System statistics
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Quick actions
router.patch('/users/:id/verify', verifyUser);
router.post('/users/:id/reset-password', resetUserPassword);

// Resource overview
router.get('/apartments', getAllApartments);
// Removed payment routes

// Announcement management
router.get('/announcements', getAllAnnouncements);
router.get('/announcements/:id', getAnnouncementById);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

export default router;