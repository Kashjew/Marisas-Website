import https from 'https';
import AWS from 'aws-sdk';

// AWS S3 configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
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
    resp.on('end', () => {
        try {
            // Parse the received data to ensure it's valid JSON
            const posts = JSON.parse(data);

            // Generate a timestamped filename for the backup
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `posts-backup-${timestamp}.json`;

            // Prepare the file content for S3
            const params = {
                Bucket: bucketName,
                Key: backupFileName,
                Body: JSON.stringify(posts, null, 2),
                ContentType: "application/json"
            };

            // Upload to S3
            s3.upload(params, function(err, data) {
                if (err) {
                    console.error('Error uploading backup to S3:', err);
                } else {
                    console.log('Backup successfully uploaded to S3:', data.Location);
                }
            });
        } catch (err) {
            console.error('Error processing the received data:', err);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching posts:', err.message);
});
