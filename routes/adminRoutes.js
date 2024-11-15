const express = require('express');
const router = express.Router();
const { multipleLoggingUpload } = require('../middleware/upload');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');
const HelloSection = require('../models/Hello');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3Client');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Function to upload image to S3
async function uploadImageToS3(file, postId) {
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${postId}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    } catch (err) {
        throw new Error('Image upload failed');
    }
}

// Route: Admin Dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).exec(); // Removed limit(10)
        const tags = ['brownies', 'cakes', 'cookies', 'pies'];
        
        // Use the new HelloSection model instead of Settings
        const settings = await HelloSection.findOne();
        const helloContent = settings ? settings.helloContent : 'Welcome to Marisa’s recipes!';

        posts.forEach(post => {
            if (!post.imagePaths || post.imagePaths.length === 0) {
                post.imagePaths = ['/images/placeholder.jpg'];
            } else {
                post.imagePaths = post.imagePaths.map(imagePath => {
                    if (!imagePath.startsWith('https://')) {
                        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${imagePath.replace(/^\/+/, '')}`;
                    }
                    return imagePath;
                });
            }
        });

        // Pass tinymceApiKey to the template
        res.render('admin/dashboard', { 
            posts, 
            tags, 
            helloContent, 
            tinymceApiKey: process.env.TINYMCE_API_KEY // Add the TinyMCE API key here
        });
    } catch (error) {
        console.error('Error fetching posts, tags, or helloContent:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Handle Post Creation with S3 Upload (Multiple images)
router.post('/create-post', multipleLoggingUpload, async (req, res) => {
    const { title, content, recipe, instagramLink, tags } = req.body;

    // Initialize imageUrls to store the URLs of uploaded images
    let imageUrls = [];

    try {
        if (req.files && req.files.length > 0) {
            // Prevent duplication by logging and verifying files
            const uploadedFiles = new Set();

            for (const file of req.files) {
                if (!uploadedFiles.has(file.originalname)) {
                    const imageUrl = await uploadImageToS3(file, uuidv4());
                    imageUrls.push(imageUrl);
                    uploadedFiles.add(file.originalname);
                }
            }
        }

        const newPost = new Post({
            title,
            content,
            recipe: {
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime,
                servings: recipe.servings,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                notes: recipe.notes,
            },
            instagramLink,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            author: req.user._id,
            imagePaths: imageUrls,
        });

        await newPost.save();
        res.status(200).json({ message: 'Post created successfully!', post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: 'Failed to create post. Please try again.' });
    }
});

module.exports = router;


