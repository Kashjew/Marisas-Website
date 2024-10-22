import { getAWSS3BucketURL } from './utilities.js'; // Import the S3 utility function
import { populateTags, embedInstagramPost, handleRecipeLink } from './utilityFunctions.js'; // Import tag, Instagram, and recipe link handlers
import { loadPostImages } from './imageHandlers.js'; // Import image handling functions
import { openPostModal } from './posts.js'; // Import openPostModal from posts.js

// Function to open the recipe card modal
export function viewRecipeCard(postId) {
    const recipeModal = document.getElementById(`recipeCardModal-${postId}`);
    const recipeModalOverlay = document.getElementById(`postModalOverlay-${postId}`);

    if (!recipeModal || !recipeModalOverlay) {
        console.error('Recipe modal or overlay not found');
        return;
    }

    recipeModal.style.display = 'block';
    recipeModal.setAttribute('aria-hidden', 'false');
    recipeModalOverlay.style.display = 'block';
    recipeModalOverlay.classList.add('show');
}

// Function to open the large image modal
export function openLargeImageModal(imageUrl) {
    const largeImageModal = document.getElementById('largeImageModal');
    const largeImageElement = largeImageModal ? largeImageModal.querySelector('img') : null;
    const overlay = document.getElementById('modalOverlay');

    if (largeImageModal && largeImageElement) {
        largeImageElement.src = imageUrl;
        largeImageModal.style.display = 'block';
        largeImageModal.style.zIndex = '20000';
        largeImageModal.style.position = 'fixed';
        overlay.classList.add('show'); // Show overlay when large image modal opens
    } else {
        console.error("Large image modal or element not found");
    }

    // Close large image modal when clicking outside the content
    largeImageModal.addEventListener('click', function(event) {
        if (!event.target.closest('.modal-content')) {
            closeLargeImageModal();
        }
    });
}

// Function to close the large image modal
export function closeLargeImageModal() {
    const largeImageModal = document.getElementById('largeImageModal');
    const overlay = document.getElementById('modalOverlay');
    if (largeImageModal) {
        largeImageModal.style.display = 'none';
        largeImageModal.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('show'); // Hide the overlay when modal closes
    }
}

// Function to close the post modal
export function closeModal(modalId) {
    const postModal = document.getElementById(`modal-${modalId}`);
    const overlay = document.getElementById(`postModalOverlay-${modalId}`);
    if (postModal) {
        postModal.style.display = 'none';
        postModal.setAttribute('aria-hidden', 'true');
    }
    if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('show'); // Hide the overlay when modal closes
    }
}

// Function to close all modals
export function closeAllModals() {
    const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
    openModals.forEach(modal => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    });

    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.style.display = 'none';
        overlay.classList.remove('show'); // Hide all overlays
    });
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

    // Close large image modal button
    const closeLargeImageButton = document.getElementById('closeLargeImageButton');
    if (closeLargeImageButton) {
        closeLargeImageButton.addEventListener('click', closeLargeImageModal);
    }
}

// Ensure the close button functionality is initialized when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    initCloseButtons(); // Initialize close button event listeners
});

export { openPostModal };
