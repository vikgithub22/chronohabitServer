// src/server.js
require('dotenv').config();
const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('  ⏱  ChronoHabit API');
    console.log(`  🚀 Running on http://localhost:${PORT}`);
    console.log(`  🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`  🗄️  MongoDB: ${process.env.MONGODB_URI}`);
    console.log('');
  });
}

start();
