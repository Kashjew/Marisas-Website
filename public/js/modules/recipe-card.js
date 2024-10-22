// Function to display the recipe card for a specific post
export function viewRecipeCard(recipeId) {
    const recipeCardModal = document.getElementById(`recipeCardModal-${recipeId}`);
    const recipeCardOverlay = document.getElementById('recipeCardOverlay');

    if (!recipeCardModal || !recipeCardOverlay) {
        console.error('Recipe card modal or overlay element not found');
        return;
    }

    // Adjust the modal height based on content
    adjustModalHeight(recipeId);

    // Show the modal and overlay
    recipeCardModal.style.display = 'block';
    recipeCardModal.setAttribute('aria-hidden', 'false');
    recipeCardOverlay.style.display = 'block';
    recipeCardOverlay.classList.add('show');
}

// Function to close the recipe card
export function closeRecipeCard(recipeId) {
    const recipeCardModal = document.getElementById(`recipeCardModal-${recipeId}`);
    const recipeCardOverlay = document.getElementById('recipeCardOverlay');

    if (recipeCardModal) recipeCardModal.style.display = 'none';
    if (recipeCardOverlay) recipeCardOverlay.style.display = 'none';
    if (recipeCardOverlay) recipeCardOverlay.classList.remove('show');
}

// Adjust the height of the recipe card based on content
function adjustModalHeight(recipeId) {
    const recipeCardModal = document.getElementById(`recipeCardModal-${recipeId}`);
    const recipeDetails = recipeCardModal.querySelector('.recipe-details');

    // Dynamically adjust based on the content height
    if (recipeDetails) {
        const contentHeight = recipeDetails.offsetHeight;

        // Apply dynamic height adjustments for better visuals
        recipeCardModal.style.height = `${contentHeight + 100}px`; // Add some buffer
        recipeCardModal.style.maxHeight = '85vh'; // Keep it within the viewport
        recipeCardModal.style.overflowY = 'auto'; // Ensure scrolling for overflow
    }
}

// Function to dynamically adjust content and tags containers for the recipe card
function adjustDynamicContainers(postId) {
    const contentContainer = document.getElementById(`postContent-${postId}`);
    const tagsContainer = document.getElementById(`postTags-${postId}`);

    if (contentContainer) {
        contentContainer.style.border = '1px solid #ddd';
        contentContainer.style.padding = '10px';
        contentContainer.style.margin = '10px 0';
        contentContainer.style.overflowWrap = 'break-word'; // Ensure long text doesn't overflow
    }

    if (tagsContainer) {
        tagsContainer.style.border = '1px solid #ddd';
        tagsContainer.style.padding = '10px';
        tagsContainer.style.margin = '10px 0';
        tagsContainer.style.display = 'flex';  // Make the tags adjust flexibly
        tagsContainer.style.flexWrap = 'wrap'; // Ensure tags don't overflow
        tagsContainer.style.gap = '10px';  // Add space between tags
    }
}

// Function to ensure "View Recipe" button is placed at the bottom of the recipe card modal
function adjustButtonPosition(postId) {
    const viewRecipeContainer = document.getElementById(`viewRecipeContainer-${postId}`);
    if (viewRecipeContainer) {
        viewRecipeContainer.style.position = 'absolute';
        viewRecipeContainer.style.bottom = '0';
        viewRecipeContainer.style.left = '0';
        viewRecipeContainer.style.right = '0';
    }
}

// Attach event listeners to the "View Recipe" buttons once DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners to all buttons with class 'view-recipe-link'
    document.querySelectorAll('.view-recipe-link').forEach(button => {
        button.addEventListener('click', event => {
            const recipeId = event.target.getAttribute('data-recipe-id');
            if (recipeId) {
                viewRecipeCard(recipeId); // Open the recipe card modal
            }
        });
    });

    // Adjust dynamic containers and button position for each post
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        const postId = post.getAttribute('data-post-id');
        adjustDynamicContainers(postId);
        adjustButtonPosition(postId);
    });

    // Add event listeners to close buttons
    document.querySelectorAll('.close-recipe').forEach(button => {
        button.addEventListener('click', event => {
            const recipeId = event.target.getAttribute('data-modal-id');
            if (recipeId) {
                closeRecipeCard(recipeId); // Close the recipe card modal
            }
        });
    });
});
