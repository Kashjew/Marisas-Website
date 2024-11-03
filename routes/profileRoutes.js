const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Profile Route: Render the user's profile page if authenticated
router.get('/', auth.ensureAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

// Add other profile-related routes if needed, e.g., updating profile information
router.post('/update', auth.ensureAuthenticated, async (req, res) => {
  try {
    // Logic for updating user profile data
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.user._id, { name, email });
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile.');
  }
});

module.exports = router;
