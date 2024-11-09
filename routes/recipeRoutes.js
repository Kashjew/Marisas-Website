// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Assuming your Post model contains recipe data

// Route to render a specific recipe card
router.get('/:id', async (req, res) => {
    const recipeId = req.params.id;
    try {
        const recipe = await Post.findById(recipeId);
        if (recipe) {
            // Only pass recipeId and showRecipeCard for the recipe card view
            res.render('index', { recipeId, showRecipeCard: true });
        } else {
            res.status(404).render('404'); // Render 404 if recipe not found
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
        res.status(500).render('500'); // Render 500 on server error
    }
});


// API Route to get specific recipe data for modal
router.get('/api/:id', async (req, res) => {
    const recipeId = req.params.id;
    try {
        const recipe = await Post.findById(recipeId);
        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        console.error('Error fetching recipe data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
