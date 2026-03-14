// src/middleware/auth.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect middleware
 * Verifies the JWT from the Authorization header.
 * Attaches req.user = { id, name, email } on success.
 */
async function protect(req, res, next) {
  try {
    // Extract token from "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token. Please log in again.';
      return res.status(401).json({ message });
    }

    // Check user still exists in DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    // Attach minimal user info to request
    req.user = { id: user._id.toString(), name: user.name, email: user.email };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
}

module.exports = { protect };
