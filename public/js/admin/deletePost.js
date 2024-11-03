// deletePost.js

document.addEventListener('DOMContentLoaded', function () {
    // Global delete function
    window.deletePost = function(postId) {
        // Show prompt for deletion confirmation
        const confirmation = prompt("Are you sure you want to delete this post? Type 'delete' to confirm.");
        if (confirmation !== 'delete') {
            alert("Post deletion canceled.");
            return;
        }

        // Proceed with deletion if confirmed
        fetch(`/api/posts/${postId}`, { // Matches the route in adminApiRoutes.js
            method: 'DELETE',
            credentials: 'include',
        })
        .then(response => {
            // Check if the response is OK (status code in the 200-299 range)
            if (!response.ok) {
                // If response is not OK, convert it to JSON and throw an error with the message
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to delete post.');
                });
            }
            return response.json(); // Proceed to parse JSON if response is OK
        })
        .then(data => {
            // Successfully deleted, now remove the post from the DOM
            document.querySelector(`[data-post-id="${postId}"]`).remove(); // Remove post from DOM
            alert(data.message || 'Post deleted successfully.');
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            alert(error.message || 'Error deleting the post.');
        });
    };

    // Event listener for delete buttons in the grid
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            const postId = event.target.getAttribute('data-post-id');
            deletePost(postId); // Call deletePost function
        }
    });
});
