// models/Recipe.js

const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    prepTime: {
        type: String,
        required: true
    },
    cookTime: {
        type: String,
        required: true
    },
    servings: {
        type: Number,
        required: true
    },
    ingredients: {
        type: [String],
        required: true
    },
    steps: {
        type: [String],
        required: true
    },
    notes: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
