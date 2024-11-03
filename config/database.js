const mongoose = require('mongoose');

let isConnected = false; // Track connection status

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return; // Return early if already connected
  }

  try {
    // Attempt connection to MongoDB without deprecated options
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1; // Track connection state
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err; // Re-throw error to be handled by server.js
  }
};

module.exports = connectDB;
