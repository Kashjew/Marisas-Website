// deletePost.js

document.addEventListener('DOMContentLoaded', function () {
    window.deletePost = function(postId) {
        // Prompt for confirmation
        const confirmation = prompt("Are you sure you want to delete this post? Type 'delete' to confirm.");
        if (confirmation !== 'delete') {
            alert("Post deletion canceled.");
            return;
        }

        // Proceed with deletion if confirmed
        fetch(`/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        .then(response => response.ok ? alert('Post deleted and archived successfully.') : alert('Failed to delete post.'))
        .then(() => location.reload())
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('Error deleting the post.');
        });
    }
});
