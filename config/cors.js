const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:3000', 'https://www.recipebyrisa.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
};

// Export a function to return the CORS middleware
module.exports = () => cors(corsOptions);
