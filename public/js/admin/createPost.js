document.addEventListener('DOMContentLoaded', function () {
    initializeTinyMCEEditors();

    const createPostForm = document.getElementById("createPostForm");
    const createPostModal = document.getElementById("createPostModal");
    const createPostBtn = document.getElementById("createPostBtn");
    const closeCreatePostModal = document.querySelector('.close-create-post');
    const successModal = document.getElementById("successModal");
    const errorModal = document.getElementById("errorModal");
    const imageInput = document.getElementById("image");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");

    let sortable; // Variable to store the SortableJS instance

    // Open Create Post Modal
    if (createPostBtn) {
        createPostBtn.addEventListener("click", function () {
            createPostModal.style.display = 'block';
        });
    }

    // Close modals
    if (closeCreatePostModal) {
        closeCreatePostModal.addEventListener('click', () => {
            createPostModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (event) => {
        if (event.target === createPostModal) {
            createPostModal.style.display = 'none';
        }
    });

    // Handle image preview and SortableJS
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            imagePreviewContainer.innerHTML = ''; // Clear existing previews

            Array.from(this.files).forEach((file, index) => {
                const reader = new FileReader();

                reader.onload = function (e) {
                    // Create preview container
                    const previewWrapper = document.createElement('div');
                    previewWrapper.className = 'preview-wrapper';

                    // Create preview image
                    const imgPreview = document.createElement('img');
                    imgPreview.src = e.target.result;
                    imgPreview.alt = `Image ${index + 1}`;
                    imgPreview.className = 'preview-image';

                    // Create label for order
                    const label = document.createElement('div');
                    label.className = 'image-label';
                    label.textContent = index === 0 ? 'Cover' : `${index + 1}`;

                    previewWrapper.appendChild(imgPreview);
                    previewWrapper.appendChild(label);
                    imagePreviewContainer.appendChild(previewWrapper);
                };

                reader.readAsDataURL(file);
            });

            // Initialize SortableJS for reordering previews
            if (sortable) {
                sortable.destroy(); // Destroy existing instance
            }
            sortable = new Sortable(imagePreviewContainer, {
                animation: 150,
                onEnd: function () {
                    // Update labels after sorting
                    const previews = imagePreviewContainer.children;
                    Array.from(previews).forEach((preview, idx) => {
                        const label = preview.querySelector('.image-label');
                        label.textContent = idx === 0 ? 'Cover' : `${idx + 1}`;
                    });
                }
            });
        });
    }

    // Handle Create Post form submission
    if (createPostForm) {
        createPostForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const formData = new FormData(createPostForm);

            // Validate and append image files
            const imageFiles = document.getElementById('image').files;
            if (imageFiles.length < 1 || imageFiles.length > 5) {
                alert('Please upload between 1 to 5 images.');
                return;
            }

            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }

            // Get the sorted order of images
            const sortedOrder = Array.from(imagePreviewContainer.children).map((child) => {
                return child.querySelector('.preview-image').src;
            });
            formData.append('imageOrder', JSON.stringify(sortedOrder));

            try {
                const response = await fetch('/admin/create-post', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    successModal.style.display = 'block';
                    createPostForm.reset();
                    createPostModal.style.display = 'none';
                } else {
                    errorModal.style.display = 'block';
                }
            } catch (error) {
                console.error('Fetch error:', error);
                errorModal.style.display = 'block';
            }
        });
    }
});
