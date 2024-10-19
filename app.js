// Load environment variables
require('./config/env');

const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const cors = require('./config/cors'); // Updated to use the corrected CORS export
const { ensureAuthenticated, ensureAdmin } = require('./middleware/auth'); // Importing middleware functions
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const indexRoutes = require('./routes/index'); // Assuming index contains user-facing routes

// Import MongoDB connection function
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();  // Ensure the MongoDB connection is made

// Initialize app
const app = express();
// Disable view caching to ensure EJS files are always rendered fresh
app.set('view cache', false);

// Set up CORS before other middleware
console.log("Setting up CORS...");
app.use(cors()); // Call the CORS middleware function correctly
console.log("CORS setup complete.");

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global Error Handlers for Debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error:', err);
  process.exit(1);
});

// Middleware Setup
console.log("Applying middleware...");
// Body parsers
console.log("Applying body parsers...");
app.use(express.urlencoded({ extended: true }));
console.log("URL encoded middleware applied.");
app.use(express.json());
console.log("JSON parsing middleware applied.");

// Serve static files
console.log("Serving static files...");
app.use(express.static(path.join(__dirname, 'public')));
console.log("Static files middleware applied.");

// Setup Express session and flash
console.log("Setting up sessions...");
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  })
}));
console.log("Sessions setup complete.");

console.log("Setting up flash messages...");
app.use(flash()); // Setup flash messages
console.log("Flash messages setup complete.");

// Initialize Passport.js
console.log("Initializing Passport.js...");
app.use(passport.initialize());
app.use(passport.session());
console.log("Passport setup complete.");

// Set up global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null; // Add user to locals for easy access in views
  next();
});

// Routes Setup - User and Admin
console.log("Setting up user routes...");
app.use('/', indexRoutes); // Public user-facing routes
app.use('/auth', authRoutes); // Authentication routes (login, logout, OAuth)
app.use('/profile', ensureAuthenticated, profileRoutes); // User profile routes, protected by ensureAuthenticated
console.log("User routes setup complete.");

console.log("Setting up admin routes...");
app.use('/admin', ensureAuthenticated, ensureAdmin, adminRoutes); // Admin routes, protected by ensureAuthenticated and ensureAdmin
console.log("Admin routes setup complete.");

// 404 Page Route
app.use((req, res) => {
  console.error("404 - Route not found");
  res.status(404).render('404', { message: 'The page you are looking for does not exist.' });
});

module.exports = app;
