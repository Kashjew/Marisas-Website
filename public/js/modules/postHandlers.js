import { openPostModal, openLargeImageModal, closeModal } from './modalHandlers.js';
import { loadPostImages } from './imageHandlers.js';
import { populateTags, embedInstagramPost, handleRecipeLink } from './utilityFunctions.js';

export function initPostHandlers() {
    console.log("Initializing post modals and event listeners...");

    if (document.body) {
        document.body.addEventListener('click', function (event) {
            console.log('Clicked element:', event.target);

            if (event.target.closest('[data-post-id]')) {
                const postId = event.target.closest('[data-post-id]').getAttribute('data-post-id');
                if (postId) openPostModal(postId);  // Use the new openPostModal
            } else if (event.target.closest('[data-recipe-id]')) {
                const postId = event.target.closest('[data-recipe-id]').getAttribute('data-post-id');
                if (postId) viewRecipeCard(postId);  // Existing functionality
            } else if (event.target.classList.contains('post-image')) {
                const fullImageUrl = event.target.src;
                openLargeImageModal(fullImageUrl);  // Use the new openLargeImageModal
            }
        });
    } else {
        console.error("Document body not found for event listener attachment.");
    }

    // Add close modal functionality
    const closeButtons = document.querySelectorAll('.closePostButton');
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.getAttribute('data-modal-id');
            closeModal(modalId);  // Use the new closeModal function
        });
    });
}
