import express from "express";
import { logout, signup, login, checkAuth, signupTenant, Tenantlogin } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup); 

router.post("/signup-tenant", signupTenant); // Add this line for tenant signup

router.post("/login", login);

router.post("/Tenantlogin", Tenantlogin);

router.post("/logout", logout);

router.get("/check-auth", verifyToken, checkAuth)

export default router;