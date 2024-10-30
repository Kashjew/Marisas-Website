// server.js
const app = require('./app');
const connectDB = require('./config/database');

(async () => {
  try {
    console.log("Skipping MongoDB connection for testing.");
    // await connectDB(); // Comment this out temporarily

    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    }

  } catch (error) {
    console.error("Error during server setup:", error);
  }
})();

module.exports = app;
