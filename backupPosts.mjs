import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuration
const LOCAL_REPO_PATH = 'C:\\Users\\Yegor\\Marisas-Website';
const HEROKU_API_URL = 'https://afternoon-forest-84891.herokuapp.com/api/posts';
const BACKUP_DIR = path.join(LOCAL_REPO_PATH, 'backups');

// Fetch posts from Heroku
async function fetchPosts() {
    try {
        const response = await fetch(HEROKU_API_URL);

        // Log the raw response to see what is being returned
        const rawText = await response.text();
        console.log('Raw response:', rawText);

        // Try parsing it as JSON
        const posts = JSON.parse(rawText);

        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        // Track the IDs of the current posts
        const currentPostIds = posts.map(post => post.id);

        // Save each post as a JSON file
        posts.forEach(post => {
            const postFilePath = path.join(BACKUP_DIR, `${post.id}.json`);
            fs.writeFileSync(postFilePath, JSON.stringify(post, null, 2));
        });

        // Remove JSON files for deleted posts
        fs.readdirSync(BACKUP_DIR).forEach(file => {
            const postId = path.basename(file, '.json');
            if (!currentPostIds.includes(postId)) {
                fs.unlinkSync(path.join(BACKUP_DIR, file));
            }
        });

        console.log('Posts have been backed up successfully.');

        // Commit and push changes to GitHub
        commitAndPushChanges();

    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Commit and push changes to GitHub
function commitAndPushChanges() {
    exec(`cd ${LOCAL_REPO_PATH} && git add . && git commit -m "Automatic backup of posts" && git push`, (err, stdout, stderr) => {
        if (err) {
            console.error('Error committing and pushing changes:', err);
            return;
        }
        console.log('Changes committed and pushed to GitHub.');
    });
}

// Run the backup
fetchPosts();
