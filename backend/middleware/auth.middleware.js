import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token = req.cookies.jwt || req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Cookies received:', req.cookies);
    console.log('JWT token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. No token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Find user by ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }
    
    console.log('User found:', user._id, 'Role:', user.role);
    
    // Set user information on request object
    req.user = { 
      id: user._id.toString(), 
      role: user.role 
    };
    
    console.log('User set on request:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

export const authorize = (role) => {
  return (req, res, next) => {
    console.log('Checking role authorization. User role:', req.user?.role, 'Required role:', role);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} role required.`
      });
    }
    
    next();
  };
};