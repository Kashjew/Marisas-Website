const mongoose = require('mongoose');

// Define the Recipe Schema for more structured data
const RecipeSchema = new mongoose.Schema({
    prepTime: {
        type: String,
        required: false,
    },
    cookTime: {
        type: String,
        required: false,
    },
    servings: {
        type: String,
        required: false,
    },
    ingredients: {
        type: String, // Changed from Array to String to store HTML
        required: false,
    },
    steps: {
        type: String, // Changed from Array to String to store HTML
        required: false,
    },
    notes: {
        type: String,
        required: false,
    },
});

// Define the Post Schema
const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, // Title is required for every post
    },
    content: {
        type: String,
        required: true, // Content is required for every post
    },
    imagePaths: {
        type: [String], // Array of image paths (S3 URLs)
        required: true, // Ensure at least one image is provided
        default: [], // Default to an empty array
    },
    recipe: {
        type: RecipeSchema, // Recipe is now a sub-document with detailed fields
        required: false,
    },
    instagramLink: {
        type: String,
        required: false, // Instagram link is optional
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true, // Author is required
    },
    tags: {
        type: [String], // Array of tags for categorizing posts
        default: [], // Default is an empty array
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set to current date
    },
    order: {
        type: Number, // Order field to specify display order of posts
        required: false, // Not required; can be set programmatically
    },
});

// Export the Post model
module.exports = mongoose.model('Post', PostSchema);
