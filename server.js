const app = require('./app');
const connectDB = require('./config/database');

// Enable Trust Proxy for Heroku
app.enable('trust proxy');

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

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