const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');
const Archive = require('../models/Archive');
const HelloSection = require('../models/Hello');  // Retained for potential use in admin-only views

// API Route for Pagination - Fetch posts for infinite scroll
router.get('/posts', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).exec();  // Fetch all posts, no limit or skip
        res.json({ posts });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Error fetching posts');
    }
});

// Route to reorder posts
router.post('/posts/reorder', ensureAuthenticated, ensureAdmin, async (req, res) => {
    const { postOrder } = req.body;

    try {
        for (const post of postOrder) {
            await Post.findByIdAndUpdate(post.id, { order: post.order });
        }

        res.status(200).json({ message: 'Posts reordered successfully' });
    } catch (err) {
        console.error('Error reordering posts:', err);
        res.status(500).json({ message: 'Error reordering posts' });
    }
});


// Route to fetch a single post by ID for modals
router.get('/api/posts/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
    const postId = req.params.id;
    console.log("Received post ID:", postId);
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);  // Return the post data as JSON
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ message: 'Failed to load post for editing.' });
    }
});



// Route: Delete a Post (with Archiving)
router.delete('/posts/:postId', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Move post to Archive collection
        const archivedPost = new Archive(post.toObject());  // Clone the post data
        await archivedPost.save();

        // Delete the post from the original Post collection
        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: 'Post deleted and archived successfully.' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post. Please try again.' });
    }
});

module.exports = router;
