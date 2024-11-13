const cors = require('cors');

// CORS options
const corsOptions = {
  origin: ['https://www.recipebyrisa.com', 'http://localhost:3000'],  // Ensure HTTPS is preferred for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,  // Allows cookies and credentials in cross-origin requests
};

// Content Security Policy (CSP) setup
const cspDirectives = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' https://www.instagram.com 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.instagram.com",
    "frame-src 'self' https://www.instagram.com",
    "connect-src 'self' https://www.recipebyrisa.com",  // Ensure API requests are allowed
    "upgrade-insecure-requests"
  ].join('; ')
};

// Combine CORS with CSP in middleware
module.exports = () => (req, res, next) => {
  // Apply CORS middleware with error logging
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error("CORS error:", err);
      res.status(500).send("CORS issue detected");
    } else {
      // Apply CSP headers if CORS was successful
      res.set(cspDirectives);
      next();
    }
  });
};
