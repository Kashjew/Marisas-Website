/*
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Route to display a specific post in the main view with the modal shown
router.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const postData = await Post.findById(postId).lean(); // Fetch the specific post data
        
        if (!postData) {
            return res.status(404).render('404', { message: 'Post not found' });
        }

        // Log what we're sending to index.ejs
        console.log("Rendering index with:", {
            showRecipeCard: false,
            showPostModal: true,
            recipeId: null,
            postData: postData,
            user: req.user
        });

        // Render `index.ejs` with only the data necessary to show the post modal
        res.render('index', { 
            showRecipeCard: false,
            showPostModal: true,    // Set this to true to trigger the modal
            recipeId: null,
            postData: postData,     // Pass the specific post data for the modal
            user: req.user          // Optional: Pass user info if needed in the header or other parts of the page
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).send("Internal Server Error");
    }
});

// New route to fetch post data for modals as JSON (for AJAX loading)
router.get('/page-data/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Send JSON data for AJAX loading in the modal
        res.json({
            showPost: true,
            postData: post,
            s3BucketName: process.env.AWS_S3_BUCKET_NAME,
            s3Region: process.env.AWS_REGION
        });
    } catch (error) {
        console.error('Error loading post page data:', error);
        res.status(500).json({ message: 'Failed to load post data' });
    }
});

module.exports = router;
*/
