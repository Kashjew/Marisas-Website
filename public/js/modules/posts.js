import { getAWSS3BucketURL } from './utilities.js';

// Fetch all posts from the backend
export async function fetchPosts() {
    try {
        const response = await fetch('/api/posts', {
            method: 'GET',
            credentials: 'include', // Include credentials to authenticate
            headers: {
                'Accept': 'application/json' // Specify that we want a JSON response
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const posts = await response.json();
        console.log('Fetched posts:', posts); // Debug log for fetched posts
        return posts; // Return posts so that they can be used by scripts.js
    } catch (error) {
        console.error('Error fetching posts:', error);
        return []; // Return an empty array if fetching posts fails
    }
}

// Fetch posts and render them (used by admin actions)
export async function fetchPostsAndRender() {
    const posts = await fetchPosts();
    if (posts.length > 0) {
        renderLatestPost(posts);
        renderOlderPosts(posts);
    }
}

// Helper function to escape HTML to prevent special character issues
function escapeHTML(str) {
    if (typeof str !== 'string') {
        return ''; // Return empty string if input is not a string
    }
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// Render the latest post in the right column
export function renderLatestPost(posts) {
    const rightColumn = document.querySelector(".right-column");
    if (rightColumn && posts.length > 0) {
        const latestPost = posts[0];
        const imagePath = getImagePath(latestPost);

        console.log('Latest post image URL:', imagePath); // Debug log for latest post image URL

        rightColumn.innerHTML = `
            <h2>Latest Post</h2>
            <div class="post post-item" data-post-id="${latestPost._id}">
                <h3>${escapeHTML(latestPost.title || 'No Title')}</h3>
                ${imagePath ? `<img src="${escapeHTML(imagePath)}" alt="${escapeHTML(latestPost.title || 'Post Image')}" class="post-image">` : ''}
                <p>${escapeHTML(latestPost.content || 'No content available')}</p>
                <p class="view-post" data-post-id="${latestPost._id}">Click to view post</p>
                ${latestPost.instagramLink ? `<a href="${escapeHTML(latestPost.instagramLink)}" target="_blank">View on Instagram</a>` : ''}
                ${latestPost.author ? `<p>Author: ${escapeHTML(latestPost.author.email || 'Unknown')}</p>` : '<p>Author information not available</p>'}
            </div>
        `;

        // Add event listeners for post modal
        addPostModalHandlers(rightColumn.querySelector('.post-item')); // Use the post-item element instead of the button
    }
}

// Render older posts in the previous-posts section
export function renderOlderPosts(posts) {
    const previousPostsSection = document.querySelector(".previous-posts");
    if (previousPostsSection) {
        previousPostsSection.innerHTML = '';

        posts.slice(1).forEach(post => {
            const imagePath = getImagePath(post);
            console.log('Older post image URL:', imagePath); // Debug log for older post image URL

            const postElement = document.createElement("div");
            postElement.classList.add("post-image-container", "post-item");
            postElement.setAttribute('data-post-id', post._id);
            postElement.innerHTML = `
                ${imagePath ? `<img src="${escapeHTML(imagePath)}" alt="${escapeHTML(post.title || 'Post Image')}" class="post-image">` : ''}
                <h3>${escapeHTML(post.title || 'No Title')}</h3>
                <p class="view-post" data-post-id="${post._id}">Click to view post</p>
                ${post.tags && post.tags.length > 0 ? `<p>Tags: ${post.tags.map(tag => escapeHTML(tag)).join(', ')}</p>` : ''}
            `;
            previousPostsSection.appendChild(postElement);

            // Add event listeners for post modal
            addPostModalHandlers(postElement);
        });
    }
}

// Helper function to construct image path
function getImagePath(post) {
    let imagePath = '';

    // Ensure images are pulled from S3
    if (post.imagePaths && post.imagePaths.length > 0) {
        imagePath = post.imagePaths[0]; // Use the first image if multiple are provided
    }

    if (imagePath) {
        // Ensure the URL is properly constructed for S3
        const s3BucketUrl = getAWSS3BucketURL(); // Function to get the base S3 bucket URL
        const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath; // Remove leading slash if exists
        return `${s3BucketUrl}/${cleanImagePath}`; // Construct the full URL without double extensions
    }

    return ''; // Return an empty string if no imagePath is available
}

// Function to open the post modal and display the post content
function openPostModal(postId) {
    console.log(`openPostModal called with postId: ${postId}`); // Debug log

    const postModal = document.getElementById(`modal-${postId}`); // Dynamically find the modal for each post by ID
    if (!postModal) {
        console.error(`Post modal element not found for postId: ${postId}`);
        return;
    }

    postModal.style.display = 'block';
    postModal.setAttribute('aria-hidden', 'false');
    document.getElementById(`postTitle-${postId}`).textContent = "Loading...";

    // Fetch post details
    console.log('Fetching post data for postId:', postId);  // Log before fetching
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(post => {
            if (!post || !post.title) {
                throw new Error('Post not found or invalid post data');
            }

            // Populate the modal with post data
            document.getElementById(`postTitle-${postId}`).textContent = post.title || 'Post Title';
            document.getElementById(`postContent-${postId}`).textContent = post.content || 'No content available';

            const postImagesContainer = document.getElementById(`postImages-${postId}`);
            postImagesContainer.innerHTML = ''; // Clear any existing images

            if (post.imagePaths && post.imagePaths.length > 0) {
                post.imagePaths.forEach(imagePath => {
                    const fullImageUrl = getImagePath({ imagePaths: [imagePath] });
                    const img = document.createElement('img');
                    img.src = fullImageUrl;
                    img.alt = post.title || 'Post Image';
                    img.className = 'post-image';
                    postImagesContainer.appendChild(img);
                });
            } else {
                postImagesContainer.innerHTML = '<p>No images available.</p>';
            }

            // Hide the recipe link for posts without a recipe
            if (!post.recipe) {
                document.getElementById('viewRecipeLink').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching post:', error);
            document.getElementById('postTitle').textContent = "Error loading post.";
            // Hide the modal if there's an error
            postModal.style.display = 'none';
            postModal.setAttribute('aria-hidden', 'true');
        });
}

// Add event listeners for post modal opening
function addPostModalHandlers(postElement) {
    if (postElement) {
        postElement.addEventListener('click', (event) => {
            const postId = postElement.getAttribute('data-post-id');
            if (postId) {
                openPostModal(postId); // Open the post modal when clicked
            }
        });
    }
}
