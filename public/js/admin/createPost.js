// createPost.js

document.addEventListener('DOMContentLoaded', function () {
    initializeTinyMCEEditors();

    const createPostForm = document.getElementById("createPostForm");
    const createPostModal = document.getElementById("createPostModal");
    const createPostBtn = document.getElementById("createPostBtn");
    const closeCreatePostModal = document.querySelector('.close-create-post');
    const successModal = document.getElementById("successModal");
    const errorModal = document.getElementById("errorModal");
    const closeSuccessBtn = document.getElementById("closeSuccessBtn");
    const closeErrorBtn = document.getElementById("closeErrorBtn");

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
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener("click", () => {
            successModal.style.display = 'none';
            location.reload();
        });
    }
    if (closeErrorBtn) {
        closeErrorBtn.addEventListener("click", () => {
            errorModal.style.display = 'none';
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
