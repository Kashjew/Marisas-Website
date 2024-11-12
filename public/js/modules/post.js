// public/js/modules/post.js

export async function loadPost(postId) {
    try {
        const response = await fetch(`/post/page-data/${postId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const pageData = await response.json();

        if (pageData.showPost && pageData.postData) {
            // Populate the modal with post data
            document.getElementById(`postTitle-${postId}`).textContent = pageData.postData.title;
            document.getElementById(`postContent-${postId}`).innerHTML = pageData.postData.content;

            // Handle images with AWS S3 fallback
            const imageContainer = document.getElementById(`postImages-${postId}`);
            imageContainer.innerHTML = ''; // Clear existing images

            if (pageData.postData.imagePaths && pageData.postData.imagePaths.length > 0) {
                pageData.postData.imagePaths.forEach(imagePath => {
                    const img = document.createElement('img');
                    img.src = imagePath.startsWith('http')
                        ? imagePath
                        : `https://${pageData.s3BucketName}.s3.${pageData.s3Region}.amazonaws.com/uploads/${imagePath}`;
                    img.alt = 'Post Image';
                    img.classList.add('post-image');
                    imageContainer.appendChild(img);
                });
            } else {
                imageContainer.innerHTML = '<p>No images available for this post.</p>';
            }

            // Handle tags
            const tagsContainer = document.getElementById(`postTags-${postId}`);
            tagsContainer.innerHTML = ''; // Clear existing tags
            if (pageData.postData.tags && pageData.postData.tags.length > 0) {
                tagsContainer.innerHTML = `<p>Tags: ${pageData.postData.tags.map(tag => `<span class="post-tag">${tag}</span>`).join(' ')}</p>`;
            } else {
                tagsContainer.innerHTML = '<p>No tags available.</p>';
            }

            // Handle Instagram link
            const instagramEmbed = document.getElementById(`instagramEmbed-${postId}`);
            if (pageData.postData.instagramLink) {
                instagramEmbed.innerHTML = `
                    <blockquote class="instagram-media" data-instgrm-permalink="${pageData.postData.instagramLink}" data-instgrm-version="12">
                        <a href="${pageData.postData.instagramLink}" target="_blank" rel="noopener">View on Instagram</a>
                    </blockquote>
                `;
            } else {
                instagramEmbed.innerHTML = '<p>No Instagram post available.</p>';
            }

            // Display the modal
            const modal = document.getElementById(`postModal-${postId}`);
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
        }
    } catch (error) {
        console.error('Error loading post data:', error);
    }
}
