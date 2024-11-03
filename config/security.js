//const helmet = require('helmet');
//const cors = require('./cors');  // CORS Configuration

// Function to apply all security-related middlewares
//function applySecurity(app) {
  // Set up helmet for basic security headers
 // app.use(helmet());

  // Define and apply refined CSP rules using helmet
// app.use(helmet.contentSecurityPolicy({
//   useDefaults: true,
//   directives: {
//     // Your previous CSP directives here
//   },
// }));

  

  // Apply additional security modules
  //app.use(helmet.xssFilter());  // Protect against XSS
  //app.use(helmet.frameguard({ action: 'deny' }));  // Prevent clickjacking
  
  // Apply the CORS configuration
  //app.use(cors());
//}

//module.exports = applySecurity;
