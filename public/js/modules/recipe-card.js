export async function loadRecipeCard(recipeId) {
    try {
        const response = await fetch(`/api/posts/${recipeId}`);
        const post = await response.json();

        if (!post) {
            console.error('Post not found.');
            return;
        }

        // Populate the modal fields directly with HTML content
        document.getElementById(`recipeTitle-${recipeId}`).textContent = post.title || 'Recipe';
        document.getElementById(`prepTime-${recipeId}`).textContent = post.recipe?.prepTime || 'N/A';
        document.getElementById(`cookTime-${recipeId}`).textContent = post.recipe?.cookTime || 'N/A';
        document.getElementById(`servings-${recipeId}`).textContent = post.recipe?.servings || 'N/A';

        const ingredientsContainer = document.getElementById(`ingredients-${recipeId}`);
        const stepsContainer = document.getElementById(`steps-${recipeId}`);
        const notesContainer = document.getElementById(`notes-${recipeId}`);

        // Use the raw HTML saved by TinyMCE for ingredients and steps
        if (ingredientsContainer) {
            ingredientsContainer.innerHTML = post.recipe?.ingredients || '<em>No ingredients available</em>';
        }

        if (stepsContainer) {
            stepsContainer.innerHTML = post.recipe?.steps || '<em>No steps available</em>';
        }

        if (notesContainer) {
            notesContainer.innerHTML = post.recipe?.notes || 'No additional notes provided';
        }

        viewRecipeCard(recipeId);
    } catch (error) {
        console.error('Failed to load recipe card:', error);
    }
}

export function viewRecipeCard(recipeId) {
    const modal = document.getElementById(`recipeCardModal-${recipeId}`);
    const overlay = document.getElementById(`recipeCardOverlay-${recipeId}`);

    if (modal && overlay) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        overlay.style.display = 'block';
        overlay.classList.add('show');
    } else {
        console.error('Recipe modal or overlay not found');
    }
}

export function closeRecipeCard(recipeId) {
    const modal = document.getElementById(`recipeCardModal-${recipeId}`);
    const overlay = document.getElementById(`recipeCardOverlay-${recipeId}`);

    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('show');
    }
}

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.view-recipe-link').forEach(button => {
        button.addEventListener('click', () => {
            const recipeId = button.getAttribute('data-recipe-id');
            if (recipeId) {
                loadRecipeCard(recipeId);
            }
        });
    });

    document.querySelectorAll('.close-recipe').forEach(button => {
        button.addEventListener('click', () => {
            const recipeId = button.getAttribute('data-modal-id');
            if (recipeId) {
                closeRecipeCard(recipeId);
            }
        });
    });

    document.querySelectorAll('.recipe-card-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            const recipeId = overlay.id.split('-')[1];
            if (recipeId) {
                closeRecipeCard(recipeId);
            }
        });
    });
});
