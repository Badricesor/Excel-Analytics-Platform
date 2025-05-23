import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import mongoose from "mongoose"

const protect = async (req, res, next) => {
  console.log('*** Auth Middleware Start ***');
  console.log('Headers:', req.headers);
  console.log('JWT Secret from env:', process.env.JWT_SECRET);

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      console.log('Decoded ID from token:', decoded.id);

      // const user = await User.findById(decoded.id).select('-password');
      // console.log('Backend Found User:', user); // Log the found user
      // req.user = user;

      if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        console.log('Error: Invalid user ID in token');
        return res.status(401).json({ message: 'Not authorized, invalid user ID in token' });
      }

      // Attempt to find the user by the ID from the token
      console.log('Searching for user with ID:', decoded.id);
      req.user = await User.findById(decoded.id).select('-password');
      console.log(`[AUTH-DEBUG] User found and assigned to req.user for request originating from: ${req.originalUrl || req.url}`); // <-- Add this

      console.log('User found from token:', req.user);


      if (!req.user) {
        console.log('Error: User not found with ID:', decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      // ADD THIS LOG:
      console.log(`[AUTH] req.user._id is set to: ${req.user._id}. Calling next().`);

      console.log('Protect middleware successfully populated req.user. Proceeding to next middleware/controller.');
      console.log(`[AUTH-FINAL-CHECK] Request ID: ${req.requestId}. req.user is set: ${!!req.user}. req.user._id: ${req.user._id}. Calling next().`);

      next(); // User found, proceed
    } catch (error) {
      console.error('Error during token verification or user lookup:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export { protect, admin }