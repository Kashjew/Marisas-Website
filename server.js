const app = require('./app');
const connectDB = require('./config/database');

// Async function to initialize services
(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB(); // Connect to MongoDB once per instance
    console.log("MongoDB connection successful");

    // Start the server regardless of environment
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Error during server setup:", error);
  }
})();

// Export the app for Vercel
module.exports = app;
