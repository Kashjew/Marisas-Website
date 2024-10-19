const express = require('express');  
const router = express.Router();
const { singleLoggingUpload } = require('../middleware/upload');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// AWS S3 Client setup
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to upload image to S3
async function uploadImageToS3(file, postId) {
    const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
    const fileExtension = file.originalname.split('.').pop();

    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${postId}-${fileNameWithoutExt}.${fileExtension}`,  
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
    } catch (err) {
        console.error("Error uploading image to S3:", err);
        throw new Error('Image upload failed');
    }
}

// Route: Create a new post (updated to handle image upload with logging)
router.post('/', auth.ensureAuthenticated, singleLoggingUpload, async (req, res) => {
    try {
        const { title, content, recipe, instagramLink, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = await uploadImageToS3(req.file, Date.now().toString());
        }

        const newPost = new Post({
            title,
            content,
            recipe,  // Store recipe information directly in the post
            instagramLink,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            author: req.user._id,
            imagePaths: imageUrl ? [imageUrl] : [],
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route: Get all posts (Public)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'email').sort({ date: -1 });
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'No posts found' });
        }
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Route: Get a single post by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid post ID format' });
        }

        const post = await Post.findById(postId).populate('author', 'email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        res.status(500).json({ message: 'Error fetching post' });
    }
});

// Route: Delete a post by ID (Admin handled in adminRoutes.js)
router.delete('/:id', auth.ensureAuthenticated, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.imagePaths && post.imagePaths.length > 0) {
            const deleteParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: post.imagePaths[0],
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: `Post ${postId} deleted` });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// Route: Get posts filtered by tag (Public)
router.get('/tag/:tag', async (req, res) => {
    try {
        const tag = req.params.tag;
        const posts = await Post.find({ tags: tag }).populate('author', 'email').sort({ date: -1 });
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: `No posts found for tag: ${tag}` });
        }
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts by tag:', error);
        res.status(500).json({ message: 'Error fetching posts by tag' });
    }
});

// Route: Fetch recipe details for a post (New implementation)
router.get('/api/recipes/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid post ID format' });
        }

        const post = await Post.findById(postId);
        if (!post || !post.recipe) {
            return res.status(404).json({ message: 'Recipe not found in this post' });
        }

        res.status(200).json(post.recipe);  // Return the recipe information from the post
    } catch (error) {
        console.error('Error fetching recipe by post ID:', error);
        res.status(500).json({ message: 'Error fetching recipe by post ID' });
    }
});

module.exports = router;
