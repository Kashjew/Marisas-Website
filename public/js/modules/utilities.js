// Set the global bucket name and region for use across the application
export function initializeS3Bucket() {
    // Use the passed value from backend (window.s3BucketUrl) or default to "recipebyrisa"
    if (!window.AWS_S3_BUCKET_NAME) {
        window.AWS_S3_BUCKET_NAME = window.s3BucketUrl || "recipebyrisa"; // <-- This is the change
        console.log("AWS S3 bucket name set to:", window.AWS_S3_BUCKET_NAME); // Log to confirm
    } else {
        console.log("AWS S3 bucket name is already set to:", window.AWS_S3_BUCKET_NAME);
    }

    // Use the passed region from backend (window.s3Region) or default to "us-east-2"
    if (!window.AWS_REGION) {
        window.AWS_REGION = window.s3Region || "us-east-2"; // <-- This is the change
        console.log("AWS region set to:", window.AWS_REGION);
    } else {
        console.log("AWS region is already set to:", window.AWS_REGION);
    }
}

// Helper function to get the AWS S3 Bucket URL
export function getAWSS3BucketURL() {
    // Ensure the bucket name is set first
    initializeS3Bucket();

    // Return the constructed S3 bucket URL with the correct region
    if (window.AWS_S3_BUCKET_NAME && window.AWS_REGION) {
        return `https://${window.AWS_S3_BUCKET_NAME}.s3.${window.AWS_REGION}.amazonaws.com`;
    } else {
        console.error("AWS S3 bucket name or region is not set!"); // Log error if bucket name or region is not set
        return ''; // Return an empty string to avoid further issues
    }
}

// Initialize utility functions
export function initUtilities() {
    initializeS3Bucket(); // Initialize S3 bucket settings
}
