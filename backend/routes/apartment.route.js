import express from "express";
import { 
  createApartment, 
  updateApartment, 
  deleteApartment, 
  assignTenant, 
  removeTenant,
  getApartments,
  getApartmentById
} from "../controllers/apartment.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apartment CRUD routes
router.post("/", verifyToken, createApartment);
router.get("/", verifyToken, getApartments);
router.get("/:id", verifyToken, getApartmentById);
router.put("/:id", verifyToken, updateApartment);
router.delete("/:id", verifyToken, deleteApartment);

// Tenant management routes
router.post("/assign-tenant", verifyToken, assignTenant);
router.delete("/remove-tenant/:apartmentId", verifyToken, removeTenant);

export default router;