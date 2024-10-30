const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connection successful:', isConnected);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err; // Re-throw error to be handled by server.js
  }
};

module.exports = connectDB;
