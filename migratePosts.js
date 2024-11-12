const mongoose = require('mongoose');
const Post = require('./models/Post'); // Adjust the path as necessary
const User = require('./models/User'); // Assuming you have a User model for Marisa's account

// Connect to MongoDB
mongoose.connect('mongodb+srv://yegorkushnir1:oMZpOMHFVvHHghmS@cluster0.i1gq4.mongodb.net/recipebyrisa?retryWrites=true&w=majority')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

async function migratePosts() {
    console.log('Starting data migration...');

    // Fetch Marisa's ObjectId from the users collection by email
    const marisa = await User.findOne({ email: 'sushiluvsu' });
    
    if (!marisa) {
        console.error("Marisa's user not found. Exiting migration.");
        return;
    }

    const posts = await Post.find({}); // Retrieve all posts
    let migratedCount = 0;

    for (const post of posts) {
        console.log(`Processing Post ID: ${post._id}`);

        // Assign Marisa's ObjectId as the author if not present
        if (!post.author) {
            post.author = marisa._id;
        }

        // Initialize the recipe structure if missing
        if (!post.recipe) {
            post.recipe = {
                prepTime: post.prepTime || "N/A",
                cookTime: post.cookTime || "N/A",
                servings: post.servings || "N/A",
                ingredients: "",  // Initialize as an empty string
                steps: "",        // Initialize as an empty string
                notes: post.notes || "Created new recipe for missing field"
            };
        } else {
            // Convert ingredients and steps to strings only if they are arrays
            if (Array.isArray(post.recipe.ingredients)) {
                if (post.recipe.ingredients.length === 0) {
                    post.recipe.ingredients = ""; // Empty array converted to empty string
                } else {
                    post.recipe.ingredients = post.recipe.ingredients.join('\n'); // Join non-empty array elements
                }
            } else if (typeof post.recipe.ingredients !== 'string') {
                post.recipe.ingredients = ""; // Default to an empty string if not string or array
            }

            if (Array.isArray(post.recipe.steps)) {
                if (post.recipe.steps.length === 0) {
                    post.recipe.steps = ""; // Empty array converted to empty string
                } else {
                    post.recipe.steps = post.recipe.steps.join('\n'); // Join non-empty array elements
                }
            } else if (typeof post.recipe.steps !== 'string') {
                post.recipe.steps = ""; // Default to an empty string if not string or array
            }
        }

        // Save the updated post
        try {
            await post.save();
            migratedCount++;
            console.log(`Successfully migrated post ID: ${post._id}`);
        } catch (error) {
            console.error(`Failed to save post ID: ${post._id}`, error);
        }
    }

    console.log(`Data migration completed! Migrated ${migratedCount} posts.`);
}

// Run the migration function
migratePosts().then(() => mongoose.connection.close());
