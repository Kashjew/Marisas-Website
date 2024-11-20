const app = require('./app');
const connectDB = require('./config/database');
// Apply middleware for production only
if (process.env.NODE_ENV === 'production') {
  // Enable Trust Proxy for Heroku
  app.enable('trust proxy');

  // Redirect HTTP to HTTPS and non-www to www
  app.use((req, res, next) => {
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';

    // Redirect non-www to www
    if (host === 'recipebyrisa.com') {
      return res.redirect(301, `https://www.recipebyrisa.com${req.url}`);
    }

    // Redirect HTTP to HTTPS
    if (protocol === 'http') {
      return res.redirect(301, `https://${host}${req.url}`);
    }

    next();
  });
}


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