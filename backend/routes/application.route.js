import express from "express";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import multer from "multer";
import {
  submitApplication,
  getLandlordApplications,
  getTenantApplications,
  processApplication,
  getApplicationById,
  getActiveTenantApplication
} from "../controllers/application.controller.js";

const router = express.Router();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');  // Make sure this directory exists
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply authentication middleware to all routes
router.use(verifyToken);

// Tenant routes - Add file upload middleware
router.post("/submit", 
  authorize("tenant"), 
  upload.fields([
    { name: 'validId', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 3 }
  ]),
  submitApplication
);

// Other routes remain the same
router.get("/tenant", authorize("tenant"), getTenantApplications);
router.get("/tenant/:tenantId/active", verifyToken, getActiveTenantApplication);
router.get("/landlord", authorize("landlord"), getLandlordApplications);
router.patch("/:applicationId/process", authorize("landlord"), processApplication);
router.get("/:applicationId", getApplicationById);

export default router;