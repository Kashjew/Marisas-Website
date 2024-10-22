const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');

// API Route for Pagination - Fetch posts for infinite scroll
router.get('/api/posts', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).exec();  // Fetch all posts, no limit or skip
        res.json({ posts });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Error fetching posts');
    }
});


// API Route to reorder posts
router.post('/posts/reorder', ensureAuthenticated, ensureAdmin, async (req, res) => {
    const { postOrder } = req.body;

    try {
        // Loop through the post order array and update the position in the database
        for (const post of postOrder) {
            await Post.findByIdAndUpdate(post.id, { order: post.order });
        }

        res.status(200).json({ message: 'Posts reordered successfully' });
    } catch (err) {
        console.error('Error reordering posts:', err);
        res.status(500).json({ message: 'Error reordering posts' });
    }
});

module.exports = router;
