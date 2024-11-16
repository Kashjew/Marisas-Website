document.addEventListener('DOMContentLoaded', function () {
    const createPostForm = document.getElementById("createPostForm");
    const createPostModal = document.getElementById("createPostModal");
    const createPostBtn = document.getElementById("createPostBtn");
    const closeCreatePostModal = document.querySelector('.close-create-post');
    const successModal = document.getElementById("successModal");
    const errorModal = document.getElementById("errorModal");
    const closeSuccessBtn = document.getElementById("closeSuccessBtn");
    const closeErrorBtn = document.getElementById("closeErrorBtn");
    const imageInput = document.getElementById("image");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");

    let sortable; // Variable to store the SortableJS instance

    // Open Create Post Modal
    if (createPostBtn) {
        createPostBtn.addEventListener("click", function () {
            createPostModal.style.display = 'block';
        });
    }

    // Close the Create Post Modal when the close button (X) is clicked
    if (closeCreatePostModal) {
        closeCreatePostModal.addEventListener('click', () => {
            createPostModal.style.display = 'none';
        });
    }

    // Close the Create Post Modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === createPostModal) {
            createPostModal.style.display = 'none';
        }
    });

    // Close success and error modals
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            successModal.style.display = 'none';
            errorModal.style.display = 'none';
        });
    });

    // Close success and error modals with specific buttons
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    }

    if (closeErrorBtn) {
        closeErrorBtn.addEventListener('click', () => {
            errorModal.style.display = 'none';
        });
    }

    // Image preview functionality with sorting
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            imagePreviewContainer.innerHTML = ''; // Clear previous previews

            Array.from(this.files).forEach((file, index) => {
                const reader = new FileReader();

                reader.onload = function (e) {
                    // Create preview wrapper
                    const previewWrapper = document.createElement('div');
                    previewWrapper.className = 'preview-wrapper';

                    // Create the image element
                    const imgPreview = document.createElement('img');
                    imgPreview.src = e.target.result;
                    imgPreview.alt = `Image ${index + 1}`;
                    imgPreview.className = 'preview-image';

                    // Create label for the image
                    const label = document.createElement('div');
                    label.className = 'image-label';
                    label.textContent = index === 0 ? 'Cover' : `${index + 1}`;

                    previewWrapper.appendChild(imgPreview);
                    previewWrapper.appendChild(label);
                    imagePreviewContainer.appendChild(previewWrapper);
                };

                reader.readAsDataURL(file);
            });

            // Initialize or reinitialize SortableJS
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

    // Handle the Create Post Form submission
    if (createPostForm) {
        createPostForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent normal form submission

            const formData = new FormData(createPostForm); // Get all form data

            // Validate required fields (title and content)
            if (!formData.get('title') || !formData.get('content')) {
                alert('Please fill in the required fields: Title and Content.');
                return;
            }

            // Ensure image files are included (1-5 images required)
            const imageFiles = document.getElementById('image').files;
            if (imageFiles.length < 1 || imageFiles.length > 5) {
                alert('Please upload between 1 to 5 images.');
                return;
            }

            // Append images to FormData
            formData.delete('images'); // Clear existing image data
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }

            // Get sorted order of images and append it to formData
            const sortedOrder = Array.from(imagePreviewContainer.children).map((child, idx) => idx); // Use indices
            formData.append('imageOrder', JSON.stringify(sortedOrder));

            try {
                // Submit the form data using fetch
                const response = await fetch('/admin/create-post', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();

                    // Show success modal
                    successModal.style.display = 'block';

                    // Reset the form
                    createPostForm.reset();

                    // Clear the image preview container
                    imagePreviewContainer.innerHTML = '';

                    // Close the create post modal
                    createPostModal.style.display = 'none';
                } else {
                    const errorResult = await response.json();
                    // Show error modal
                    errorModal.style.display = 'block';
                }
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
                // Show error modal
                errorModal.style.display = 'block';
            }
        });
    }
});
