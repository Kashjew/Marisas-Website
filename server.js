// server.js

const app = require('./app');  // Make sure this imports app correctly, including all middleware and routers
const connectDB = require('./config/database'); // Import the connectDB function to connect to MongoDB

// Async function to initialize services without listening on a port
(async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB(); // Ensure connectDB is an async function that returns a promise
    console.log("MongoDB connection successful");

  } catch (error) {
    console.error("Error during server setup:", error);
    process.exit(1); // Exit the process with failure
  }
})();

module.exports = app;
