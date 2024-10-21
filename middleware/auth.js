// Middleware to ensure the user is authenticated using session-based authentication
const ensureAuthenticated = (req, res, next) => {
    // Log the authentication check
    console.log('Checking if authenticated (session-based)...');

    // Check if the user is authenticated using Passport's session-based method
    if (req.isAuthenticated()) {
        console.log('User is authenticated, proceeding...');
        return next(); // User is authenticated, proceed to the next middleware/route
    }

    console.log('User is not authenticated, redirecting to login.');
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/login');
};

// Middleware to ensure the user is an admin
const ensureAdmin = (req, res, next) => {
    console.log('Checking if user is admin (session-based)...', req.user ? req.user.isAdmin : 'No user');

    // Check if the user is authenticated and is an admin
    if (req.isAuthenticated() && req.user.isAdmin) {
        console.log('User is admin, proceeding...');
        return next(); // User is authenticated and is an admin, proceed to the next middleware/route
    }

    console.log('Admin access denied. Not an admin.');
    req.flash('error', 'Access denied: Admins only.');
    return res.redirect(req.isAuthenticated() ? '/' : '/login');
};

// Middleware to handle login and redirect appropriately based on user role
const handleLogin = (req, res) => {
    // Log the logged-in user for debugging purposes
    console.log('Logged in user:', req.user);

    // Redirect based on user role
    if (req.user.isAdmin) {
        console.log('User is admin, redirecting to /admin/dashboard');
        return res.redirect('/admin/dashboard');
    } else {
        console.log('User is not admin, redirecting to /');
        return res.redirect('/');
    }
};

// Export middleware functions for reuse
module.exports = {
    ensureAuthenticated,
    ensureAdmin,
    handleLogin,
};
