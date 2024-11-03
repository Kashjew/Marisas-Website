// models/Archive.js
const mongoose = require('mongoose');

// Define the Recipe Schema
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
        type: [String],
        required: false,
        default: [],
    },
    steps: {
        type: [String],
        required: false,
        default: [],
    },
    notes: {
        type: String,
        required: false,
    },
});

// Define the Archive Schema
const ArchiveSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    imagePaths: {
        type: [String],
        required: true,
        default: [],
    },
    recipe: {
        type: RecipeSchema,
        required: false,
    },
    instagramLink: {
        type: String,
        required: false,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deletedAt: {
        type: Date,
        default: Date.now, // Track when the post was archived
    },
});

// Export the Archive model
module.exports = mongoose.model('Archive', ArchiveSchema);
