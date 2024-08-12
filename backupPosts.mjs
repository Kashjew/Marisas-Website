import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import https from 'https';
import { fromIni } from "@aws-sdk/credential-providers"; // Assumes you're using a profile in the credentials file

// AWS S3 configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const bucketName = process.env.S3_BUCKET_NAME;
const metadataKey = 'backup-metadata.json';  // File to store metadata about backups

// Fetch posts data from your Heroku app
https.get('https://afternoon-forest-84891-e9a8ed59e554.herokuapp.com/api/posts', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Process the result.
    resp.on('end', async () => {
        try {
            const posts = JSON.parse(data);
            const postCount = posts.length;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `posts-backup-${timestamp}-${postCount}-posts.json`;

            // Add post count to the beginning of the JSON data
            const backupData = {
                postCount,
                posts
            };

            const params = {
                Bucket: bucketName,
                Key: backupFileName,
                Body: JSON.stringify(backupData, null, 2),
                ContentType: "application/json"
            };

            try {
                const command = new PutObjectCommand(params);
                const result = await s3.send(command);
                console.log(`Backup successfully uploaded to S3: ${backupFileName}`);

                // Update metadata file with the new backup details
                await updateMetadata(postCount, backupFileName);

            } catch (err) {
                console.error('Error uploading backup to S3:', err);
            }
        } catch (err) {
            console.error('Error processing the received data:', err);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching posts:', err.message);
});

// Function to update the metadata file in S3
async function updateMetadata(postCount, backupFileName) {
    let metadata = [];
    try {
        const command = new GetObjectCommand({ Bucket: bucketName, Key: metadataKey });
        const response = await s3.send(command);
        const data = await streamToString(response.Body);
        metadata = JSON.parse(data);
    } catch (err) {
        console.error('No existing metadata file found, creating a new one.', err);
    }

    metadata.push({ timestamp: new Date().toISOString(), postCount, backupFileName });

    const params = {
        Bucket: bucketName,
        Key: metadataKey,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: "application/json"
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        console.log('Metadata successfully updated.');
    } catch (err) {
        console.error('Error uploading metadata to S3:', err);
    }
}

// Helper function to convert stream to string
function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on("data", chunk => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
}
