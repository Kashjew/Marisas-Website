// Set the global bucket name and region for use across the application
export function initializeS3Bucket() {
    if (!window.AWS_S3_BUCKET_NAME) {
        window.AWS_S3_BUCKET_NAME = window.s3BucketUrl || "recipebyrisa"; // Use "recipebyrisa" if not provided
        console.log("AWS S3 bucket name set to:", window.AWS_S3_BUCKET_NAME);
    } else {
        console.log("AWS S3 bucket name is already set to:", window.AWS_S3_BUCKET_NAME);
    }

    if (!window.AWS_REGION) {
        window.AWS_REGION = window.s3Region || "us-east-2"; // Default to "us-east-2"
        console.log("AWS region set to:", window.AWS_REGION);
    } else {
        console.log("AWS region is already set to:", window.AWS_REGION);
    }
}

// Helper function to get the AWS S3 Bucket URL
export function getAWSS3BucketURL() {
    initializeS3Bucket();  // Ensure the bucket is initialized
    if (window.AWS_S3_BUCKET_NAME && window.AWS_REGION) {
        return `https://${window.AWS_S3_BUCKET_NAME}.s3.${window.AWS_REGION}.amazonaws.com`;
    } else {
        console.error("AWS S3 bucket name or region is not set!"); 
        return '';  // Return empty string to avoid errors
    }
}



// Initialize utility functions
export function initUtilities() {
    initializeS3Bucket(); // Call this when the app initializes
}
