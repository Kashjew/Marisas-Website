// config/env.js

// Load environment variables from the .env file
require('dotenv').config();

// Check for required environment variables
const requiredEnvVars = ['MONGO_URI', 'SESSION_SECRET', 'PORT'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing environment variable ${envVar}`);
  }
});

// You can add any other environment-specific configurations here if needed.
