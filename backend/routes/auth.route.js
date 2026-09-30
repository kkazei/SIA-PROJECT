import express from "express";
import { logout, signup, login, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, checkAuth, googleCallback, setRole } from "../controllers/auth.controller.js";
import passport from 'passport';
import { verifyToken } from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/authRateLimit.js";

const router = express.Router();

router.post("/signup", authRateLimit, signup);

router.post("/login", authRateLimit, login);

router.post("/logout", logout);

router.post("/verify-email", verifyEmail);

router.post("/resend-verification", verifyToken, resendVerificationEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/check-auth", verifyToken, checkAuth)

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` 
  }),
  googleCallback
);

// Set role route (requires authentication)
router.post('/set-role', verifyToken, setRole);

export default router;