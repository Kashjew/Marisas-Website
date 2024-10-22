// deletePost.js

document.addEventListener('DOMContentLoaded', function () {
    window.deletePost = function(postId) {
        if (!confirm("Are you sure you want to delete this post?")) return;

        fetch(`/admin/delete-post/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        .then(response => response.ok ? alert('Post deleted successfully.') : alert('Failed to delete post.'))
        .then(() => location.reload())
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('Error deleting the post.');
        });
    }
});
