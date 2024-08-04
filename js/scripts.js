document.addEventListener("DOMContentLoaded", function() {
    // Dropdown menu functionality
    const dropdownBtn = document.querySelector(".dropdown-btn");
    const dropdownContent = document.querySelector(".dropdown-content");
    
    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener("click", function() {
            dropdownContent.classList.toggle("show");
        });

        // Close dropdown if clicked outside
        window.addEventListener("click", function(event) {
            if (!event.target.matches(".dropdown-btn")) {
                if (dropdownContent.classList.contains("show")) {
                    dropdownContent.classList.remove("show");
                }
            }
        });
    }

    // Modal functionality
    var modals = document.querySelectorAll(".modal");
    var modalButtons = document.querySelectorAll(".modal-button");
    var closeButtons = document.querySelectorAll(".close");

    modalButtons.forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            var modal = document.querySelector(button.getAttribute("href"));
            if (modal) {
                modal.style.display = "block";
            }
        });
    });

    closeButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            var modal = button.closest(".modal");
            if (modal) {
                modal.style.display = "none";
            }
        });
    });

    window.addEventListener("click", function(event) {
        modals.forEach(function(modal) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
});

// Show the login modal when clicking the Login button
const loginBtn = document.getElementById('loginBtn');
const closeLoginModal = document.getElementById('closeLoginModal');
if (loginBtn && closeLoginModal) {
    loginBtn.onclick = function() {
        document.getElementById('loginModal').style.display = 'block';
    };

    closeLoginModal.onclick = function() {
        document.getElementById('loginModal').style.display = 'none';
    };
}

// Function to open the sidebar menu
function w3_open() {
    const sidebar = document.getElementById("mySidebar");
    if (sidebar) {
        sidebar.style.display = "block";
    }
}

// Function to close the sidebar menu
function w3_close() {
    const sidebar = document.getElementById("mySidebar");
    if (sidebar) {
        sidebar.style.display = "none";
    }
}

// Log out functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = function() {
        fetch('/logout', { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    window.location.reload(); // Refresh the page after logging out
                }
            });
    };
}

let images = [];

