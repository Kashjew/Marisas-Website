// Function to populate tags
export function populateTags(post, postId) {
    const tagsContainer = document.getElementById(`postTags-${postId}`);
    if (tagsContainer) {
        tagsContainer.innerHTML = ''; // Clear any existing tags
        if (post.tags && post.tags.length > 0) {
            post.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'post-tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        } else {
            tagsContainer.innerHTML = '<p>No tags available.</p>';
        }
    } else {
        console.error(`postTags container not found for postId: ${postId}`);
    }
}

// Function to embed Instagram post
export function embedInstagramPost(post, postId) {
    const instagramEmbedElement = document.getElementById(`instagramEmbed-${postId}`);
    if (instagramEmbedElement) {
        if (post.instagramLink) {
            instagramEmbedElement.innerHTML = `
                <blockquote class="instagram-media" data-instgrm-permalink="${post.instagramLink}" data-instgrm-version="12"></blockquote>
                <script async defer src="https://www.instagram.com/embed.js"></script>`;

            // Reinitializing the Instagram embed script
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        } else {
            instagramEmbedElement.innerHTML = '<p>No Instagram post available.</p>';
        }
    } else {
        console.error(`instagramEmbed element not found for postId: ${postId}`);
    }
}

// Function to handle recipe link display
export function handleRecipeLink(post, postId) {
    const recipeLinkElement = document.getElementById(`viewRecipeLink-${postId}`);
    if (recipeLinkElement) {
        if (post.recipe) {
            recipeLinkElement.style.display = 'block';
            recipeLinkElement.setAttribute('data-post-id', post._id);
        } else {
            recipeLinkElement.style.display = 'none';
        }
    } else {
        console.error(`viewRecipeLink element not found for postId: ${postId}`);
    }
}
