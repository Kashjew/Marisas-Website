require('./config/env');
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session'); // Add session middleware
const flash = require('connect-flash'); // For flash messages
const passport = require('./config/passport');
const MongoStore = require('connect-mongo'); // For session storage in MongoDB
const { ensureAuthenticated, ensureAdmin } = require('./middleware/auth');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const indexRoutes = require('./routes/index');
const adminApiRoutes = require('./routes/adminApiRoutes');


// Initialize app
const app = express();

// Disable view caching to ensure EJS files are always rendered fresh
app.set('view cache', false);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware Setup
console.log("Applying middleware...");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
console.log("URL encoded middleware applied.");
console.log("JSON parsing middleware applied.");

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
console.log("Static files middleware applied.");

// Setup Express session and flash
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a secure session secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }), // Store sessions in MongoDB
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // Set secure cookies only in production with HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week session lifetime
    }
}));
console.log("Session setup complete.");

app.use(flash()); // Setup flash messages
console.log("Flash messages setup complete.");

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session()); // Enable Passport to manage sessions
console.log("Passport setup complete.");

// Set up global variables for flash messages and S3 config
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; // Add user to locals for easy access in views
    res.locals.s3BucketUrl = process.env.AWS_S3_BUCKET_NAME || "recipebyrisa"; // Pass S3 bucket URL to EJS
    res.locals.s3Region = process.env.AWS_REGION || "us-east-2"; // Pass AWS region to EJS
    next();
});

// Routes Setup - User and Admin
app.use('/', indexRoutes); // Public user-facing routes
app.use('/', authRoutes); // Authentication routes (login, logout, OAuth)
app.use('/api', adminApiRoutes);
app.use('/profile', ensureAuthenticated, profileRoutes); // User profile routes, protected by ensureAuthenticated
app.use('/admin', ensureAuthenticated, ensureAdmin, adminRoutes); // Admin routes, protected by ensureAuthenticated and ensureAdmin

// 404 Page Route
app.use((req, res) => {
  res.status(404).render('404', { message: 'The page you are looking for does not exist.' });
});

module.exports = app;
