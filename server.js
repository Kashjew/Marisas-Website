// server.js

const app = require('./app');  // Make sure this imports app correctly, including all middleware and routers
const connectDB = require('./config/database'); // Import the connectDB function to connect to MongoDB

// Async function to initialize services
(async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connection successful");

    // Conditionally start the server only in local development
    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    }

  } catch (error) {
    console.error("Error during server setup:", error);
    process.exit(1); // Exit the process with failure
  }
})();

// Export the app for Vercel
module.exports = app;
