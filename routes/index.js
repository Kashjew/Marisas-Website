const express = require('express');
const router = express.Router();
const { multipleLoggingUpload } = require('../middleware/upload');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');
const postsRouter = require('../api/posts');
require('dotenv').config();

// API route for posts
router.use('/api/posts', postsRouter);

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
        res.locals.s3BucketUrl = process.env.AWS_S3_BUCKET_NAME;
        res.locals.s3Region = process.env.AWS_REGION;

        // Loop through each post and add a default image if the imagePaths array is empty or contains invalid paths
        posts.forEach(post => {
            if (!post.imagePaths || post.imagePaths.length === 0) {
                post.imagePaths = ['/images/placeholder.jpg'];  // Use placeholder
            } else {
                post.imagePaths = post.imagePaths.map(imagePath => {
                    if (imagePath === '/images/placeholder.jpg') {
                        return imagePath;  // Leave placeholder as is
                    }
                    if (!imagePath.startsWith('https://')) {
                        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${imagePath.replace(/^\/+/, '')}`;
                    }
                    return imagePath;
                });
            }
        });

        // Render the index view and pass the updated posts and tags
        res.render('index', { posts, user: req.user, tags });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send('Internal Server Error - Unable to fetch posts');
    }
});

module.exports = router;
