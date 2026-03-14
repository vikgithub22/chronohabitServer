// src/config/db.js
const mongoose = require('mongoose');

/**
 * Connect to local MongoDB.
 * Retries once on failure with a 5s delay.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Make sure MongoDB is running: mongod --dbpath C:\\data\\db');
    process.exit(1);
  }
}

module.exports = connectDB;
