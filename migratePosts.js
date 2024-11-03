const mongoose = require('mongoose');
const Post = require('./models/Post'); // Adjust the path as necessary
const User = require('./models/User'); // Assuming you have a User model for Marisa's account

// Connect to MongoDB
mongoose.connect('mongodb+srv://yegorkushnir1:oMZpOMHFVvHHghmS@cluster0.i1gq4.mongodb.net/recipebyrisa?retryWrites=true&w=majority')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

async function migratePosts() {
    console.log('Starting data migration...');

    // Fetch Marisa's ObjectId from the users collection by email (since the email field is present in the user model)
    const marisa = await User.findOne({ email: 'sushiluvsu' });
    
    if (!marisa) {
        console.error("Marisa's user not found. Exiting migration.");
        return;
    }

    const posts = await Post.find({}); // Retrieve all posts
    let migratedCount = 0;

    for (const post of posts) {
        console.log(`Processing Post ID: ${post._id}`);

        // Check if the author field is undefined or null, and assign Marisa's ObjectId as default if necessary
        if (!post.author) {
            console.log(`Post ID: ${post._id} has no author. Assigning Marisa's ObjectId as the author.`);
            post.author = marisa._id; // Assigning Marisa's ObjectId as the author
        }

        // Check if the recipe field is undefined or null
        if (post.recipe === undefined || post.recipe === null) {
            console.log(`Post ID: ${post._id} has no recipe field. Creating a structured recipe.`);

            // Create a new structured recipe object
            const structuredRecipe = {
                prepTime: post.prepTime || "N/A",
                cookTime: post.cookTime || "N/A",
                servings: post.servings || "N/A",
                ingredients: [],
                steps: [],
                notes: post.notes || "Created new recipe for missing field"
            };

            // Assign the new structured recipe
            post.recipe = structuredRecipe;

            // Save the updated post
            try {
                await post.save();
                migratedCount++;
                console.log(`Successfully migrated post ID: ${post._id} (created new recipe).`);
            } catch (error) {
                console.error(`Failed to save post ID: ${post._id}`, error);
            }

        // Check if the recipe is a string (old format)
        } else if (typeof post.recipe === 'string') {
            console.log(`Migrating post ID: ${post._id} from string format.`);

            // Split the string into an array of lines (ingredients or steps)
            const lines = post.recipe.split('\r\n').filter(line => line.trim() !== "");

            // Prepare structured recipe object
            const structuredRecipe = {
                prepTime: post.prepTime || "N/A",
                cookTime: post.cookTime || "N/A",
                servings: post.servings || "N/A",
                ingredients: lines, // Assuming all lines are ingredients for simplicity
                steps: [], // Adjust logic as necessary
                notes: post.notes || "Migrated from old string format"
            };

            // Assign the structured recipe back to the post
            post.recipe = structuredRecipe;

            // Save the updated post
            try {
                await post.save();
                migratedCount++;
                console.log(`Successfully migrated post ID: ${post._id}`);
            } catch (error) {
                console.error(`Failed to save post ID: ${post._id}`, error);
            }

        // Check if the recipe is an array
        } else if (Array.isArray(post.recipe)) {
            console.log(`Post ID: ${post._id} is already in array format, converting to structured recipe.`);

            // Convert the array to structured format
            const structuredRecipe = {
                prepTime: post.prepTime || "N/A",
                cookTime: post.cookTime || "N/A",
                servings: post.servings || "N/A",
                ingredients: post.recipe, // Treat the array as ingredients
                steps: [], // Adjust based on your logic
                notes: post.notes || "Migrated from old array format"
            };

            // Assign the new structured recipe
            post.recipe = structuredRecipe;

            // Save the updated post
            try {
                await post.save();
                migratedCount++;
                console.log(`Successfully updated post ID: ${post._id} to structured format.`);
            } catch (error) {
                console.error(`Failed to save post ID: ${post._id}`, error);
            }

        // Check if the recipe is already an object
        } else if (typeof post.recipe === 'object' && post.recipe !== null) {
            console.log(`Post ID: ${post._id} is already in structured object format.`);
            // Assuming the post is already in the correct format, skip it
            continue;
        } else {
            console.warn(`Post ID: ${post._id} has an unrecognized recipe format.`);
            continue; // Skip this post as it's not recognized
        }
    }

    console.log(`Data migration completed! Migrated ${migratedCount} posts.`);
}

// Run the migration function
migratePosts().then(() => mongoose.connection.close());
