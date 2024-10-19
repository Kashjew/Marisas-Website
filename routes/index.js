const express = require('express');
const router = express.Router();
const tagsRouter = require('../api/tags');
const postsRouter = require('../api/posts');
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const adminRoutes = require('./adminRoutes');
const Post = require('../models/Post');

// Authentication routes
router.use(authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// API routes
router.use('/api/posts', postsRouter);
router.use('/api/tags', tagsRouter);

// Profile routes
router.use('/profile', profileRoutes);

// Home Route: Display all posts
router.get('/', async (req, res) => {
  try {
    console.log("User logged in before rendering index:", req.user);

    const posts = await Post.find().populate('author', 'email').sort({ date: -1 });
    const tags = [
      "brownies", "cookies", "cakes", "cinnamon rolls", "savory", "bread", 
      "gluten-free", "non-gluten-free", "quick snacks", "pies", 
      "healthy options", "seasonal recipes", "Summer Recipes", 
      "Winter Recipes", "Fall Recipes", "Spring Recipes"
    ];

    // Pass S3 bucket URL and AWS region via res.locals
    res.locals.s3BucketUrl = process.env.S3_BUCKET_URL;  // Store S3 bucket URL
    res.locals.s3Region = process.env.AWS_REGION;        // Store AWS region

    res.render('index', { posts, user: req.user, tags });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send('Internal Server Error - Unable to fetch posts');
  }
});

// Export the router
module.exports = router;
