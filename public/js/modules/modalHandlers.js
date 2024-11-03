import { getAWSS3BucketURL } from './utilities.js'; // Import the S3 utility function
import { populateTags, embedInstagramPost, handleRecipeLink } from './utilityFunctions.js'; // Import tag, Instagram, and recipe link handlers
import { loadPostImages } from './imageHandlers.js'; // Import image handling functions

// Function to open the recipe card modal
export function viewRecipeCard(postId) {
    const recipeModal = document.getElementById(`recipeCardModal-${postId}`);
    const recipeCardOverlay = document.getElementById('recipeCardOverlay');

    if (!recipeModal || !recipeCardOverlay) {
        console.error('Recipe modal or overlay not found');
        return;
    }

    recipeModal.style.display = 'block';
    recipeModal.setAttribute('aria-hidden', 'false');
    recipeCardOverlay.style.display = 'block';
    recipeCardOverlay.classList.add('show');
}

// Function to close the recipe card modal
export function closeRecipeCard(postId) {
    const recipeModal = document.getElementById(`recipeCardModal-${postId}`);
    const recipeCardOverlay = document.getElementById('recipeCardOverlay');

    if (recipeModal) {
        recipeModal.style.display = 'none';
        recipeModal.setAttribute('aria-hidden', 'true');
    }
    if (recipeCardOverlay) {
        recipeCardOverlay.style.display = 'none';
        recipeCardOverlay.classList.remove('show');
    }
}
