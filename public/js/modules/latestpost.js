// Render the latest post in the right column
export function renderLatestPost(posts) {
    const rightColumn = document.querySelector(".right-column");
    if (rightColumn && posts.length > 0) {
        const latestPost = posts[0];
        const imagePath = latestPost.imagePaths && latestPost.imagePaths[0] ? latestPost.imagePaths[0] : '/images/placeholder.jpg';

        console.log('Latest post image URL:', imagePath); // Debug log for latest post image URL

        rightColumn.innerHTML = `
            <h2>Latest Post</h2>
            <div class="post post-item" data-post-id="${latestPost._id}">
                <h3>${latestPost.title || 'No Title'}</h3>
                ${imagePath ? `<img src="${imagePath}" alt="${latestPost.title || 'Post Image'}" class="post-image">` : ''}
                <p>${latestPost.content || 'No content available'}</p>
                <p class="view-post" data-post-id="${latestPost._id}">Click to view post</p>
                ${latestPost.instagramLink ? `<a href="${latestPost.instagramLink}" target="_blank">View on Instagram</a>` : ''}
                ${latestPost.author ? `<p>Author: ${latestPost.author.email || 'Unknown'}</p>` : '<p>Author information not available</p>'}
            </div>
        `;
    }

    // Adjust Instagram embed height dynamically
    adjustInstagramEmbedHeight();
}

// Function to dynamically adjust Instagram embed height
function adjustInstagramEmbedHeight() {
    const instagramIframe = document.querySelector('.latest-post-right iframe');

    if (instagramIframe) {
        instagramIframe.addEventListener('load', function() {
            // Check if the iframe has loaded content
            try {
                // Adjust height based on the content's scroll height
                const iframeHeight = instagramIframe.contentWindow.document.body.scrollHeight;
                instagramIframe.style.height = iframeHeight + 'px';
            } catch (error) {
                console.error("Error accessing iframe content: ", error);
                // Fallback height in case of error
                instagramIframe.style.height = '500px';
            }
        });
    }
}
