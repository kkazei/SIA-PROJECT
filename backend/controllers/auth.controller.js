import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../nodemailer/emails.js";
import jwt from 'jsonwebtoken';
import { clearAuthCookieOptions, getJwtSecret } from "../config/auth.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;
const maximumPasswordLength = 128;

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  avatar: user.avatar,
  googleId: user.googleId
});

const validateCredentials = ({ email, password, name } = {}, includeName = false) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedName = typeof name === "string" ? name.trim() : "";

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    return { error: "Please provide a valid email and password" };
  }
  if (typeof password !== "string" || password.length < minimumPasswordLength || password.length > maximumPasswordLength) {
    return { error: "Please provide a valid email and password" };
  }
  if (includeName && (normalizedName.length < 2 || normalizedName.length > 100)) {
    return { error: "Please provide your name, email, and password" };
  }

  return { email: normalizedEmail, password, name: normalizedName };
};


export const signup = async (req, res) => {
  try {
  const credentials = validateCredentials(req.body, true);
  if (credentials.error) {
    return res.status(400).json({ success: false, message: credentials.error });
  }

  const { email, password, name } = credentials;
  const userAlreadyExists = await User.findOne({ email });
  if(userAlreadyExists){
    return res.status(400).json({success:false, message: "Unable to create account with those details"});
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  const user = new User(
      {email, 
      password:hashedPassword, 
      name, 
      verificationToken, 
      verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000});

  await user.save();

  generateTokenAndSetCookie(res, user);
  let emailSent = true;
  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (emailError) {
    emailSent = false;
    console.error("Verification email delivery failed:", emailError.message);
  }

  res.status(201).json({
      success:true, 
      message: emailSent
        ? "User created successfully"
        : "Account created, but the verification email could not be sent. Please resend it.",
      emailSent,
      user: publicUser(user),
      });

  } catch (error) {
      console.error("Signup failed:", error.message);
      res.status(500).json({success:false, message: "Unable to create account"});
  }
};

export const verifyEmail = async (req, res) => {
  const {code} = req.body;
  try {
      const user = await User.findOne({verificationToken: code, verificationTokenExpiresAt: {$gt: Date.now()}})
      if(!user){
          return res.status(400).json({success:false, message: "Invalid or expired token"});
      }
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined;
      await user.save();

      await sendWelcomeEmail(user.email, user.name);

      res.status(200).json({
          success: true, 
          message: "Email verified successfully. Please select your role.",
          needsRoleSelection: true,
          user: publicUser(user)
      });
  } catch (error) {
        console.error("Email verification failed:", error.message);
      res.status(400).json({success:false, message: "Server Error"});
  }
};

export const login = async (req, res) => {
  try {
      const credentials = validateCredentials(req.body);
      if (credentials.error) {
          return res.status(400).json({ success: false, message: credentials.error });
      }

      const user = await User.findOne({ email: credentials.email }).select("+password");
      if (!user || !user.password){
          return res.status(400).json({success:false, message: "Invalid credentials"});
      }
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if(!isPasswordValid){
          return res.status(400).json({success:false, message: "Invalid credentials"});
      }
      
      generateTokenAndSetCookie(res, user);
      
      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({success:true, message: "Logged in successfully",
            user: publicUser(user)
      });
  } catch (error) {
          console.error("Login failed:", error.message);
          res.status(500).json({success:false, message: "Unable to log in"});
  }
};

export const forgotPassword = async (req, res) => {
    try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const user = emailPattern.test(email) ? await User.findOne({ email }) : null;

        if (!user) {
      return res.status(200).json({ success: true, message: "If the account exists, a reset link has been sent" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        // Add fallback URL if CLIENT_URL is not defined
        const clientURL = process.env.CLIENT_URL || 'https://sia-project-a5xr.onrender.com';
        
        // send email with properly constructed URL
        await sendPasswordResetEmail(user.email, `${clientURL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "If the account exists, a reset link has been sent" });
    } catch (error) {
        console.error("Password reset request failed:", error.message);
        res.status(500).json({ success: false, message: "Unable to process password reset request" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body || {};
        if (typeof password !== "string" || password.length < minimumPasswordLength || password.length > maximumPasswordLength) {
          return res.status(400).json({ success: false, message: "Please provide a valid password" });
        }
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        //update pw
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error("Password reset failed:", error.message);
        res.status(500).json({ success: false, message: "Unable to reset password" });
    }
};

// In your auth.controller.js
export const checkAuth = async (req, res) => {
  try {
      // Get the token from cookies or Authorization header
      const token = req.cookies.jwt || req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
          return res.status(401).json({ success: false, message: 'No token provided' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
      
      // Find user by ID
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Return user data
      return res.status(200).json({
          success: true,
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isVerified: user.isVerified,
              googleId: user.googleId,
              avatar: user.avatar
          }
      });
  } catch (error) {
      console.error('Auth check error:', error);
      return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("jwt", clearAuthCookieOptions);
  res.status(200).json({success:true, message: "Logged out successfully"});
};

export const googleCallback = async (req, res) => {
  try {
    // User is already authenticated by passport at this point
    const clientURL = process.env.CLIENT_URL || 'https://sia-project-a5xr.onrender.com';
    
    // Check if user has a role set
    const needsRoleSelection = !req.user.role || req.user.role === 'unset';
    console.log(`Google auth user: ${req.user.email}, needs role selection: ${needsRoleSelection}`);
    
    // Generate token with user info
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookies with token
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Redirect based on whether user needs to select a role
    if (needsRoleSelection) {
      console.log(`Redirecting to role selection: ${clientURL}/role-selection`);
      res.redirect(`${clientURL}/role-selection`);
    } else {
      console.log(`Redirecting to dashboard: ${clientURL}/dashboard`);
      res.redirect(`${clientURL}/dashboard`);
    }
  } catch (error) {
    console.error('Google callback error:', error);
    const clientURL = process.env.CLIENT_URL || 'https://sia-project-a5xr.onrender.com';
    res.redirect(`${clientURL}/login?error=oauth_failed`);
  }
};

export const setRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['tenant', 'landlord'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Role must be either "tenant" or "landlord"' 
      });
    }
    
    // Check if req.user exists and has the id property
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Find the user using the ID from req.user.id
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.isVerified && !user.googleId) {
      return res.status(403).json({
        success: false,
        message: 'Verify your email before selecting a role'
      });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    // Generate new token with updated role
    generateTokenAndSetCookie(res, user);
    
    res.status(200).json({ 
      success: true, 
      message: 'Role set successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({ success: true, message: "A new verification code has been sent" });
  } catch (error) {
    console.error("Resending verification email failed:", error.message);
    res.status(500).json({ success: false, message: "Unable to send verification email" });
  }
};