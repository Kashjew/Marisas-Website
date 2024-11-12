// editPost.js

document.addEventListener('DOMContentLoaded', function () {
    initializeTinyMCEEditors();

    const editPostModal = document.getElementById('editPostModal');
    const editPostForm = document.getElementById('editPostForm');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const closeModalBtn = document.querySelector('.close-create-post');

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const postId = button.getAttribute('data-post-id');
            editPost(postId);
        });
    });

    function closeModal() {
        if (editPostModal) {
            editPostModal.style.display = "none";
            editPostForm.reset();
            if (imagePreview) imagePreview.style.display = 'none';
        }
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', function(event) {
        if (event.target === editPostModal) {
            closeModal();
        }
    });

    window.editPost = function(postId) {
        closeAllModals();
        if (editPostModal && postId) {
            editPostModal.style.display = "block";

            fetch(`/api/posts/${postId}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data._id) {
                        populatePostForm(data);
                        editPostForm.dataset.postId = postId;
                    } else {
                        console.error('Error fetching post data.');
                    }
                })
                .catch(error => console.error('Error fetching post data:', error));
        }
    };

    function populatePostForm(post) {
        if (editPostForm) {
            editPostForm.title.value = post.title || "";
            editPostForm.instagramLink.value = post.instagramLink || "";
            editPostForm.prepTime.value = post.recipe?.prepTime || "";
            editPostForm.cookTime.value = post.recipe?.cookTime || "";
            editPostForm.servings.value = post.recipe?.servings || "";
            editPostForm.querySelector('#tagInput').value = post.tags.join(", ") || "";

            if (post.imagePaths && post.imagePaths.length > 0) {
                imagePreview.src = post.imagePaths[0];
                imagePreview.style.display = 'block';
            } else {
                imagePreview.style.display = 'none';
            }
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }

    if (editPostForm) {
        editPostForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const postId = editPostForm.dataset.postId;
            const formData = new FormData(editPostForm);

            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'PUT',
                    body: formData
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
                    closeModal();
                    window.location.reload();
                } else {
                    alert('Failed to update the post.');
                }
            } catch (err) {
                alert('An error occurred. Please try again.');
            }
        });
    }
});
