// Import necessary utilities
import { getImagePath, escapeHTML } from './utilityFunctions.js'; // Adjust the import path as needed
import { addPostModalHandlers } from './postHandlers.js';

// Render the latest post in the right column
export function renderLatestPost(posts) {
    const rightColumn = document.querySelector(".right-column");
    if (rightColumn && posts.length > 0) {
        const latestPost = posts[0];
        const imagePath = getImagePath(latestPost);

        console.log('Latest post image URL:', imagePath); // Debug log for latest post image URL

        rightColumn.innerHTML = `
            <h2>Latest Post</h2>
            <div class="post post-item" data-post-id="${latestPost._id}">
                <h3>${escapeHTML(latestPost.title || 'No Title')}</h3>
                ${imagePath ? `<img src="${escapeHTML(imagePath)}" alt="${escapeHTML(latestPost.title || 'Post Image')}" class="post-image">` : ''}
                <p>${escapeHTML(latestPost.content || 'No content available')}</p>
                <p class="view-post" data-post-id="${latestPost._id}">Click to view post</p>
                ${latestPost.instagramLink ? `<a href="${escapeHTML(latestPost.instagramLink)}" target="_blank">View on Instagram</a>` : ''}
                ${latestPost.author ? `<p>Author: ${escapeHTML(latestPost.author.email || 'Unknown')}</p>` : '<p>Author information not available</p>'}
            </div>
        `;

        // Add event listeners for post modal
        addPostModalHandlers(rightColumn.querySelector('.post-item')); // Use the post-item element instead of the button
    }
}
