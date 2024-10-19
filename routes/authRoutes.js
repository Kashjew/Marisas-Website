// authRoutes.js
const express = require('express');
const passport = require('../config/passport');
const { handleLogin } = require('../middleware/auth');
const router = express.Router();

// Login Route (Unified for both Admin and Regular Users)
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error'), adminLogin: false });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
}), handleLogin);

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

// Logout Route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
