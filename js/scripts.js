document.addEventListener("DOMContentLoaded", function() {
    // Dropdown menu functionality
    const dropdownBtn = document.querySelector(".dropdown-btn");
    const dropdownContent = document.querySelector(".dropdown-content");
    
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

    // Modal functionality
    var modals = document.querySelectorAll(".modal");
    var modalButtons = document.querySelectorAll(".modal-button");
    var closeButtons = document.querySelectorAll(".close");

    modalButtons.forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            var modal = document.querySelector(button.getAttribute("href"));
            modal.style.display = "block";
        });
    });

    closeButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            var modal = button.closest(".modal");
            modal.style.display = "none";
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
document.getElementById('loginBtn').onclick = function() {
    document.getElementById('loginModal').style.display = 'block';
};

// Close the login modal
document.getElementById('closeLoginModal').onclick = function() {
    document.getElementById('loginModal').style.display = 'none';
};

// Function to open the sidebar menu
function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
}

// Function to close the sidebar menu
function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
}

// Log out functionality
document.getElementById('logoutBtn').onclick = function() {
    fetch('/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                window.location.reload(); // Refresh the page after logging out
            }
        });
};

let images = [];

// Fetch posts from the server when the page loads
async function fetchPosts() {
    const response = await fetch('/api/posts');
    images = await response.json();
    renderPage(1);  // Always render the first page
}

const itemsPerPage = 8;
let currentPage = 1;

function renderPage(page) {
    const imageGrid = document.getElementById('image-grid');
    imageGrid.innerHTML = ''; // Clear the grid

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = images.slice(start, end);

    paginatedItems.forEach(image => {
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
    });

    document.getElementById('page-info').innerText = `Page ${page}`;
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = end >= images.length;

    // Show delete buttons if logged in
    const deleteButtons = document.querySelectorAll('.w3-button.w3-red');
    deleteButtons.forEach(btn => btn.style.display = isLoggedIn ? 'inline-block' : 'none');
}

document.getElementById('prev-page').onclick = function() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
};

document.getElementById('next-page').onclick = function() {
    if (currentPage * itemsPerPage < images.length) {
        currentPage++;
        renderPage(currentPage);
    }
};

// Load the first page
fetchPosts();

// Function to open the post popup
function openPostPopup(id) {
    const post = images.find(p => p.id === id);
    if (post) {
        document.getElementById('postPopupTitle').innerText = post.title;
        const imagesDiv = document.getElementById('postPopupImages');
        imagesDiv.innerHTML = '';
        post.imagePaths.forEach(imagePath => {
            const img = document.createElement('img');
            img.src = imagePath;
            img.className = 'thumbnail';
            img.onclick = () => openImageModal(imagePath);
            imagesDiv.appendChild(img);
        });
        document.getElementById('postPopupRecipe').innerText = post.recipe;
        document.getElementById('deletePostBtn').onclick = () => deletePost(id);
        document.getElementById('editPostBtn').onclick = () => openEditModal(post);
        document.getElementById('viewPostModal').style.display = 'block';

        // Conditionally show the edit button based on login status
        const editButton = document.getElementById('editPostBtn');
        editButton.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
}

// Function to open the larger image modal with lightbox functionality
function openImageModal(imagePath) {
    document.getElementById('modalImage').src = imagePath;
    document.getElementById('imageModal').style.display = 'block';
}

// Function to delete a post
async function deletePost(id) {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    images = images.filter(p => p.id !== id);
    renderPage(currentPage);
    document.getElementById('viewPostModal').style.display = 'none'; // Close the view modal after deletion
}

// Function to open the edit modal with existing post data
function openEditModal(post) {
    document.getElementById('title').value = post.title;
    document.getElementById('content').value = post.content;
    document.getElementById('recipe').value = post.recipe;

    const postForm = document.getElementById('postForm');
    postForm.setAttribute('data-edit-id', post.id);

    document.getElementById('postModal').style.display = 'block';
    document.getElementById('viewPostModal').style.display = 'none';
}

// Handle create post form submission (includes edit functionality)
document.getElementById('postForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    const editId = this.getAttribute('data-edit-id');
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/posts/${editId}` : '/api/posts';

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
};

// Handle the "Create a Post" button click to open the modal
document.getElementById('openModalBtn').onclick = function() {
    document.getElementById('postModal').style.display = 'block';
};

// Close the "Create a Post" modal
document.getElementById('closePostModal').onclick = function() {
    document.getElementById('postModal').style.display = 'none';
};

// Determine if user is logged in
let isLoggedIn = false;
fetch('/api/check-auth')
    .then(response => response.json())
    .then(data => {
        isLoggedIn = data.loggedIn;
        if (isLoggedIn) {
            document.getElementById('createPostBtnContainer').style.display = 'block';
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'inline-block';
        } else {
            // Ensure that the buttons are hidden when logged out
            document.getElementById('createPostBtnContainer').style.display = 'none';
            document.getElementById('loginBtn').style.display = 'inline-block';
            document.getElementById('logoutBtn').style.display = 'none';

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
