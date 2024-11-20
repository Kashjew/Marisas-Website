document.addEventListener('DOMContentLoaded', function () {
    initializeTinyMCEEditors(); // Initialize TinyMCE editors if used

    const editPostModal = document.getElementById('editPostModal');
    const editPostForm = document.getElementById('editPostForm');
    const imageInput = document.getElementById('image');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const closeModalBtn = document.querySelector('.close-create-post');
    const editSuccessModal = document.getElementById('editSuccessModal');
    const editErrorModal = document.getElementById('editErrorModal');
    const closeSuccessBtn = document.getElementById('closeEditSuccessBtn');
    const closeErrorBtn = document.getElementById('closeEditErrorBtn');
    let sortable; // For SortableJS instance

    // Function to show a modal
    function showModal(modal) {
        modal.style.display = 'block';
    }

    // Function to close a modal
    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // Attach close button handlers
    closeSuccessBtn.addEventListener('click', () => closeModal(editSuccessModal));
    closeErrorBtn.addEventListener('click', () => closeModal(editErrorModal));

    // Open the edit modal and populate with existing post data
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const postId = button.getAttribute('data-post-id');
            editPost(postId);
        });
    });

    // Function to close the edit post modal
    function closeEditPostModal() {
        if (editPostModal) {
            editPostModal.style.display = "none";
            editPostForm.reset();
            imagePreviewContainer.innerHTML = ''; // Clear previews
        }
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditPostModal);
    }

    window.addEventListener('click', function (event) {
        if (event.target === editPostModal) {
            closeEditPostModal();
        }
    });

    // Function to fetch and populate the edit form
    async function editPost(postId) {
        closeAllModals();
        if (editPostModal && postId) {
            editPostModal.style.display = "block";

            try {
                const response = await fetch(`/api/posts/${postId}`);
                const data = await response.json();

                if (data && data._id) {
                    populatePostForm(data);
                    editPostForm.dataset.postId = postId;
                } else {
                    console.error('Error fetching post data.');
                    showModal(editErrorModal); // Show error modal
                }
            } catch (error) {
                console.error('Error fetching post data:', error);
                showModal(editErrorModal); // Show error modal
            }
        }
    }

    // Populate the form fields with existing post data
    function populatePostForm(post) {
        if (editPostForm) {
            editPostForm.title.value = post.title || "";
            editPostForm.instagramLink.value = post.instagramLink || "";
            editPostForm.prepTime.value = post.recipe?.prepTime || "";
            editPostForm.cookTime.value = post.recipe?.cookTime || "";
            editPostForm.servings.value = post.recipe?.servings || "";
            editPostForm.querySelector('#tagInput').value = post.tags.join(", ") || "";

            // Populate image previews
            imagePreviewContainer.innerHTML = ''; // Clear previous previews
            if (post.imagePaths && post.imagePaths.length > 0) {
                post.imagePaths.forEach((imagePath, index) => {
                    const previewWrapper = document.createElement('div');
                    previewWrapper.className = 'preview-wrapper';

                    const imgPreview = document.createElement('img');
                    imgPreview.src = imagePath;
                    imgPreview.alt = `Existing Image ${index + 1}`;
                    imgPreview.className = 'preview-image';

                    const label = document.createElement('div');
                    label.className = 'image-label';
                    label.textContent = index === 0 ? 'Cover' : `${index + 1}`;

                    previewWrapper.appendChild(imgPreview);
                    previewWrapper.appendChild(label);
                    imagePreviewContainer.appendChild(previewWrapper);
                });

                // Initialize or reinitialize SortableJS
                if (sortable) {
                    sortable.destroy();
                }
                sortable = new Sortable(imagePreviewContainer, {
                    animation: 150,
                    onEnd: function () {
                        const previews = imagePreviewContainer.children;
                        Array.from(previews).forEach((preview, idx) => {
                            const label = preview.querySelector('.image-label');
                            label.textContent = idx === 0 ? 'Cover' : `${idx + 1}`;
                        });
                    }
                });
            }
        }
    }

    // Close all modals (helper function)
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }

    // Handle the edit form submission
    if (editPostForm) {
        editPostForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const postId = editPostForm.dataset.postId;

            // Log form data before submission
            console.log('Files to be uploaded:', imageInput.files);
            if (imageInput.files.length === 0) {
                console.error('No files selected for upload.');
                return;
            }

            const formData = new FormData(editPostForm);
            Array.from(imageInput.files).forEach((file, i) => {
                formData.append('images', file);
            });
            console.log('FormData content:', Array.from(formData.entries()));

            // Append image order (from SortableJS)
            const sortedOrder = Array.from(imagePreviewContainer.children).map((child, idx) => idx);
            formData.append('imageOrder', JSON.stringify(sortedOrder));

            try {
                const response = await fetch(`/admin/edit-post/${postId}`, {
                    method: 'PUT',
                    body: formData
                });

                if (response.ok) {
                    closeEditPostModal();
                    showModal(editSuccessModal); // Show success modal
                    setTimeout(() => {
                        window.location.reload(); // Reload to reflect changes
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    console.error('Edit failed:', errorData);
                    showModal(editErrorModal); // Show error modal
                }
            } catch (err) {
                console.error('Error during post update:', err);
                showModal(editErrorModal); // Show error modal
            }
        });
    }
});
