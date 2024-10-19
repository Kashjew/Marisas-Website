// Function to render comments for each post
export function renderComments(postElement, comments) {
    const commentsContainer = document.createElement('div');
    commentsContainer.classList.add('comments-container');

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
            <p><strong>${comment.author}</strong>: ${comment.content}</p>
        `;
        commentsContainer.appendChild(commentElement);
    });

    // Add a form to allow new comments
    const commentForm = document.createElement('form');
    commentForm.classList.add('comment-form');
    commentForm.innerHTML = `
        <input type="text" class="comment-input" placeholder="Add a comment..." required>
        <button type="submit">Submit</button>
    `;

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentInput = commentForm.querySelector('.comment-input');
        addComment(postElement.dataset.id, commentInput.value);
        commentInput.value = '';
    });

    commentsContainer.appendChild(commentForm);
    postElement.appendChild(commentsContainer);
}

// Function to add a comment to a post
export function addComment(postId, commentContent) {
    fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include', // Include credentials
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' // Specify JSON response
        },
        body: JSON.stringify({ content: commentContent })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add comment');
        }
        return response.json();
    })
    .then(comment => {
        console.log('Comment added:', comment);
        // Optionally refresh the comments section or call fetchPosts
    })
    .catch(error => {
        console.error('Error adding comment:', error);
    });
}

// Initialize comments-related functionality
export function initComments() {
    const postElements = document.querySelectorAll('.post');
    postElements.forEach(postElement => {
        const comments = []; // Load initial comments if available
        renderComments(postElement, comments);
    });
}
