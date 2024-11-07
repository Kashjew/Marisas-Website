// Import all the modularized JavaScript functions
import { initUtilities, getAWSS3BucketURL } from './modules/utilities.js';
import { initComments } from './modules/comments.js'; // Initialize comments functionality
import { initRequestPopup } from './modules/requests.js'; // Initialize request popup for users
import { initPostHandlers } from './modules/postHandlers.js'; // Handles modals and event listeners
import { embedInstagramPost, handleRecipeLink } from './modules/utilityFunctions.js';
import './modules/headerScroll.js';
import { renderLatestPost } from './modules/latestpost.js';

console.log("postHandlers.js is imported");

// Debug: Directly test if the body is receiving click events
document.body.addEventListener('click', function (event) {
    console.log('Body clicked:', event.target);  // Log to detect clicks anywhere
});

// Capture the S3 bucket URL and region passed from res.locals
window.s3BucketUrl = window.s3BucketUrl || '<%= s3BucketUrl %>';
window.s3Region = window.s3Region || '<%= s3Region %>';

// Initialize utility functions first to set up S3
console.log("Initializing utilities (S3 bucket)...");
initUtilities(); // Ensure that S3 utilities are initialized before any further action
console.log("S3 Bucket URL:", getAWSS3BucketURL());

// Adjust padding based on screen width (mobile vs desktop)
window.addEventListener('load', adjustBodyPadding);
window.addEventListener('resize', adjustBodyPadding);

function adjustBodyPadding() {
    // Only apply padding if the page is a user page
    if (document.body.classList.contains('user-page')) {
        if (window.innerWidth <= 768) {
            document.body.style.paddingTop = '100px';  // Adjust padding for mobile
        } else {
            document.body.style.paddingTop = '190px';  // Adjust padding for desktop
        }
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
document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOM fully loaded and parsed");

    const user = window.user || null;
    console.log('User logged in:', !!user);
    console.log('Is Admin:', user && user.isAdmin);

    // Initialize modules
    initUtilities();
    initComments();
    initRequestPopup();
    initPostHandlers();
    
    // Ensure Instagram embeds are reloaded
    loadInstagramEmbeds();
    console.log('loadInstagramEmbeds function executed.');

    // Fetch posts and render the latest post
    try {
        const response = await fetch('/api/posts'); // Assuming /api/posts returns the latest posts
        const data = await response.json();
        if (data && data.posts) {
            renderLatestPost(data.posts);
        }
    } catch (error) {
        console.error("Failed to fetch and render latest post:", error);
    }
});
