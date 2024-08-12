import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import https from 'https';

// AWS S3 configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const bucketName = process.env.S3_BUCKET_NAME;

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
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `posts-backup-${timestamp}.json`;

            const params = {
                Bucket: bucketName,
                Key: backupFileName,
                Body: JSON.stringify(posts, null, 2),
                ContentType: "application/json"
            };

            try {
                const command = new PutObjectCommand(params);
                const result = await s3.send(command);
                console.log('Backup successfully uploaded to S3:', result.Location);
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
