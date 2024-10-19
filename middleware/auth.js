// auth.js - Middleware to Ensure Authentication and Admin Access

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req, res, next) => {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to next middleware/route
    }

    // Handle API requests with a JSON response for unauthorized access
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(401).json({ message: 'Unauthorized - Please log in to access this resource.' });
    }

    // Redirect to login page for non-API requests
    req.flash('error', 'Please log in to access this page');
    res.redirect('/login');
};

// Middleware to ensure the user is an admin
const ensureAdmin = (req, res, next) => {
    // Check if the user is authenticated and is an admin
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next(); // User is authenticated and is an admin, proceed to next middleware/route
    }

    // Handle API requests with a JSON response for forbidden access
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Redirect to login page if not authenticated or to home page if not an admin
    req.flash('error', 'Access denied: Admins only.');
    res.redirect(req.isAuthenticated() ? '/' : '/login');
};

// Middleware to handle login and redirect appropriately
const handleLogin = (req, res) => {
    // Log the logged-in user for debugging purposes
    console.log('Logged in user:', req.user);

    // Redirect based on user role
    if (req.user.isAdmin) {
        return res.redirect('/admin/dashboard');
    } else {
        return res.redirect('/');
    }
};

// Export middleware functions for reuse
module.exports = {
    ensureAuthenticated,
    ensureAdmin,
    handleLogin,
};
