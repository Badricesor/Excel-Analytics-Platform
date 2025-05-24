import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

const protect = async (req, res, next) => {
  console.log('*** Auth Middleware Start ***');
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);

  let token = req.cookies.token; // First try to get token from cookies

  // Fallback: if no cookie token, try Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('No token found in cookies or headers');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.log('Invalid user ID in token');
      return res.status(401).json({ message: 'Invalid token data' });
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    console.log(`[AUTH] User ${req.user._id} authenticated. Proceeding.`);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export { protect, admin };
