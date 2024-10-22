let page = 1;
let isFetching = false;  // Prevent multiple fetches at once

const loadMorePosts = () => {
    if (isFetching) return;  // Avoid multiple concurrent fetches
    isFetching = true;
    fetch(`/api/posts?page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.posts.length > 0) {
                // Append new posts to the grid
                const grid = document.getElementById('postGrid');
                data.posts.forEach(post => {
                    const gridItem = document.createElement('div');
                    gridItem.classList.add('grid-item');
                    gridItem.setAttribute('data-post-id', post._id); // Store the post ID for ordering
                    gridItem.innerHTML = `
                        <img src="${post.imagePaths.length ? post.imagePaths[0] : '/images/placeholder.jpg'}" 
                             alt="${post.title}" 
                             onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
                        <div class="grid-hover">
                            <button class="edit-btn" data-post-id="${post._id}">Edit</button>
                            <button class="delete-btn" data-post-id="${post._id}">Delete</button>
                        </div>
                    `;
                    grid.appendChild(gridItem);
                });
                page++;  // Increment the page to load the next batch
                isFetching = false;
            } else {
                // No more posts available, hide the loader
                document.querySelector('.infinite-scroll-loader').style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Error loading more posts:', err);
            isFetching = false;
        });
};

// Infinite scroll event
window.addEventListener('scroll', () => {
    console.log('Scrolled:', window.innerHeight + window.scrollY >= document.body.offsetHeight - 500);
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isFetching) {
        loadMorePosts();
    }
});


// Edit and Delete Post Handlers
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-btn')) {
        const postId = event.target.getAttribute('data-post-id');
        fetch(`/api/posts/${postId}`)
            .then(response => response.json())
            .then(data => {
                openCreatePostModal(data.post);
            });
    }

    if (event.target.classList.contains('delete-btn')) {
        const postId = event.target.getAttribute('data-post-id');
        if (confirm('Are you sure you want to delete this post?')) {
            fetch(`/api/posts/${postId}`, { method: 'DELETE' })
                .then(() => {
                    event.target.closest('.grid-item').remove();
                });
        }
    }
});

function openCreatePostModal(postData) {
    // Populate and open the create-post modal with post data
}

// Initialize SortableJS for drag-and-drop
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('postGrid');
    const sortable = new Sortable(grid, {
        animation: 150,
        onEnd: function (evt) {
            const postOrder = [];
            document.querySelectorAll('.grid-item').forEach((item, index) => {
                postOrder.push({
                    id: item.getAttribute('data-post-id'),
                    order: index + 1  // New order position
                });
            });

            // Send the updated order to the server
            fetch('/api/posts/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postOrder }),  // Send the new order to the backend
            }).then(response => response.json())
              .then(data => {
                  console.log('Posts reordered successfully', data);
              })
              .catch(err => {
                  console.error('Error reordering posts:', err);
              });
        }
    });
});
