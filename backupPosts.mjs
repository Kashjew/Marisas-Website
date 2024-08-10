import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// Convert __dirname to work with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory where backups will be stored
const backupDir = path.join(__dirname, 'backups');

// Ensure the backups directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// Fetch posts data from your Heroku app
https.get('https://afternoon-forest-84891-e9a8ed59e554.herokuapp.com/api/posts', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Process the result.
    resp.on('end', () => {
        try {
            // Parse the received data to ensure it's valid JSON
            const posts = JSON.parse(data);

            // Generate a timestamped filename for the backup
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `posts-backup-${timestamp}.json`;

            // Full path to the backup file in the backups directory
            const backupFilePath = path.join(backupDir, backupFileName);

            // Write the backup file
            fs.writeFile(backupFilePath, JSON.stringify(posts, null, 2), (err) => {
                if (err) {
                    console.error('Error writing backup file:', err);
                    throw err;
                }
                console.log('Backup file created successfully at', backupFilePath);
            });
        } catch (err) {
            console.error('Error processing the received data:', err);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching posts:', err.message);
});
