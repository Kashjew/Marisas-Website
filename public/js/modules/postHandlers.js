import { viewRecipeCard } from './recipe-card.js'; // Import recipe card viewing function
import { getAWSS3BucketURL } from './utilities.js'; // Import the S3 utility function

// Function to handle post modals and clicks
export function initPostHandlers() {
    console.log("Initializing post modals and event listeners...");

    // Attach click event listener using event delegation
    if (document.body) {
        document.body.addEventListener('click', function (event) {
            console.log('Clicked element:', event.target);  // Debugging log

            // Check if the clicked element has the data-post-id
            if (event.target.closest('[data-post-id]')) {
                const postId = event.target.closest('[data-post-id]').getAttribute('data-post-id');
                console.log('Post ID retrieved:', postId);  // Log ensures postId is being extracted
                if (postId) {
                    console.log(`Opening post modal for postId: ${postId}`);
                    openPostModal(postId);  // Open the post modal
                }
            }
            // Handle clicks on recipe card links (use data-recipe-id)
            else if (event.target.closest('[data-recipe-id]')) {
                const postId = event.target.closest('[data-recipe-id]').getAttribute('data-post-id');
                console.log('Post ID retrieved for recipe card:', postId);  // Ensure postId is being extracted
                if (postId) {
                    console.log(`Opening recipe card for postId: ${postId}`);
                    viewRecipeCard(postId);  // Open the recipe card modal
                }
            } 
            // Handle clicks on thumbnails to open the larger image modal
            else if (event.target.classList.contains('post-image')) {
                const fullImageUrl = event.target.src;
                openLargeImageModal(fullImageUrl); // Open the large image modal
            } else {
                console.log('No data-post-id, data-recipe-id, or image found on clicked element');  // Log if no relevant click found
            }
        });
    } else {
        console.error("Document body not found for event listener attachment.");
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

                // Display cook time, prep time, and serving size
                document.getElementById(`prepTime-${postId}`).textContent = post.recipe?.prepTime || 'Not available';
                document.getElementById(`cookTime-${postId}`).textContent = post.recipe?.cookTime || 'Not available';
                document.getElementById(`servings-${postId}`).textContent = post.recipe?.servings || 'Not available';

                // Display tags if available
                const tagsContainer = document.getElementById(`postTags-${postId}`);
                tagsContainer.innerHTML = ''; // Clear any existing tags
                if (post.tags && post.tags.length > 0) {
                    post.tags.forEach(tag => {
                        const tagElement = document.createElement('span');
                        tagElement.className = 'post-tag';
                        tagElement.textContent = tag;
                        tagsContainer.appendChild(tagElement);
                    });
                } else {
                    tagsContainer.innerHTML = '<p>No tags available.</p>';
                }

                // Embed Instagram post
                if (post.instagramLink) {
                    document.getElementById(`instagramEmbed-${postId}`).innerHTML = `
                        <blockquote class="instagram-media" data-instgrm-permalink="${post.instagramLink}" data-instgrm-version="12"></blockquote>
                        <script async defer src="//www.instagram.com/embed.js"></script>`;
                } else {
                    document.getElementById(`instagramEmbed-${postId}`).innerHTML = '<p>No Instagram post available.</p>';
                }

                const postImagesContainer = document.getElementById(`postImages-${postId}`);
                postImagesContainer.innerHTML = ''; // Clear any existing images

                // Image loading logic
                if (post.imagePaths && post.imagePaths.length > 0) {
                    post.imagePaths.forEach(imageKey => {
                        // Check if the image key is valid and not null
                        if (imageKey) {
                            // Check if the image key is a full URL or needs S3 URL
                            const fullImageUrl = imageKey.startsWith('http')
                                ? imageKey
                                : `https://${s3BucketUrl}.s3.${s3Region}.amazonaws.com/uploads/${imageKey}`;
                            const img = document.createElement('img');
                            img.src = fullImageUrl;
                            img.alt = post.title || 'Post Image';
                            img.className = 'post-image'; // Add class for clickable thumbnail
                            postImagesContainer.appendChild(img);
                        }
                    });
                } else {
                    postImagesContainer.innerHTML = '<p>No images available.</p>';
                }

                // Show the recipe link if the post has a recipe
                if (post.recipe) {
                    document.getElementById(`viewRecipeLink-${postId}`).style.display = 'block';
                    document.getElementById(`viewRecipeLink-${postId}`).setAttribute('data-post-id', post._id);  // Attach post ID instead of recipe ID
                } else {
                    document.getElementById(`viewRecipeLink-${postId}`).style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching post:', error);
                document.getElementById(`postTitle-${postId}`).textContent = "Error loading post.";
                postModal.style.display = 'none';
                postModal.setAttribute('aria-hidden', 'true');
            });
    }

    // Function to open the large image modal
    function openLargeImageModal(imageUrl) {
        const largeImageModal = document.getElementById('largeImageModal');
        const largeImageElement = largeImageModal.querySelector('img');

        // Set the image source and display the modal
        largeImageElement.src = imageUrl;
        largeImageModal.style.display = 'block';
        largeImageModal.style.zIndex = '20000'; // Ensure it appears above other modals
        largeImageModal.style.position = 'fixed'; // Ensure it overlays other content
    }

    // Close the large image modal on click outside or on close button
    const largeImageModal = document.getElementById('largeImageModal');
    if (largeImageModal) {
        largeImageModal.addEventListener('click', (event) => {
            if (event.target.id === 'largeImageModal' || event.target.id === 'closeLargeImageButton') {
                largeImageModal.style.display = 'none';
            }
        });
    }

    // Close modal on "X" click
    const closeButtons = document.querySelectorAll('.closePostButton');
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.getAttribute('data-modal-id');
            const postModal = document.getElementById(`modal-${modalId}`);
            if (postModal) {
                postModal.style.display = 'none';
                postModal.setAttribute('aria-hidden', 'true');
            }
        });
    });
}

// Helper function to get image path (from S3)
function getImagePath(imagePath) {
    const s3BucketUrl = getAWSS3BucketURL(); // Get the base S3 bucket URL
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath; // Remove leading slash if exists
    return `${s3BucketUrl}/${cleanImagePath}`; // Construct the full URL for the image
}
