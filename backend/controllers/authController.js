import User from '../models/userModel.js';
import  { genSalt, hash } from "bcryptjs"
import {generateToken} from "../utils/generateToken.js"
import { v4 as uuidv4 } from 'uuid'; // unique IDs

// signup
const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

     // password hashing
     const salt = await genSalt(10);
     const hashedPassword = await hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id,role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// login with google
const socialLogin = async (req, res) => {
  const { provider, tokenOrProfile } = req.body; 

  try {
    let email, username;
    if (provider === 'google') {
      //  Conceptual Example - Replace with your actual Google token verification
      //  You'll likely use a library like 'google-auth-library'.
      console.log('Verifying Google token:', tokenOrProfile);
      // For demonstration purposes, we'll just set some dummy values.
      email = 'google.user@example.com';
      username = `Google User ${uuidv4().substring(0, 8)}`;
    } else if (provider === 'facebook') {
      //  Conceptual Example - Replace with your actual Facebook token verification
      //  You'll likely use the Facebook Graph API or a library.
      console.log('Verifying Facebook token:', tokenOrProfile);
      // For demonstration purposes, we'll just set some dummy values.
      email = 'facebook.user@example.com';
      username = `Facebook User ${uuidv4().substring(0, 8)}`;
    } else {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Could not retrieve email from social provider.' });
    }

    // 2. Check if the user exists with this email.
    let user = await User.findOne({ email });

    // 3. If the user doesn't exist, create them.
    if (!user) {
      // Generate a random password (since the user didn't set one)
      const randomPassword = uuidv4();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        username: username || email.split('@')[0], // Use email prefix as default username
        email,
        password: hashedPassword,
        role: 'user', // Default role for social signup
      });
    }

    // 4. Generate a JWT.
    const token = generateToken(user._id);

    // 5.  Send the user data and token back to the client.
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// // Generate JWT
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };

export { signup, login , socialLogin };