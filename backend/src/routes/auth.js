const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'civic_triage_jwt_super_secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new resident with secure password & role validation
 * @access  Public (Rate-limited)
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Full name is required (minimum 2 characters).' });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    
    // Security: Public registration is always locked to 'resident' role
    // Admin and staff roles cannot be self-assigned via public signup
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'resident',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and receive JWT
 * @access  Public (Rate-limited)
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (JWT required)
 */
router.get('/me', auth(true), (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change password for currently authenticated user
 * @access  Private (JWT required)
 */
router.put('/password', auth(true), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
