// Import all the modularized JavaScript functions
import { initUtilities, getAWSS3BucketURL } from './modules/utilities.js';
import { initComments } from './modules/comments.js'; // Initialize comments functionality
import { initRequestPopup } from './modules/requests.js'; // Initialize request popup for users
import { initPostHandlers } from './modules/postHandlers.js'; // Handles modals and event listeners
import { embedInstagramPost, handleRecipeLink } from './modules/utilityFunctions.js';
import './modules/headerScroll.js';
import { renderLatestPost } from './modules/latestpost.js';
import { initGoogleAnalytics } from './modules/googleAnalytics.js';
import { loadRecipeCard } from './modules/recipe-card.js'; // Import viewRecipeCard and loadRecipeCard
import { adjustBodyPadding } from './modules/adjustPadding.js'; // Import the new adjustPadding module
import { initHamburgerMenu } from './modules/menu.js'
import { initCookieBanner } from './modules/cookie-banner.js';



console.log("scripts.js is loaded");

// Capture the S3 bucket URL and region passed from res.locals
window.s3BucketUrl = window.s3BucketUrl || '<%= s3BucketUrl %>';
window.s3Region = window.s3Region || '<%= s3Region %>';

// Initialize utility functions first to set up S3
console.log("Initializing utilities (S3 bucket)...");
initUtilities(); // Ensure that S3 utilities are initialized before any further action
console.log("S3 Bucket URL:", getAWSS3BucketURL());

// Call the function to adjust padding (from the new module)
adjustBodyPadding();

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
    console.log("Initializing modules...");
    initGoogleAnalytics();
    initUtilities();
    initComments();
    initRequestPopup();
    initPostHandlers();
    initHamburgerMenu(); 
    loadInstagramEmbeds();
    initCookieBanner();

    // Fetch posts and render the latest post
    try {
        console.log("Fetching posts...");
        const response = await fetch('/api/posts'); // Assuming /api/posts returns the latest posts
        const data = await response.json();
        if (data && data.posts) {
            console.log("Rendering latest posts...");
            renderLatestPost(data.posts);
        }
    } catch (error) {
        console.error("Failed to fetch and render latest post:", error);
    }
});
