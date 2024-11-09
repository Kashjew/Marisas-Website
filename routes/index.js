const express = require('express');
const router = express.Router();
const { multipleLoggingUpload } = require('../middleware/upload');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');
const HelloSection = require('../models/Hello');  // Use the HelloSection models
const fs = require('fs');
const path = require('path');
const postsRouter = require('../api/posts');
require('dotenv').config();

// API route for posts
router.use('/api/posts', postsRouter);

// Home Route: Display homepage with Hello section, Latest Post, and Recipe Section
router.get('/', async (req, res) => {
    try {
        // Log the user's session details for tracking purposes
        console.log("Rendering homepage for user:", req.user ? req.user.username : "Guest");

        // Fetch Hello section content from the HelloSection collection
        const settings = await HelloSection.findOne();
        const helloContent = settings ? settings.helloContent : 'Welcome to Marisa’s recipes!';

        // Fetch posts ordered by the admin-defined order field
        const posts = await Post.find().sort({ order: 1 }).limit(13).exec();

        if (!posts || posts.length === 0) {
            console.warn("No posts available for homepage display.");
        }

        const latestPost = posts[0];  // First post in the order for Latest Post section
        const recipePosts = posts.slice(1);  // Remaining posts for the Recipe Section

        const tags = [
            "brownies", "cookies", "cakes", "cinnamon rolls", "savory", "bread",
            "gluten-free", "non-gluten-free", "quick snacks", "pies",
            "healthy options", "seasonal recipes", "Summer Recipes",
            "Winter Recipes", "Fall Recipes", "Spring Recipes"
        ];

        // Render the index view with Hello section, Latest Post, Recipe Section posts, and tags
        res.render('index', { 
            helloContent,         // Hello section content
            latestPost,           // Latest Post section content
            recipePosts,          // Limited to 9 posts for Recipe Section
            user: req.user,
            tags,
            showRecipeCard: false, // Pass showRecipeCard as false by default for the home page
            recipeId: null        // No specific recipe ID for the home page
        });
    } catch (error) {
        console.error("Error fetching homepage content:", error);
        res.status(500).send('Internal Server Error - Unable to load the homepage');
    }
});

// Route to fetch post details by ID in JSON format
router.get('/api/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);  // Respond with post data as JSON
    } catch (error) {
        console.error('Error fetching post data:', error);
        res.status(500).json({ error: 'Failed to load post data' });
    }
});

// Consolidated Route to update the "Hello" section content
router.post('/api/update-hello-section', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

        // Update or create the Hello section content
        const settings = await HelloSection.findOneAndUpdate(
            {},
            { helloContent: content },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Hello section updated successfully', settings });
    } catch (error) {
        console.error("Error updating Hello section:", error);
        res.status(500).json({ success: false, message: 'Error updating Hello section' });
    }
});

module.exports = router;
