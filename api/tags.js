const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Adjust path if needed

// GET /api/tags - Fetch all unique tags
router.get('/', async (req, res) => {
  try {
    // Get all unique tags from the Post model
    const tags = await Post.distinct('tags');
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).send('Internal Server Error - Unable to fetch tags');
  }
});

module.exports = router;
