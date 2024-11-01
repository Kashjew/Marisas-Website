// createPost.js

document.addEventListener('DOMContentLoaded', function () {
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
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener("click", () => {
            successModal.style.display = 'none';
            location.reload();  // Reload page to reflect new post
        });
    }

    if (closeErrorBtn) {
        closeErrorBtn.addEventListener("click", () => {
            errorModal.style.display = 'none';
        });
    }

    // Handle the Create Post Form submission
    if (createPostForm) {
        createPostForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent normal form submission

            const formData = new FormData(createPostForm);  // Get all form data

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

            // Clear formData first to ensure no duplicates
            formData.delete('images');

            // Append images to formData once
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }

            try {
                // Submit the form data using fetch
                const response = await fetch('/admin/create-post', {  // Corrected to admin create-post route
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();

                    // Show success modal
                    successModal.style.display = 'block';

                    // Reset the form
                    createPostForm.reset();

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
