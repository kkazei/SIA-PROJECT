import express from "express";
import { logout, signup, login, checkAuth, signupTenant, Tenantlogin } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { User } from "../models/user.model.js";

const router = express.Router();

router.post("/signup", signup); 

router.post("/signup-tenant", signupTenant); // Add this line for tenant signup

router.post("/login", login);

router.post("/tenant-login", Tenantlogin);

router.post("/logout", logout);

router.get("/check-auth", verifyToken, checkAuth)

router.get("/landlords", async (req, res) => {
    try {
        const landlords = await User.find({ user_role: "landlord" }).select("_id user_fullname user_email");
        res.status(200).json({ success: true, landlords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;