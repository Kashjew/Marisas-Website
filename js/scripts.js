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
const logoutBtn = document.getElementById('logoutBtn');
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
        console.log("Fetched Posts:", images); // Logging the fetched posts
        renderLatestPost();
        renderAllPosts();  
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

function renderLatestPost() {
    const latestPostDiv = document.getElementById('latest-post');
    if (images.length > 0) {
        const latestImage = images[0];
        console.log("Rendering latest post:", latestImage); // Logging the latest post
        if (latestImage.imagePaths && latestImage.imagePaths.length > 0) {
            latestPostDiv.innerHTML = `
                <div class="post-image-container">
                    <img src="${latestImage.imagePaths[0]}" alt="${latestImage.title}" class="post-image" onclick="openPostPopup(${latestImage.id})" loading="lazy">
                </div>
                <h3>${latestImage.title}</h3>
            `;
        } else {
            console.error("No image paths found for the latest post.");
        }
    }
}

function renderAllPosts() {
    const allPostsSection = document.getElementById('all-posts-section');
    allPostsSection.innerHTML = ''; // Clear previous content

    images.slice(1).forEach(image => {  // Exclude the latest post
        console.log("Rendering post:", image); // Logging each post
        if (image.imagePaths && image.imagePaths.length > 0) {
            const div = document.createElement('div');
            div.className = 'w3-third w3-margin-bottom';
            div.innerHTML = `
                <div class="post-image-container">
                    <img src="${image.imagePaths[0]}" alt="${image.title}" class="post-image" onclick="openPostPopup(${image.id})" loading="lazy">
                </div>
                <h3>${image.title}</h3>
            `;
            allPostsSection.appendChild(div);
        } else {
            console.error("Invalid image object or imagePaths missing for post:", image);
        }
    });
}

// Function to open the post popup
function openPostPopup(id) {
    const post = images.find(p => p.id === id);
    if (post) {
        document.getElementById('postPopupTitle').innerText = post.title;
        const imagesDiv = document.getElementById('postPopupImages');
        if (imagesDiv) {
            imagesDiv.innerHTML = '';
            if (post.imagePaths && post.imagePaths.length > 0) {
                post.imagePaths.forEach(imagePath => {
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.className = 'thumbnail';
                    img.onclick = () => openImageModal(imagePath);
                    img.loading = 'lazy';
                    imagesDiv.appendChild(img);
                });
            } else {
                console.error("No image paths found for the selected post.");
            }
        }
        document.getElementById('postPopupRecipe').innerText = post.recipe;
        document.getElementById('deletePostBtn').onclick = () => deletePost(id);
        
        const editButton = document.getElementById('editPostBtn');
        if (editButton) {
            editButton.style.display = isLoggedIn ? 'inline-block' : 'none';
            editButton.onclick = () => openEditModal(post);
        }

        document.getElementById('viewPostModal').style.display = 'block';

        // Render Instagram embed if available
        renderInstagramEmbed(post.instagramLink);
    } else {
        console.error("Post not found for ID:", id);
    }
}

// Function to render Instagram embed
function renderInstagramEmbed(instagramLink) {
    const instagramEmbedDiv = document.getElementById('instagramEmbed');
    if (instagramEmbedDiv && instagramLink) {
        instagramEmbedDiv.innerHTML = `
            <blockquote class="instagram-media" data-instgrm-permalink="${instagramLink}" data-instgrm-version="12" style="background:#FFF; border:0; margin:1px 0; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px)">
            </blockquote>
        `;
        // Ensure Instagram script is executed after embedding
        setTimeout(() => {
            if (window.instgrm) {
                window.instgrm.Embeds.process();
            } else {
                loadInstagramEmbedScript();
            }
        }, 500); // 500ms delay to ensure the content loads
    } else if (instagramEmbedDiv) {
        instagramEmbedDiv.innerHTML = ''; // Clear the embed if no link is provided
    }
}

// Function to load Instagram embed script
function loadInstagramEmbedScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.instagram.com/embed.js";
    script.onload = () => {
        if (window.instgrm) {
            window.instgrm.Embeds.process();
        }
    };
    document.body.appendChild(script);
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
        renderLatestPost();  // Refresh the latest post section
        renderAllPosts();    // Refresh the all posts section
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
    const instagramLink = document.getElementById('instagramLink');
    const postForm = document.getElementById('postForm');

    if (title && content && recipe && instagramLink && postForm) {
        title.value = post.title;
        content.value = post.content;
        recipe.value = post.recipe;
        instagramLink.value = post.instagramLink || '';

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
            console.log("Updated Post:", post); // Logging the updated post

            if (editId) {
                const index = images.findIndex(p => p.id === parseInt(editId));
                images[index] = post;
            } else {
                images.unshift(post);  // Add to the front of the array
            }

            renderLatestPost();  // Refresh the latest post section
            renderAllPosts();    // Refresh the all posts section
            document.getElementById('postModal').style.display = 'none'; // Close the modal

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

// Load the first page
fetchPosts();
