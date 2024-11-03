const cors = require('cors');

// CORS options
const corsOptions = {
  origin: ['http://localhost:3000', 'https://www.recipebyrisa.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
};

// Content Security Policy (CSP) setup
const cspDirectives = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' https://www.instagram.com 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.instagram.com",
    "frame-src 'self' https://www.instagram.com",
    "connect-src 'self' https://www.instagram.com",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Combine CORS with CSP in middleware
module.exports = () => (req, res, next) => {
  // Apply CORS middleware
  cors(corsOptions)(req, res, () => {
    // Apply CSP headers
    res.set(cspDirectives);
    next();
  });
};
