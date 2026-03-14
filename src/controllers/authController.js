// src/controllers/authController.js
const { validationResult } = require('express-validator');
const User                 = require('../models/User');
const { signToken, authResponse } = require('../utils/jwt');

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
async function register(req, res, next) {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // Create user (password hashed in pre-save hook)
    const user  = await User.create({ name, email, password });
    const token = signToken(user._id.toString());

    res.status(201).json(authResponse(user, token));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find user and explicitly select password (it is select:false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      // Generic message – don't reveal whether email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id.toString());
    res.json(authResponse(user, token));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 * Protected route – req.user is set by protect middleware.
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
