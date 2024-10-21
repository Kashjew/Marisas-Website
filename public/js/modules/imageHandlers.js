import { getAWSS3BucketURL } from './utilities.js';  // Import the S3 utility function

// Function to load post images
export function loadPostImages(post, postId) {
    const postImagesContainer = document.getElementById(`postImages-${postId}`);
    if (postImagesContainer) {
        postImagesContainer.innerHTML = ''; // Clear any existing images

        if (post.imagePaths && post.imagePaths.length > 0) {
            post.imagePaths.forEach(imageKey => {
                if (imageKey) {
                    // Fix: Ensure no double URL construction
                    const isFullUrl = imageKey.startsWith('http');
                    const fullImageUrl = isFullUrl
                        ? imageKey  // Use the full URL as is
                        : `${getAWSS3BucketURL()}/uploads/${imageKey}`;  // Construct the full URL from the bucket URL

                    const img = document.createElement('img');
                    img.src = fullImageUrl;
                    img.alt = post.title || 'Post Image';
                    img.className = 'post-image';
                    postImagesContainer.appendChild(img);
                }
            });
        } else {
            // If no valid image path exists, display the placeholder image
            postImagesContainer.innerHTML = '<img src="/images/placeholder.jpg" alt="No Image Available" class="post-image">';
        }
    } else {
        console.error(`postImages container not found for postId: ${postId}`);
    }
}






// Helper function to get the full image path
export function getImagePath(imagePath) {
    const s3BucketUrl = getAWSS3BucketURL();
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${s3BucketUrl}/${cleanImagePath}`; // Construct the full URL for the image
}
