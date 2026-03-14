// src/middleware/errorHandler.js

/**
 * Global Express error handler.
 * Must be registered LAST with app.use().
 */
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages[0], errors: messages });
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already in use.` });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message || 'Internal server error';
  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
