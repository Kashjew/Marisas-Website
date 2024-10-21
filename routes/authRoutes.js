const express = require('express');
const passport = require('../config/passport');
const { handleLogin } = require('../middleware/auth');  // Retain handleLogin
const router = express.Router();

// Login Route (GET) - Renders the login page
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error'), adminLogin: false });
});

// Login Route (POST) - Authenticates using Passport and redirects
router.post('/login', passport.authenticate('local', { 
    failureRedirect: '/login', 
    failureFlash: true 
}), handleLogin);  // Use handleLogin after successful login

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  failureFlash: true,
}), handleLogin);

// Facebook OAuth Routes
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/login',
  failureFlash: true,
}), handleLogin);

// Logout Route (session-based)
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return next(err);
    }
    res.redirect('/');  // Redirect to home after successful logout
  });
});

module.exports = router;