// Fetch posts from the server when the page loads
async function fetchPosts() {
    try {
        const response = await fetch('/api/posts');
        images = await response.json();
        renderPage(1);  // Always render the first page
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

const itemsPerPage = 8;
let currentPage = 1;

function renderPage(page) {
    const imageGrid = document.getElementById('image-grid');
    if (!imageGrid) return; // Ensure imageGrid exists
    imageGrid.innerHTML = ''; // Clear the grid

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = images.slice(start, end);

    if (paginatedItems.length > 0) {
        paginatedItems.forEach(image => {
            if (image.imagePaths && image.imagePaths[0]) { // Check if imagePaths exist and are not empty
                const div = document.createElement('div');
                div.className = 'w3-quarter';
                div.innerHTML = `
                    <div class="post-image-container">
                        <img src="${image.imagePaths[0]}" alt="${image.title}" class="post-image" onclick="openPostPopup(${image.id})">
                    </div>
                    <h3>${image.title}</h3>
                    <button class="w3-button w3-red" style="display:none;" onclick="deletePost(${image.id})">Delete</button>
                `;
                imageGrid.appendChild(div);
            }
        });
    }

    const pageInfo = document.getElementById('page-info');
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');

    if (pageInfo) pageInfo.innerText = `Page ${page}`;
    if (prevPage) prevPage.disabled = page === 1;
    if (nextPage) nextPage.disabled = end >= images.length;

    // Show delete buttons if logged in
    const deleteButtons = document.querySelectorAll('.w3-button.w3-red');
    deleteButtons.forEach(btn => btn.style.display = isLoggedIn ? 'inline-block' : 'none');
}

const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

if (prevPageBtn) {
    prevPageBtn.onclick = function() {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    };
}

if (nextPageBtn) {
    nextPageBtn.onclick = function() {
        if (currentPage * itemsPerPage < images.length) {
            currentPage++;
            renderPage(currentPage);
        }
    };
}

// Load the first page
fetchPosts();

// Function to open the post popup
function openPostPopup(id) {
    const post = images.find(p => p.id === id);
    if (post) {
        document.getElementById('postPopupTitle').innerText = post.title;
        const imagesDiv = document.getElementById('postPopupImages');
        if (imagesDiv) {
            imagesDiv.innerHTML = '';
            post.imagePaths.forEach(imagePath => {
                const img = document.createElement('img');
                img.src = imagePath;
                img.className = 'thumbnail';
                img.onclick = () => openImageModal(imagePath);
                imagesDiv.appendChild(img);
            });
        }
        document.getElementById('postPopupRecipe').innerText = post.recipe;
        document.getElementById('deletePostBtn').onclick = () => deletePost(id);
        document.getElementById('editPostBtn').onclick = () => openEditModal(post);
        document.getElementById('viewPostModal').style.display = 'block';

        // Conditionally show the edit button based on login status
        const editButton = document.getElementById('editPostBtn');
        if (editButton) {
            editButton.style.display = isLoggedIn ? 'inline-block' : 'none';
        }
    }
}

// Function to open the larger image modal with lightbox functionality
function openImageModal(imagePath) {
    const modalImage = document.getElementById('modalImage');
    const imageModal = document.getElementById('imageModal');
    if (modalImage && imageModal) {
        modalImage.src = imagePath;
        imageModal.style.display = 'block';
    }
}

// Function to delete a post
async function deletePost(id) {
    try {
        await fetch(`/api/posts/${id}`, { method: 'DELETE' });
        images = images.filter(p => p.id !== id);
        renderPage(currentPage);
        const viewPostModal = document.getElementById('viewPostModal');
        if (viewPostModal) viewPostModal.style.display = 'none'; // Close the view modal after deletion
    } catch (error) {
        console.error("Error deleting post:", error);
    }
}

// Function to open the edit modal with existing post data
function openEditModal(post) {
    const title = document.getElementById('title');
    const content = document.getElementById('content');
    const recipe = document.getElementById('recipe');
    const postForm = document.getElementById('postForm');

    if (title && content && recipe && postForm) {
        title.value = post.title;
        content.value = post.content;
        recipe.value = post.recipe;

        postForm.setAttribute('data-edit-id', post.id);

        document.getElementById('postModal').style.display = 'block';
        document.getElementById('viewPostModal').style.display = 'none';
    }
}

// Handle create post form submission (includes edit functionality)
const postForm = document.getElementById('postForm');
if (postForm) {
    postForm.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        const editId = this.getAttribute('data-edit-id');
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `/api/posts/${editId}` : '/api/posts';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData
            });
            const post = await response.json();

            if (editId) {
                const index = images.findIndex(p => p.id === parseInt(editId));
                images[index] = post;
            } else {
                images.unshift(post);  // Add to the front of the array
            }

            renderPage(1);  // Re-render the first page
            document.getElementById('postModal').style.display = 'none'; // Close the modal
            document.getElementById('viewPostModal').style.display = 'none'; // Close the view modal if open

            // Reset the form and remove edit ID
            this.removeAttribute('data-edit-id');
            this.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };
}

// Handle the "Create a Post" button click to open the modal
const openModalBtn = document.getElementById('openModalBtn');
const closePostModal = document.getElementById('closePostModal');

if (openModalBtn && closePostModal) {
    openModalBtn.onclick = function() {
        document.getElementById('postModal').style.display = 'block';
    };

    // Close the "Create a Post" modal
    closePostModal.onclick = function() {
        document.getElementById('postModal').style.display = 'none';
    };
}

// Determine if user is logged in
let isLoggedIn = false;
fetch('/api/check-auth')
    .then(response => response.json())
    .then(data => {
        isLoggedIn = data.loggedIn;
        const createPostBtnContainer = document.getElementById('createPostBtnContainer');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        if (isLoggedIn) {
            if (createPostBtnContainer) createPostBtnContainer.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        } else {
            if (createPostBtnContainer) createPostBtnContainer.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';

            // Hide delete buttons if logged out
            const deleteButtons = document.querySelectorAll('.w3-button.w3-red');
            deleteButtons.forEach(btn => btn.style.display = 'none');
        }
    });

// JavaScript to close the modal when the "X" icon is clicked
document.querySelectorAll('.close').forEach(function(closeButton) {
    closeButton.onclick = function() {
        // Find the closest modal to the clicked "X" icon and close it
        const modal = closeButton.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
});
