// admingrid.js

let isFetching = false;  // Prevent multiple fetches at once

// Function to load all posts
const loadAllPosts = () => {
    const loader = document.querySelector('.infinite-scroll-loader');
    loader.style.display = 'block';  // Show the loader while fetching
    fetch(`/api/posts`)
        .then(response => response.json())
        .then(data => {
            if (data && data.posts && data.posts.length > 0) {
                const grid = document.getElementById('postGrid');
                data.posts.forEach((post, index) => {
                    const gridItem = document.createElement('div');
                    gridItem.classList.add('grid-item');
                    gridItem.setAttribute('data-post-id', post._id);

                    // Add position label for "Latest Post" and numbered positions
                    const positionLabel = index === 0 ? "Latest Post" : `${index + 1} Post`;

                    // Order display with position label and styling
                    gridItem.innerHTML = `
                        <div class="post-order"><strong>${positionLabel}</strong></div>
                        <img src="${post.imagePaths.length ? post.imagePaths[0] : '/images/placeholder.jpg'}" 
                             alt="${post.title}" 
                             onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
                        <div class="grid-hover">
                            <button class="edit-btn" data-post-id="${post._id}">Edit</button>
                            <button class="delete-btn" data-post-id="${post._id}">Delete</button>
                        </div>
                    `;

                    // Highlight the "Latest Post" (first in order)
                    if (index === 0) {
                        gridItem.classList.add('latest-post');  // CSS class for styling
                    }

                    grid.appendChild(gridItem);
                });
                loader.style.display = 'none';  // Hide the loader after loading all posts
            } else {
                loader.style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Error loading posts:', err);
            loader.style.display = 'none';
        });
};

// Initialize SortableJS for drag-and-drop reordering
document.addEventListener('DOMContentLoaded', () => {
    loadAllPosts();

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

                // Update order label display
                const label = index === 0 ? "Latest Post" : `${index + 1} Post`;
                item.querySelector('.post-order').textContent = label;

                // Highlight the first item as the latest post
                item.classList.toggle('latest-post', index === 0);
            });
            
            // Send the updated order to the server
            fetch('/api/posts/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postOrder }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Posts reordered successfully', data);
            })
            .catch(err => {
                console.error('Error reordering posts:', err);
                alert('Error reordering posts. Please try again.');
            });          
        }
    });
});
