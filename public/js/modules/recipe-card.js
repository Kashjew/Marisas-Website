// Function to display the recipe card for a specific post
function viewRecipeCard(recipeId) {
    console.log(`viewRecipeCard called with recipeId: ${recipeId}`);

    const recipeCardModal = document.getElementById('recipeCardModal');
    const recipeCardOverlay = document.getElementById('recipeCardOverlay');
    if (!recipeCardModal || !recipeCardOverlay) {
        console.error('Recipe card modal or overlay element not found');
        return;
    }

    // Show the modal and overlay
    recipeCardModal.style.display = 'block';
    recipeCardModal.setAttribute('aria-hidden', 'false');
    recipeCardOverlay.style.display = 'block'; // Show the overlay
    document.getElementById('recipeTitle').textContent = "Loading...";

    // Fetch recipe details from post data
    fetch(`/api/posts/${recipeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(recipe => {
            if (!recipe || !recipe.title) {
                throw new Error('Recipe not found or invalid recipe data');
            }

            // Populate the modal with recipe data
            document.getElementById('recipeTitle').textContent = recipe.title || 'Recipe Title';
            document.getElementById('prepTime').textContent = recipe.recipe.prepTime || 'N/A';
            document.getElementById('cookTime').textContent = recipe.recipe.cookTime || 'N/A';
            document.getElementById('servings').textContent = recipe.recipe.servings || 'N/A';

            // Populate ingredients
            const ingredientsList = document.getElementById('ingredientsList');
            ingredientsList.innerHTML = '';
            if (recipe.recipe.ingredients && recipe.recipe.ingredients.length > 0) {
                recipe.recipe.ingredients.forEach(ingredient => {
                    const li = document.createElement('li');
                    li.textContent = ingredient;
                    ingredientsList.appendChild(li);
                });
            } else {
                ingredientsList.innerHTML = '<li>No ingredients listed.</li>';
            }

            // Populate steps
            const stepsList = document.getElementById('stepsList');
            stepsList.innerHTML = '';
            if (recipe.recipe.steps && recipe.recipe.steps.length > 0) {
                recipe.recipe.steps.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step;
                    stepsList.appendChild(li);
                });
            } else {
                stepsList.innerHTML = '<li>No steps listed.</li>';
            }

            // Populate notes
            const recipeNotes = document.getElementById('recipeNotes');
            recipeNotes.textContent = recipe.recipe.notes || 'No additional notes.';
        })
        .catch(error => {
            console.error('Error fetching recipe:', error);
            document.getElementById('recipeTitle').textContent = "Error loading recipe.";
            recipeCardModal.style.display = 'none';
            recipeCardOverlay.style.display = 'none'; // Hide the overlay in case of error
        });
}

// Close the recipe card modal and hide the overlay
function closeRecipeCard() {
    const recipeCardModal = document.getElementById('recipeCardModal');
    const recipeCardOverlay = document.getElementById('recipeCardOverlay');
    recipeCardModal.style.display = 'none';
    recipeCardOverlay.style.display = 'none'; // Hide the overlay when modal is closed
}

// Close the modal on clicking outside or on the close button
document.addEventListener("DOMContentLoaded", function () {
    const closeModal = document.querySelector('#closeRecipeCardButton');
    if (closeModal) {
        closeModal.onclick = function () {
            closeRecipeCard();
        };
    }

    // Also close the modal when clicking outside the modal content
    window.onclick = function (event) {
        const modal = document.getElementById('recipeCardModal');
        const overlay = document.getElementById('recipeCardOverlay');
        if (event.target === modal || event.target === overlay) {
            closeRecipeCard();
        }
    };
});

// Attach viewRecipeCard to the global scope
window.viewRecipeCard = viewRecipeCard;

// Export the viewRecipeCard function for use in other modules
export { viewRecipeCard };
