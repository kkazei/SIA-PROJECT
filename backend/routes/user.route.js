import express from "express";
import {
  getAllTenants,
  getUnassignedTenants,
  getTenantById,
  searchTenants,
  getFilteredTenants,
  getUserById
} from "../controllers/user.controller.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();





// Tenant routes
router.get("/tenants", verifyToken, getAllTenants);
router.get("/tenants/unassigned", verifyToken, getUnassignedTenants);
router.get("/tenants/search", verifyToken, searchTenants);
router.get("/tenants/filter", verifyToken, getFilteredTenants);
router.get("/tenants/:id", verifyToken, getTenantById);
router.get('/:id', verifyToken, getUserById);

// Add this route
router.get('/online', verifyToken, (req, res) => {
  try {
    // Get the activeUsers map from app locals
    const activeUsers = req.app.get('activeUsers') || new Map();
    
    // Return list of online user IDs
    const onlineUserIds = Array.from(activeUsers.keys());
    
    res.status(200).json({
      success: true,
      data: onlineUserIds
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting online users'
    });
  }
});

export default router;