import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { getJwtSecret } from '../config/auth.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const authorization = req.header('Authorization');
    const token = req.cookies.jwt || (authorization?.startsWith('Bearer ') ? authorization.slice(7) : null);
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    
    // Find user by ID
    const user = await User.findById(decoded.sub || decoded.id).select('_id role');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid authentication' });
    }
    
    // Set user information on request object
    req.user = { 
      id: user._id.toString(), 
      role: user.role 
    };
    
    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

export const authorize = (role) => {
  return (req, res, next) => {
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