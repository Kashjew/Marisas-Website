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
        mongoose.connection.close();
        return;
    }

    // Fetch all posts in reverse chronological order based on creation date
    const posts = await Post.find({}).sort({ createdAt: -1 }); // Newest posts first
    let migratedCount = 0;

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        console.log(`Processing Post ID: ${post._id}`);

        // Assign the `author` if missing
        if (!post.author) {
            post.author = marisa._id;
            console.log(`Assigned author to Post ID: ${post._id}`);
        }

        // Set the `order` field
        post.order = i + 1; // `order: 1` for the newest post, `order: 2` for the next, etc.
        console.log(`Assigned order ${post.order} to Post ID: ${post._id}`);

        // Recipe field migration logic
        if (post.recipe === undefined || post.recipe === null) {
            post.recipe = {
                prepTime: post.prepTime || "N/A",
                cookTime: post.cookTime || "N/A",
                servings: post.servings || "N/A",
                ingredients: [],
                steps: [],
                notes: post.notes || "Created new recipe for missing field"
            };
            console.log(`Created new structured recipe for Post ID: ${post._id}`);
        } else if (typeof post.recipe === 'string') {
            const lines = post.recipe.split('\r\n').filter(line => line.trim() !== "");
            post.recipe = {
                prepTime: post.prepTime || "N/A",
                cookTime: post.cookTime || "N/A",
                servings: post.servings || "N/A",
                ingredients: lines,
                steps: [],
                notes: post.notes || "Migrated from old string format"
            };
            console.log(`Migrated string format recipe to structured format for Post ID: ${post._id}`);
        } else if (Array.isArray(post.recipe)) {
            post.recipe = {
                prepTime: post.prepTime || "N/A",
                cookTime: post.cookTime || "N/A",
                servings: post.servings || "N/A",
                ingredients: post.recipe,
                steps: [],
                notes: post.notes || "Migrated from old array format"
            };
            console.log(`Migrated array format recipe to structured format for Post ID: ${post._id}`);
        }

        // Save the updated post to MongoDB
        try {
            await post.save();
            migratedCount++;
            console.log(`Successfully migrated post ID: ${post._id} with order ${post.order}`);
        } catch (error) {
            console.error(`Failed to save post ID: ${post._id}`, error);
        }
    }

    console.log(`Data migration completed! Migrated ${migratedCount} posts.`);
    mongoose.connection.close();
}

// Run the migration function
migratePosts().then(() => console.log("Migration script finished running."));
