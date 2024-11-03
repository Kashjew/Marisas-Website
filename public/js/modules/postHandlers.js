import { viewRecipeCard, closeRecipeCard } from './recipe-card.js';
import { loadPostImages } from './imageHandlers.js';
import { populateTags, embedInstagramPost, handleRecipeLink, getImagePath } from './utilityFunctions.js';

// Function to fetch all posts from the backend
async function fetchPosts() {
    try {
        const response = await fetch('/api/posts', {
            method: 'GET',
            credentials: 'include', // Include credentials to authenticate
            headers: { 'Accept': 'application/json' } // Specify that we want a JSON response
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const posts = await response.json();
        console.log('Fetched posts:', posts); // Debug log for fetched posts
        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return []; // Return an empty array if fetching posts fails
    }
}

export function initPostHandlers() {
    // Initialize modal and event listeners for posts
    document.querySelectorAll('.post').forEach(postElement => {
        const postId = postElement.getAttribute('data-post-id');
        
        // Handle Instagram Embed for Latest Post
        const instagramLink = postElement.getAttribute('data-instagram-link');
        if (instagramLink) {
            embedInstagramPost({ instagramLink }, postId);
        }

        // Handle Recipe Link Display
        const recipeAvailable = postElement.getAttribute('data-recipe');
        if (recipeAvailable) {
            handleRecipeLink({ recipe: recipeAvailable }, postId);
        }
    });

    console.log("Post handlers initialized for all posts.");
}


// Helper function to open the post modal and load content
function openPostModal(postId) {
    const postModal = document.getElementById(`postModal-${postId}`);

    if (!postModal) {
        console.error("Post modal not found.");
        return;
    }

    // Check if the modal is already open and has content loaded
    if (postModal.getAttribute('aria-hidden') === 'false') {
        console.log("Post modal is already open. Skipping fetch.");
        return;
    }

    // Check if content is already loaded in the modal to prevent reloading
    if (postModal.dataset.loaded === "true") {
        postModal.style.display = 'block';
        postModal.setAttribute('aria-hidden', 'false');
        console.log("Post modal is displayed with preloaded content.");
        return;
    }

    // Display modal and set it as not hidden
    postModal.style.display = 'block';
    postModal.setAttribute('aria-hidden', 'false');

    // Fetch post data only if not already loaded
    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data._id) {
                populatePostModal(data);  // Populate modal with post data
                postModal.dataset.loaded = "true"; // Mark as loaded to prevent re-fetching
            } else {
                console.error('Error: Post data not found.');
            }
        })
        .catch(error => console.error('Error fetching post data:', error));
}

// Helper function to populate post modal with data
function populatePostModal(post) {
    const postModal = document.getElementById(`postModal-${post._id}`);
    if (!postModal) {
        console.error("Post modal element not found.");
        return;
    }

    // Load images, tags, Instagram embed, and recipe link for the post
    loadPostImages(post, post._id); // Load images into the modal
    populateTags(post, post._id); // Populate tags
    embedInstagramPost(post, post._id); // Embed Instagram post if available
    handleRecipeLink(post, post._id); // Handle recipe link display
}

// Optional: Call fetchPosts within initPostHandlers to load posts on page load
export function initializeAndFetchPosts() {
    initPostHandlers();
    fetchPosts().then(posts => {
        // Additional logic for rendering posts if needed
        console.log("Posts initialized and fetched", posts);
    });
}
// Attach openPostModal to the global window object
window.openPostModal = openPostModal;
