import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token;
  console.log('*** Auth Middleware Start ***');
  console.log('Headers:', req.headers);
  console.log('JWT Secret from env:', process.env.JWT_SECRET);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token);
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found from token:', req.user);

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message:"Not authorized, no token" });
  }
}

const admin= (req,res,next)=>{
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        res.status(403).json({ message:"Not authorized as an admin"})
    }
}

export { protect, admin }