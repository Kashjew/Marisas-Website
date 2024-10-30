const express = require('express');
const router = express.Router();
const { multipleLoggingUpload } = require('../middleware/upload');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');
const HelloSection = require('../models/Hello');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// AWS S3 Client setups
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

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

        res.render('admin/dashboard', { posts, tags, helloContent });
    } catch (error) {
        console.error('Error fetching posts, tags, or helloContent:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Route: Handle Post Creation with S3 Upload (Multiple images)
router.post('/create-post', multipleLoggingUpload, async (req, res) => {
    const { title, content, recipe, instagramLink, tags } = req.body;
    if (!req.files || req.files.length < 1) {
        req.flash('error', 'At least one image is required for the post.');
        return res.redirect('/admin/dashboard');
    }

    const imageUrls = [];
    try {
        for (const file of req.files) {
            const uniqueFilename = `${uuidv4()}-${file.originalname}`;
            const imageUrl = await uploadImageToS3(file, uniqueFilename);
            imageUrls.push(imageUrl);
        }

        const newPost = new Post({
            title,
            content,
            recipe: {
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime,
                servings: recipe.servings,
                ingredients: recipe.ingredients.split('\n').map(item => item.trim()),
                steps: recipe.steps.split('\n').map(item => item.trim()),
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
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post. Please try again.' });
    }
});

module.exports = router;



