import jwt from "jsonwebtoken";
import { User } from '../models/user.model.js';

export const generateTokenAndSetCookie = async (res, userId) => {
  try {
    // Find user to get the role
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found when generating token');
    }

    const token = jwt.sign(
      { 
        id: userId,  // Changed from userId to id to match what your system expects
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.cookie("jwt", token, {  // Changed from "token" to "jwt" to match what your middleware expects
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
  } catch (error) {
    console.error('Error in generateTokenAndSetCookie:', error);
    throw error;
  }
};