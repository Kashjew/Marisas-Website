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
    const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
    const fileExtension = file.originalname.split('.').pop();
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const uploadParams = {
        Bucket: bucketName,
        Key: `uploads/${postId}-${fileNameWithoutExt}.${fileExtension}`,  
        Body: file.buffer,
        ContentType: file.mimetype
    };

    console.log('Uploading image with params:', uploadParams);

    try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        console.log('Image successfully uploaded:', data);
        return `https://${bucketName}.s3.amazonaws.com/${uploadParams.Key}`;
    } catch (err) {
        console.error("Error uploading image to S3:", err);
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


// Route: Edit a Post with S3 Upload
router.put('/edit-post/:id', ensureAuthenticated, ensureAdmin, multipleLoggingUpload, async (req, res) => {
    console.log('Incoming request for updating post:', req.params.id);
    console.log('Files received:', req.files);
    console.log('Body data received:', req.body);

    const postId = req.params.id;
    const { title, content, recipe, instagramLink, tags } = req.body;

    try {
        // Fetch the existing post
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            console.error('Post not found:', postId);
            return res.status(404).json({ message: 'Post not found.' });
        }
        console.log('Existing Post:', existingPost);

        let updatedImageUrls = existingPost.imagePaths || [];

        // Handle image uploads if files are present
        if (req.files && req.files.length > 0) {
            try {
                console.log('Processing new image uploads...');
                const uploadedImageUrls = await Promise.all(
                    req.files.map(async (file) => {
                        const imageUrl = await uploadImageToS3(file, postId);
                        console.log('Uploaded Image URL:', imageUrl);
                        return imageUrl;
                    })
                );

                // Update with new image URLs
                updatedImageUrls = uploadedImageUrls;

                // Delete old images from S3
                if (existingPost.imagePaths && existingPost.imagePaths.length > 0) {
                    console.log('Deleting old images from S3...');
                    await Promise.all(
                        existingPost.imagePaths.map(async (oldImagePath) => {
                            const key = oldImagePath.split('.amazonaws.com/')[1];
                            if (!key) {
                                console.warn('Invalid S3 key, skipping:', oldImagePath);
                                return;
                            }

                            try {
                                await s3.send(
                                    new DeleteObjectCommand({
                                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                                        Key: key,
                                    })
                                );
                                console.log('Deleted from S3:', key);
                            } catch (deleteErr) {
                                console.error('Error deleting S3 object:', deleteErr);
                            }
                        })
                    );
                }
            } catch (uploadError) {
                console.error('Error uploading new images:', uploadError);
                return res.status(500).json({ message: 'Image upload failed.', error: uploadError.message });
            }
        } else {
            console.log('No new images uploaded. Retaining existing images.');
        }

        // Parse and update the recipe field
        const updatedRecipe = {
            prepTime: recipe?.prepTime || existingPost.recipe.prepTime,
            cookTime: recipe?.cookTime || existingPost.recipe.cookTime,
            servings: recipe?.servings || existingPost.recipe.servings,
            ingredients: recipe?.ingredients || existingPost.recipe.ingredients,
            steps: recipe?.steps || existingPost.recipe.steps,
            notes: recipe?.notes || existingPost.recipe.notes,
        };

        // Update the post in MongoDB
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                title: title || existingPost.title,
                content: content || existingPost.content,
                recipe: updatedRecipe,
                instagramLink: instagramLink || existingPost.instagramLink,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : existingPost.tags,
                imagePaths: updatedImageUrls,
            },
            { new: true } // Return the updated document
        );

        if (!updatedPost) {
            console.error('Failed to update the post.');
            return res.status(404).json({ message: 'Post not found after update.' });
        }

        console.log('Post updated successfully:', updatedPost);
        res.status(200).json({ message: 'Post updated successfully!', post: updatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.', error: error.message });
    }
});



module.exports = router;


