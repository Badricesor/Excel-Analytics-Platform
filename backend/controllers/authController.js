import User from '../models/userModel.js';
import { genSalt, hash } from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { v4 as uuidv4 } from 'uuid'; // unique IDs

// ------------------- SIGNUP -------------------
const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    if (user) {
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- LOGIN -------------------
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- SOCIAL LOGIN -------------------
const socialLogin = async (req, res) => {
  const { provider, tokenOrProfile } = req.body;

  try {
    let email, username;

    if (provider === 'google') {
      // Simulate Google token validation
      email = 'google.user@example.com';
      username = `Google User ${uuidv4().substring(0, 8)}`;
    } else if (provider === 'facebook') {
      // Simulate Facebook token validation
      email = 'facebook.user@example.com';
      username = `Facebook User ${uuidv4().substring(0, 8)}`;
    } else {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Could not retrieve email from social provider.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = uuidv4();
      const salt = await genSalt(10);
      const hashedPassword = await hash(randomPassword, salt);

      user = await User.create({
        username: username || email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'user',
      });
    }

    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export { signup, login, socialLogin };
