const express = require('express');
const router = express.Router();
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');
const Archive = require('../models/Archive');
const HelloSection = require('../models/Hello');
const s3 = require('../config/s3Client');


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

// Function to delete an image from S3
async function deleteImageFromS3(key) {
    const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,  // Path of the image in S3 bucket
    };

    try {
        await s3.send(new DeleteObjectCommand(deleteParams));
        console.log(`Deleted image from S3: ${key}`);
    } catch (error) {
        console.error(`Failed to delete image from S3: ${key}`, error);
        throw new Error('Image deletion from S3 failed');
    }
}

// Route: Delete a Post (with Archiving and S3 Deletion)
router.delete('/posts/:postId', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { postId } = req.params;
        console.log(`Attempting to delete post with ID: ${postId}`);

        const post = await Post.findById(postId);
        if (!post) {
            console.log(`Post with ID ${postId} not found.`);
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Move post to Archive collection
        const archivedPost = new Archive(post.toObject()); // Clone the post data
        await archivedPost.save();
        console.log(`Archived post with ID: ${postId}`);

        // Delete associated images from S3
        if (post.imagePaths && post.imagePaths.length > 0) {
            for (const imagePath of post.imagePaths) {
                // Extract the S3 key from the URL
                const key = imagePath.split(`${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
                if (key) {
                    await deleteImageFromS3(key);
                }
            }
        }

        // Delete the post from the original Post collection
        await Post.findByIdAndDelete(postId);
        console.log(`Deleted post with ID: ${postId} from Post collection`);

        res.status(200).json({ message: 'Post deleted and archived successfully.' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post. Please try again.' });
    }
});

module.exports = router;
