import { getAWSS3BucketURL } from './utilities.js'; // Import the S3 utility function
import { populateTags, embedInstagramPost, handleRecipeLink } from './utilityFunctions.js'; // Import tag, Instagram, and recipe link handlers
import { loadPostImages } from './imageHandlers.js'; // Import image handling functions

// Function to open the post modal and display the post content
export function openPostModal(postId) {
    console.log(`openPostModal called with postId: ${postId}`); // Debug log

    const postModal = document.getElementById(`modal-${postId}`); // Find modal for each post by ID
    if (!postModal) {
        console.error(`Post modal element not found for postId: ${postId}`);
        return;
    }

    // Display and update modal visibility
    postModal.style.display = 'block';
    postModal.setAttribute('aria-hidden', 'false');

    const postTitleElement = document.getElementById(`postTitle-${postId}`);
    if (postTitleElement) {
        postTitleElement.textContent = "Loading...";
    } else {
        console.error(`postTitle element not found for postId: ${postId}`);
    }

    // Fetch post details
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(post => {
            if (!post || !post.title) throw new Error('Post not found or invalid post data');

            // Populate modal with post data
            if (postTitleElement) postTitleElement.textContent = post.title || 'Post Title';

            const postContentElement = document.getElementById(`postContent-${postId}`);
            if (postContentElement) postContentElement.textContent = post.content || 'No content available';

            const prepTimeElement = document.getElementById(`prepTime-${postId}`);
            const cookTimeElement = document.getElementById(`cookTime-${postId}`);
            const servingsElement = document.getElementById(`servings-${postId}`);

            if (prepTimeElement) prepTimeElement.textContent = post.recipe?.prepTime || 'Not available';
            if (cookTimeElement) cookTimeElement.textContent = post.recipe?.cookTime || 'Not available';
            if (servingsElement) servingsElement.textContent = post.recipe?.servings || 'Not available';

            // Populate the modal with images, tags, Instagram post, and recipe link
            populateTags(post, postId);        // Populate tags using utility function
            embedInstagramPost(post, postId);  // Embed Instagram post if available
            loadPostImages(post, postId);      // Load post images from S3 or placeholders
            handleRecipeLink(post, postId);    // Handle recipe link display logic
        })
        .catch(error => {
            console.error('Error fetching post:', error);
            if (postTitleElement) {
                postTitleElement.textContent = "Error loading post.";
            }
            postModal.style.display = 'none';
            postModal.setAttribute('aria-hidden', 'true');
        });
}

// Function to open the large image modal
export function openLargeImageModal(imageUrl) {
    const largeImageModal = document.getElementById('largeImageModal');
    const largeImageElement = largeImageModal ? largeImageModal.querySelector('img') : null;

    if (largeImageModal && largeImageElement) {
        largeImageElement.src = imageUrl;
        largeImageModal.style.display = 'block';
        largeImageModal.style.zIndex = '20000';
        largeImageModal.style.position = 'fixed';
    } else {
        console.error("Large image modal or element not found");
    }
}

// Function to close the modals
export function closeModal(modalId) {
    const postModal = document.getElementById(`modal-${modalId}`);
    if (postModal) {
        postModal.style.display = 'none';
        postModal.setAttribute('aria-hidden', 'true');
    }
}

// Initialize close button events for all modals
export function initCloseButtons() {
    const closeButtons = document.querySelectorAll('.close-post');
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.getAttribute('data-modal-id');
            closeModal(modalId);
        });
    });
}

// Ensure the close button functionality is initialized when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    initCloseButtons(); // Initialize close button event listeners
});
