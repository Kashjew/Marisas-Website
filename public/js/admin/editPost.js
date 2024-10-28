document.addEventListener('DOMContentLoaded', function () {
    const editPostModal = document.getElementById('editPostModal');
    const editPostForm = document.getElementById('editPostForm');
    const imagePreview = document.getElementById('imagePreview');  // For showing image preview
    const closeModalBtn = document.querySelector('.close-create-post'); // Define the close button (X)

    // Helper function to close the modal
    function closeModal() {
        if (editPostModal) {
            editPostModal.style.display = "none";
            editPostForm.reset();  // Reset the form when the modal is closed
            editPostForm.dataset.editMode = false;  // Reset edit mode
            editPostForm.dataset.postId = "";  // Clear postId for new creation
            if (imagePreview) imagePreview.style.display = 'none';  // Hide the image preview
        }
    }

    // Close modal on clicking the 'X' button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal if user clicks outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === editPostModal) {
            closeModal();
        }
    });

    // Helper function to open the modal
    function openModal() {
        if (editPostModal) {
            editPostModal.style.display = "block";
        }
    }

    // Function to handle the "Edit" button click
    window.editPost = function(postId) {
        closeAllModals();  // Close any other open modals
        if (editPostModal && postId) {
            openModal();  // Show the modal

            fetch(`/api/posts/${postId}`)  // Fetch the post details from the API
                .then(response => response.json())
                .then(data => {
                    if (data && data._id) {  // Ensure the post data is returned
                        populatePostForm(data);  // Populate the form with the fetched post data
                        editPostForm.dataset.editMode = true;  // Mark as edit mode
                        editPostForm.dataset.postId = postId;  // Store the post ID for submission
                    } else {
                        console.error('Error fetching post data.');
                    }
                })
                .catch(error => console.error('Error fetching post data:', error));
        }
    };

    // Function to populate the form when editing a post
    function populatePostForm(post) {
        if (editPostForm) {
            editPostForm.title.value = post.title || "";
            editPostForm.content.value = post.content || "";
            editPostForm.querySelector('#tagInput').value = post.tags.join(", ") || "";
            editPostForm.instagramLink.value = post.instagramLink || "";
            editPostForm.prepTime.value = post.recipe?.prepTime || "";
            editPostForm.cookTime.value = post.recipe?.cookTime || "";
            editPostForm.servings.value = post.recipe?.servings || "";
            editPostForm.ingredients.value = post.recipe?.ingredients?.join("\n") || "";
            editPostForm.steps.value = post.recipe?.steps?.join("\n") || "";
            editPostForm.notes.value = post.recipe?.notes || "";

            // If there's an existing image, display it
            if (post.imagePaths && post.imagePaths.length > 0) {
                imagePreview.src = post.imagePaths[0];
                imagePreview.style.display = 'block';  // Show image preview
            } else {
                imagePreview.style.display = 'none';  // Hide preview if no image
            }
        }
    }

    // Ensure only one modal is open at a time
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');  // Assuming all modals have the class 'modal'
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Listen to the form submit event to handle editing
    if (editPostForm) {
        editPostForm.addEventListener('submit', function (event) {
            event.preventDefault();  // Prevent the default form submission

            const postId = editPostForm.dataset.postId;  // Get the post ID if editing
            const formData = new FormData(editPostForm);  // Collect the form data (includes file)
            
            fetch(`/api/posts/${postId}`, {
                method: 'PUT',  // Use PUT for editing
                body: formData  // Send FormData for image upload
            })
            .then(response => {
                if (response.ok) {
                    alert('Post updated successfully!');
                    closeModal();  // Close the modal after success
                    window.location.reload();  // Optionally, reload the page to reflect changes
                } else {
                    alert('Failed to submit the form. Please try again.');
                }
            })
            .catch(err => {
                console.error('Error submitting form:', err);
                alert('An error occurred. Please try again.');
            });
        });
    }
});
