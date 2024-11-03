require('dotenv').config(); // Load environment variables from .env
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB using the connection string from .env
const MONGODB_URI = process.env.MONGODB_URI;

// Define the Post schema and model
const postSchema = new mongoose.Schema({
    id: Number,
    title: String,
    content: String,
    imagePaths: [String],
    recipe: String,
    instagramLink: String
});

const Post = mongoose.model('Post', postSchema);

async function restorePosts() {
    try {
        // Connect to the MongoDB database
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Read the backup JSON file
        const backupFilePath = path.join(__dirname, 'posts-backup', 'posts-backup-2024-09-24T04-20-35-076Z-23-posts.json');
        const backupData = fs.readFileSync(backupFilePath, 'utf8');
        const parsedData = JSON.parse(backupData);
        const posts = parsedData.posts;

        // Insert posts into the MongoDB database
        const insertedDocs = await Post.insertMany(posts);
        console.log('Posts restored successfully:', insertedDocs);

        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error restoring posts:', error);
    }
}

restorePosts();
