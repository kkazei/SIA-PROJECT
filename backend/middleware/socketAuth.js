import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    console.log('Socket auth middleware processing connection');
    
    // Get token from socket handshake auth
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('Socket auth failed: No token provided');
      return next(new Error('Authentication error: Token missing'));
    }
    
    console.log('Token received, verifying...');
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully for user ID:', decoded.id);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('User not found for ID:', decoded.id);
        return next(new Error('User not found'));
      }
      
      console.log('User found:', user.name || user.email);
      
      // Attach user to socket object
      socket.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return next(new Error('Invalid token'));
    }
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};