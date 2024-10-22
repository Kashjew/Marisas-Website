// initAdminActions.js

// Import other admin functions
import './createPost.js';
import './editPost.js';
import './deletePost.js';
import './banUser.js';

// This function will initialize all event listeners and handlers for admin actions
document.addEventListener('DOMContentLoaded', function () {
    function initializeAdminActions() {
        // Edit post buttons
        document.querySelectorAll('.edit-post-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const postId = event.target.dataset.postId;
                if (postId) editPost(postId); // Calls the openPostModal function from editPost.js
            });
        });

        // Delete post buttons
        document.querySelectorAll('.delete-post-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const postId = event.target.dataset.postId;
                if (postId) deletePost(postId); // Calls the deletePost function from deletePost.js
            });
        });

        // Ban user buttons
        document.querySelectorAll('.ban-user-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.target.dataset.userId;
                if (userId) banUser(userId); // Calls the banUser function from banUser.js
            });
        });
    }

    // Initialize all actions
    initializeAdminActions();
});
