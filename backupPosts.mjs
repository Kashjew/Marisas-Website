import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const HEROKU_API_URL = 'https://afternoon-forest-84891-e9a8ed59e554.herokuapp.com/api/posts';
const LOCAL_REPO_PATH = 'C:/Users/Yegor/Marisas-Website';
const BACKUP_DIR = path.join(LOCAL_REPO_PATH, 'backups');

async function fetchPosts() {
    try {
        const response = await fetch(HEROKU_API_URL);
        const posts = await response.json();
        console.log("Fetched posts:", posts);
        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return null;
    }
}

function savePostsLocally(posts) {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(BACKUP_DIR, `posts_backup_${timestamp}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify(posts, null, 2));
    console.log(`Posts have been backed up to ${backupFilePath}`);
}

async function gitCommitAndPush() {
    try {
        // Navigate to the local repo directory
        process.chdir(LOCAL_REPO_PATH);

        // Run Git add, commit, and push commands
        exec('git add .', (err) => {
            if (err) throw err;
            exec('git commit -m "Automatic backup of posts"', (err) => {
                if (err) throw err;
                exec('git push', (err) => {
                    if (err) throw err;
                    console.log('Backup committed and pushed successfully.');
                });
            });
        });
    } catch (error) {
        console.error("Error committing and pushing changes:", error);
    }
}

async function backupPosts() {
    const posts = await fetchPosts();
    if (posts) {
        savePostsLocally(posts);
        await gitCommitAndPush();
    }
}

backupPosts();
