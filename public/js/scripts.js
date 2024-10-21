// Import all the modularized JavaScript functions
import { initUtilities } from './modules/utilities.js'; // Ensure utilities import first
// import { initMenu } from './modules/menu.js'; // Temporarily commented out

import { fetchPosts } from './modules/posts.js'; // Fetch and render posts
// import { initTagsDropdown } from './modules/tags.js'; // Initialize tags dropdown
import { initComments } from './modules/comments.js'; // Initialize comments functionality
import { initRequestPopup } from './modules/requests.js'; // Initialize request popup for users
import { initPostHandlers } from './modules/postHandlers.js'; // Handles modals and event listeners

console.log("postHandlers.js is imported");

// Debug: Directly test if the body is receiving click events
document.body.addEventListener('click', function (event) {
    console.log('Body clicked:', event.target);  // Log to detect clicks anywhere
});

// Capture the S3 bucket URL and region passed from res.locals
window.s3BucketUrl = window.s3BucketUrl || '<%= s3BucketUrl %>';
window.s3Region = window.s3Region || '<%= s3Region %>';

// Initialize utility functions first to set up S3
console.log("Initializing utilities (S3 bucket)...");  // Debugging log for clarity
initUtilities(); // Ensure that S3 utilities are initialized before any further action

// Adjust padding based on screen width (mobile vs desktop)
window.addEventListener('load', adjustBodyPadding);
window.addEventListener('resize', adjustBodyPadding);

function adjustBodyPadding() {
    if (window.innerWidth <= 768) {
        document.body.style.paddingTop = '100px';  // Adjust padding for mobile
    } else {
        document.body.style.paddingTop = '200px';  // Adjust padding for desktop
    }
}

// Function to reinitialize Instagram embeds
function loadInstagramEmbeds() {
    if (window.instgrm) {
        // Reparse the Instagram embed for any new content
        instgrm.Embeds.process();
        console.log("Instagram embeds reprocessed.");
    } else {
        // Fallback: load Instagram script if not already loaded
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src = 'https://www.instagram.com/embed.js';
        document.body.appendChild(script);
        console.log("Instagram embed script loaded.");
    }
}

// Add event listeners and initialize modules once DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const user = window.user || null;
    console.log('User logged in:', !!user);  // Debug log to check if user is logged in
    console.log('Is Admin:', user && user.isAdmin);  // Debug log to check if user is admin
    console.log('Initializing posts and modal handling...'); // Add this line for better debugging
    
    // Initialize functions
    // initMenu(); // Initialize the hamburger menu (if used)
    fetchPosts(); // Fetch and render posts
    // initTagsDropdown(); // Initialize tags dropdown for filtering posts
    initComments(); // Initialize comment form handling
    initRequestPopup(); // Initialize user request popup
    
    // Ensure post handlers are initialized
    console.log('Calling initPostHandlers...');
    initPostHandlers(); // This function handles post modals and clicks
    console.log('Post handlers initialized.');

    // Load Instagram embeds once the posts and modals are initialized
    loadInstagramEmbeds();

    // Admin-specific functions are handled in adminActions.js
    if (user && user.isAdmin) {
        handleAdminFunctions(); // This function is globally accessible from adminActions.js
    }
});
