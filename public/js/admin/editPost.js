document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded event fired");

    const editPostModal = document.getElementById('editPostModal');
    const editPostForm = document.getElementById('editPostForm');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const closeModalBtn = document.querySelector('.close-create-post');

    // Attach click event listeners to all edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const postId = button.getAttribute('data-post-id');
            console.log("Edit button clicked, postId:", postId);
            editPost(postId);  // Trigger the editPost function with the postId
        });
    });

    // Helper function to close the modal
    function closeModal() {
        if (editPostModal) {
            editPostModal.style.display = "none";
            editPostForm.reset();
            editPostForm.dataset.editMode = false;
            editPostForm.dataset.postId = "";
            if (imagePreview) imagePreview.style.display = 'none';
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
        console.log("Opening edit modal for postId:", postId);
        closeAllModals();
        if (editPostModal && postId) {
            openModal();

            fetch(`/api/posts/${postId}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data._id) {
                        console.log("Post data fetched:", data);
                        populatePostForm(data);
                        editPostForm.dataset.editMode = true;
                        editPostForm.dataset.postId = postId;
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

            if (post.imagePaths && post.imagePaths.length > 0) {
                imagePreview.src = post.imagePaths[0];
                imagePreview.style.display = 'block';
            } else {
                imagePreview.style.display = 'none';
            }
        }
    }

    // Ensure only one modal is open at a time
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Listen to the form submit event to handle editing
    if (editPostForm) {
        editPostForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const postId = editPostForm.dataset.postId;
            const textData = new FormData(editPostForm);

            textData.delete('images');

            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'PUT',
                    body: textData
                });

                if (response.ok) {
                    if (imageInput.files.length > 0) {
                        const imageFormData = new FormData();
                        for (let i = 0; i < imageInput.files.length; i++) {
                            imageFormData.append('images', imageInput.files[i]);
                        }

                        await fetch(`/api/posts/${postId}/upload-images`, {
                            method: 'POST',
                            body: imageFormData
                        });
                    }

                    alert('Post updated successfully!');
                    closeModal();
                    window.location.reload();
                } else {
                    alert('Failed to update the post. Please try again.');
                }
            } catch (err) {
                console.error('Error submitting form:', err);
                alert('An error occurred. Please try again.');
            }
        });
    }
});
