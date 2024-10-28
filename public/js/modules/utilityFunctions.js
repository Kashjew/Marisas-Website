import { getAWSS3BucketURL, initializeS3Bucket } from './utilities.js';

// Function to populate tags
export function populateTags(post, postId) {
    const tagsContainer = document.getElementById(`postTags-${postId}`);
    if (tagsContainer) {
        tagsContainer.innerHTML = ''; // Clear any existing tags
        if (post.tags && post.tags.length > 0) {
            post.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'post-tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        } else {
            tagsContainer.innerHTML = '<p>No tags available.</p>';
        }
    } else {
        console.error(`postTags container not found for postId: ${postId}`);
    }
}

// Function to embed Instagram post
export function embedInstagramPost(post, postId) {
    console.log("Attempting to embed Instagram post:", post.instagramLink, "for postId:", postId);  // Debug log
    const instagramEmbedElement = document.getElementById(`instagramEmbed-${postId}`);
    
    if (instagramEmbedElement) {
        if (post.instagramLink) {
            instagramEmbedElement.innerHTML = `
                <blockquote class="instagram-media" data-instgrm-permalink="${post.instagramLink}" data-instgrm-version="12">
                    <a href="${post.instagramLink}">View on Instagram</a>
                </blockquote>
            `;
            // Reinitialize the Instagram embed script
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
                console.log("Instagram embed processed by instgrm.Embeds.process() for postId:", postId);
            } else {
                console.log("Instagram script not yet loaded. Adding to document.");
                // Load Instagram script if not already loaded
                const script = document.createElement('script');
                script.async = true;
                script.defer = true;
                script.src = 'https://www.instagram.com/embed.js';
                document.body.appendChild(script);
                script.onload = () => {
                    console.log("Instagram embed script loaded, processing embeds now.");
                    window.instgrm.Embeds.process();
                };
            }
        } else {
            instagramEmbedElement.innerHTML = '<p>No Instagram post available.</p>';
        }
    } else {
        console.error(`instagramEmbed element not found for postId: ${postId}`);
    }
}


// Function to handle recipe link display
export function handleRecipeLink(post, postId) {
    const recipeLinkElement = document.getElementById(`viewRecipeLink-${postId}`);
    if (recipeLinkElement) {
        if (post.recipe) {
            recipeLinkElement.style.display = 'block';
            recipeLinkElement.setAttribute('data-post-id', post._id);
        } else {
            recipeLinkElement.style.display = 'none';
        }
    } else {
        console.error(`viewRecipeLink element not found for postId: ${postId}`);
    }
}

// Helper function to construct image path and retrieve it from S3
export function getImagePath(post) {
    let imagePath = '';

    if (post.imagePaths && post.imagePaths.length > 0) {
        imagePath = post.imagePaths[0]; // Use the first image if multiple are provided
    }

    if (imagePath) {
        const s3BucketUrl = getAWSS3BucketURL(); // Ensure this function is defined elsewhere in your codebase
        const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        return `${s3BucketUrl}/${cleanImagePath}`;
    }

    return ''; // Return an empty string if no imagePath is available
}
