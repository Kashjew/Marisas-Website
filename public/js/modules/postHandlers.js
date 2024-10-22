// Import modal handlers from modalHandlers.js and recipe-card.js
import { openPostModal, openLargeImageModal, closeModal } from './modalHandlers.js';
import { viewRecipeCard, closeRecipeCard } from './recipe-card.js';
import { loadPostImages } from './imageHandlers.js';
import { populateTags, embedInstagramPost, handleRecipeLink } from './utilityFunctions.js';

export function initPostHandlers() {
    console.log("Initializing post modals and event listeners...");

    // Check if the document body exists and attach event listeners
    if (document.body) {
        document.body.addEventListener('click', function (event) {
            console.log('Clicked element:', event.target);

            // Handle post modal click event
            if (event.target.closest('[data-post-id]')) {
                const postId = event.target.closest('[data-post-id]').getAttribute('data-post-id');
                if (postId) openPostModal(postId);  // Open the post modal
            }

            // Handle recipe card modal click event
            else if (event.target.closest('[data-recipe-id]')) {
                const recipeId = event.target.closest('[data-recipe-id]').getAttribute('data-recipe-id');
                if (recipeId) viewRecipeCard(recipeId);  // Open the recipe card modal
            }

            // Handle large image modal click event
            else if (event.target.classList.contains('post-image')) {
                const fullImageUrl = event.target.src;
                openLargeImageModal(fullImageUrl);  // Open large image modal
            }
        });
    } else {
        console.error("Document body not found for event listener attachment.");
    }

    // Add close modal functionality for post and recipe card modals
    const closeButtons = document.querySelectorAll('.close-post, .close-recipe'); // Match the correct close button classes
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.getAttribute('data-modal-id');
            if (button.classList.contains('close-recipe')) {
                closeRecipeCard(modalId);  // Close the recipe card modal
            } else {
                closeModal(modalId);  // Close the post modal
            }
        });
    });
}

export { openPostModal };
