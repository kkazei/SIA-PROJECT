import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../mailtrap/emails.js";
import jwt from 'jsonwebtoken';



export const signup = async (req, res) => {
  const {email, password, name} = req.body;
  try {
  if(!email || !password || !name){
      throw new Error("Please fill all fields");
  }

  const userAlreadyExists = await User.findOne({email});
  console.log("userAlreadyExists", userAlreadyExists);
  if(userAlreadyExists){
      return res.status(400).json({success:false, message: "User already exists"});
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

  // Generate token with user ID
  // Replace this line with direct JWT generation
  // generateTokenAndSetCookie(res, user._id);
  
  // Generate JWT token directly here to ensure it has the right payload
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Set the cookie with the token
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  await sendVerificationEmail(user.email, verificationToken);
  res.status(201).json({
      success:true, 
      message: "User created successfully",
      user: {
          ...user._doc,
          password: undefined,
      },
      });

  } catch (error) {
      res.status(400).json({success:false, message: error.message});
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
          user: {
              ...user._doc,
              password: undefined,
          }
      });
  } catch (error) {
      console.log("error in verifyEmail", error);
      res.status(400).json({success:false, message: "Server Error"});
  }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({success:false, message: "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false, message: "Invalid credentials"});
        }
        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({success:true, message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        console.log("error in login", error);
        res.status(400).json({success:false, message: error.message});
      }
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
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
        console.log("Error in resetPassword ", error);
        res.status(400).json({ success: false, message: error.message });
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
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
    res.clearCookie("token");
    res.status(200).json({success:true, message: "Logged out successfully"});
};

export const googleCallback = async (req, res) => {
  try {
    // User is already authenticated by passport at this point
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // For new users who haven't selected their role yet
    const isNewUser = req.user.createdAt && 
                     ((new Date() - new Date(req.user.createdAt)) < 1000 * 60); // Created in the last minute
    
    // Set cookies
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Redirect based on whether user is new (needs to select role) or existing
    if (isNewUser) {
      res.redirect(`${process.env.CLIENT_URL}/role-selection`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
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
    
    // Update user role
    user.role = role;
    await user.save();
    
    // Generate new token with updated role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
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