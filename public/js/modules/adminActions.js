// Add event listeners for modals and buttons after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {

    // ------------------ CREATE POST FUNCTIONALITY ------------------

    // Handle Create Post Modal
    const createPostBtn = document.getElementById("createPostBtn");
    const createPostModal = document.getElementById('createPostModal');
    const closeCreatePostModal = document.querySelector('.close-create-post'); // Target the grey X button

    if (createPostBtn) {
        createPostBtn.addEventListener("click", function () {
            createPostModal.style.display = 'block';
        });
    }

    // Close the Create Post Modal when the grey X is clicked
    if (closeCreatePostModal) {
        closeCreatePostModal.addEventListener('click', () => {
            createPostModal.style.display = 'none';
        });
    }

    // Handle clicking outside the modal to close it
    window.addEventListener('click', (event) => {
        if (event.target === createPostModal) {
            createPostModal.style.display = 'none';
        }
    });

    // Function to open the post modal for editing
    function openPostModal(postId = null) {
        if (createPostModal) {
            createPostModal.style.display = "block";
            if (postId) {
                // Fetch post data and populate the form for editing
                fetch(`/admin/edit-post/${postId}`)  // Adjusted URL to use the admin-specific route
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            populatePostForm(data.post);
                            document.getElementById('createPostForm').dataset.editMode = true;
                            document.getElementById('createPostForm').dataset.postId = postId;
                        } else {
                            console.error('Error fetching post data:', data.message);
                        }
                    })
                    .catch(error => console.error('Error fetching post data:', error));
            }
        }
    }

    // Function to populate the form with post data (for editing)
    function populatePostForm(post) {
        const createPostForm = document.getElementById("createPostForm");
        if (createPostForm) {
            createPostForm.title.value = post.title || "";
            createPostForm.content.value = post.content || "";
            createPostForm.querySelector('#tagInput').value = post.tags.join(", ") || "";
            createPostForm.instagramLink.value = post.instagramLink || "";
            createPostForm.prepTime.value = post.recipe?.prepTime || "";
            createPostForm.cookTime.value = post.recipe?.cookTime || "";
            createPostForm.servings.value = post.recipe?.servings || "";
            createPostForm.ingredients.value = post.recipe?.ingredients?.join("\n") || "";
            createPostForm.steps.value = post.recipe?.steps?.join("\n") || "";
            createPostForm.notes.value = post.recipe?.notes || "";
        }
    }

    // Function to close the post modal
    function closePostModal() {
        if (createPostModal) {
            createPostModal.style.display = "none";
            resetPostForm(); // Reset the form after closing
        }
    }

    // Function to reset the form when the modal is closed
    function resetPostForm() {
        const createPostForm = document.getElementById("createPostForm");
        if (createPostForm) {
            createPostForm.reset();
            createPostForm.removeAttribute('data-edit-mode');
            createPostForm.removeAttribute('data-postId');
        }
    }

    // Handle Form Submission for Creating or Editing a Post
    const createPostForm = document.getElementById("createPostForm");
    if (createPostForm) {
        createPostForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(event.target); // Collect form data
            const isEditMode = createPostForm.dataset.editMode;
            const postId = createPostForm.dataset.postId;

            let apiUrl = '/admin/create-post';  // Adjusted URL to admin route
            let method = 'POST';

            // If editing an existing post, adjust URL and method
            if (isEditMode) {
                apiUrl = `/admin/edit-post/${postId}`;  // Adjusted URL for editing
                method = 'PUT';
            }

            // Optional: Add validation here
            if (!formData.get('title') || !formData.get('content')) {
                alert('Please fill in all required fields.');
                return;
            }

            // Clear any previous image data to prevent duplicate appends
            formData.delete('images');

            // Ensure the image files are included in the formData
            const imageFiles = document.getElementById('images').files;
            if (imageFiles.length < 1) {
                alert('You must upload at least one image.');
                return;
            }
            if (imageFiles.length > 5) {
                alert('You can upload a maximum of 5 images.');
                return;
            }

            // Append each image file to FormData
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
                // Log the file for debugging purposes
                console.log('File:', imageFiles[i].name, 'Size:', imageFiles[i].size, 'Type:', imageFiles[i].type);
            }

            // Submit the form data to the backend
            fetch(apiUrl, {
                method: method,
                body: formData, // Send the formData including the images
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    alert('Post saved successfully!');
                    closePostModal(); // Close modal

                    // Reset the form after successful submission
                    resetPostForm(); 

                    // Reload the page to show the new/updated post
                    location.reload(); 
                } else {
                    alert('Error saving post: ' + data.message);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                alert('Failed to save the post. Please try again.');
            });
        });
    }

    // ------------------ EDIT & DELETE POST FUNCTIONALITY ------------------

    // Edit post (Admin only) - Opens the Create Post modal
    window.editPost = function(postId) {
        // Fetch the post data using the postId
        fetch(`/admin/edit-post/${postId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Open the Create Post modal
                    if (createPostModal) {
                        createPostModal.style.display = 'block';
                    }

                    // Populate the form with the post data
                    if (createPostForm) {
                        // Populate form fields with post data
                        populatePostForm(data.post);
                        // Set the form to "edit mode" and store the post ID
                        createPostForm.dataset.editMode = true;
                        createPostForm.dataset.postId = postId;
                    }
                } else {
                    console.error('Error fetching post data:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching post data:', error);
            });
    }

    // Delete post (Admin only)
    window.deletePost = function(postId) {
        if (!confirm("Are you sure you want to delete this post?")) {
            return; // If user cancels, exit
        }

        fetch(`/admin/delete-post/${postId}`, {
            method: 'DELETE',
            credentials: 'include', // Include credentials
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete post');
            }
            console.log(`Post ${postId} deleted`);
            alert('The post has been deleted successfully.');
            // Refresh posts after deletion
            fetchPostsAndRender(); 
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('There was an error deleting the post. Please try again later.');
        });
    }

    // ------------------ BAN USER FUNCTIONALITY ------------------

    // Ban user (Admin only)
    window.banUser = function(userId) {
        if (!confirm("Are you sure you want to ban this user?")) {
            return; // If user cancels, exit
        }

        fetch(`/admin/ban-user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ userId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to ban user');
            }
            return response.json();
        })
        .then(result => {
            console.log('User banned:', result);
            alert('The user has been banned successfully.');
            // Optionally, remove the user from the UI or reload users list
            document.getElementById(`user-${userId}`).remove();
        })
        .catch(error => {
            console.error('Error banning user:', error);
            alert('There was an error banning the user. Please try again later.');
        });
    }
    // ------------------ INITIALIZE ADMIN ACTIONS ------------------

    // This function will initialize all event listeners and handlers for admin actions
    function initializeAdminActions() {
        // Edit post buttons
        document.querySelectorAll('.edit-post-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const postId = event.target.dataset.postId;
                if (postId) {
                    openPostModal(postId); // Opens the post modal for editing with the specific post ID
                }
            });
        });

        // Delete post buttons
        document.querySelectorAll('.delete-post-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const postId = event.target.dataset.postId;
                if (postId) {
                    deletePost(postId); // Calls the deletePost function to delete the post by its ID
                }
            });
        });

        // Ban user buttons
        document.querySelectorAll('.ban-user-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.target.dataset.userId;
                if (userId) {
                    banUser(userId); // Calls the banUser function to ban the user by their ID
                }
            });
        });
    }

    // Ensure initializeAdminActions is initialized after the DOM loads
    initializeAdminActions();
});
