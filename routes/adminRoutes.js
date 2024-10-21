const express = require('express');
const router = express.Router();
const { multipleLoggingUpload } = require('../middleware/upload');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Post = require('../models/Post');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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
// Route: Admin Dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const posts = await Post.find();  // Fetch the posts from the database

        // Loop through each post and add a default image if the imagePaths array is empty or contains invalid paths
        posts.forEach(post => {
            if (!post.imagePaths || post.imagePaths.length === 0) {
                post.imagePaths = ['/images/placeholder.jpg'];  // Use placeholder
            } else {
                post.imagePaths = post.imagePaths.map(imagePath => {
                    if (imagePath === '/images/placeholder.jpg') {
                        return imagePath;  // Leave placeholder as is
                    }
                    // Check if imagePath already contains 'https://' (indicating a full URL)
                    if (!imagePath.startsWith('https://')) {
                        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${imagePath.replace(/^\/+/, '')}`;
                    }
                    return imagePath;  // Already a full URL, return as is
                });
            }
        });


        

        // Render the dashboard view and pass the updated posts
        res.render('admin/dashboard', { posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Handle Post Creation with S3 Upload
router.post('/create-post', multipleLoggingUpload, async (req, res) => {
    const { title, content, recipe, instagramLink, tags } = req.body;

    if (!req.files || req.files.length < 1) {
        req.flash('error', 'At least one image is required for the post.');
        return res.redirect('/admin/dashboard');
    }

    const imageUrls = [];

    try {
        console.log("Uploading images for new post...");
        for (const file of req.files) {
            const uniqueFilename = `${uuidv4()}-${file.originalname}`;
            const imageUrl = await uploadImageToS3(file, uniqueFilename);  // Use the S3 upload function
            imageUrls.push(imageUrl);
        }

        // Add logging here to verify the newPost object
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
            imagePaths: imageUrls,  // Store the array of S3 image URLs in the post
        });

        // Log the new post object to verify it contains all the expected data
        console.log("New Post Data:", newPost);

        console.log("Saving new post...");
        await newPost.save();
        console.log("Post saved successfully!");
        res.status(200).json({ message: 'Post created successfully!', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post. Please try again.' });
    }
});

// Route: Edit a Post (AJAX)
router.put('/edit-post/:postId', async (req, res) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    try {
        console.log(`Editing post with ID: ${postId}`);
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                title,
                content,
                tags: tags ? tags.map(tag => tag.trim()) : [],
            },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
});

// Route: Delete a Post (AJAX)
router.delete('/delete-post/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        console.log(`Deleting post with ID: ${postId}`);
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.imagePaths && post.imagePaths.length > 0) {
            console.log('Deleting image from S3...');
            const deleteParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: post.imagePaths[0], // Use the first image key in imagePaths
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
            console.log(`Image ${post.imagePaths[0]} deleted from S3 successfully.`);
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post. Please try again.' });
    }
});

module.exports = router;

/* 
// Commented out user and order management routes for now

// Route: Ban a User (AJAX)
router.post('/ban-user', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(`Banning user with ID: ${userId}`);
        await User.findByIdAndUpdate(userId, { banned: true });
        res.status(200).json({ message: 'User has been banned successfully.' });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ message: 'Failed to ban user. Please try again.' });
    }
});

// Route: Update Order Status (AJAX)
router.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        console.log(`Updating status for order with ID: ${id}`);
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal Server Error - Unable to update order status' });
    }
});

// Route: Delete an Order (Admin Only)
router.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Deleting order with ID: ${id}`);
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: `Order ${id} deleted successfully` });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Internal Server Error - Unable to delete order' });
    }
});
*/

module.exports = router;
