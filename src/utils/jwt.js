// src/utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for the given user id.
 * @param {string} userId - MongoDB _id as string
 * @returns {string} signed JWT
 */
function signToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Build the standard auth response body.
 */
function authResponse(user, token) {
  return {
    token,
    user: {
      id:    user._id || user.id,
      name:  user.name,
      email: user.email,
    },
  };
}

module.exports = { signToken, authResponse };
