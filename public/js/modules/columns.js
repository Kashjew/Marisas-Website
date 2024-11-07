document.addEventListener("DOMContentLoaded", function() {
    // Existing functionality for index.ejs (remains unchanged)
    function adjustIndexColumns() {
        // Your existing column adjustment code for index.ejs
        const leftColumn = document.querySelector('.left-column');
        const rightColumn = document.querySelector('.right-column');
        const latestPostLeft = document.querySelector('.latest-post-left');
        const latestPostRight = document.querySelector('.latest-post-right');

        const screenWidth = window.innerWidth;

        if (screenWidth >= 1024) {
            leftColumn.style.flex = '2';
            rightColumn.style.flex = '3';
            latestPostLeft.style.flex = '2';
            latestPostRight.style.flex = '3';
        } else if (screenWidth >= 768) {
            leftColumn.style.flex = '1';
            rightColumn.style.flex = '1';
            latestPostLeft.style.flex = '1';
            latestPostRight.style.flex = '1';
        } else {
            leftColumn.style.flex = '1';
            rightColumn.style.flex = '1';
            latestPostLeft.style.flex = '1';
            latestPostRight.style.flex = '1';
        }
    }

    // New functionality for recipe-section.ejs modal in mobile view
    function adjustRecipeModalForMobile() {
        const modalContent = document.querySelector('.recipe-post-modal .modal-body');
        const postTitle = document.querySelector('.recipe-post-modal h2');
        const postImagesContainer = document.querySelector('.recipe-post-images-container');
        const postContent = document.querySelector('.dynamic-content-container');
        const postTags = document.querySelector('.dynamic-tags-container');
        const instagramEmbed = document.querySelector('.recipe-post-modal .right-column');

        const screenWidth = window.innerWidth;

        if (screenWidth < 768) {
            if (modalContent) {
                modalContent.style.display = 'flex';
                modalContent.style.flexDirection = 'column';
                modalContent.style.alignItems = 'center';

                if (postTitle) {
                    postTitle.style.textAlign = 'center';
                    postTitle.style.width = '100%';
                    postTitle.style.marginBottom = '10px';
                }

                if (postImagesContainer) {
                    postImagesContainer.style.width = '90%';
                    postImagesContainer.style.display = 'flex';
                    postImagesContainer.style.flexDirection = 'column';
                    postImagesContainer.style.alignItems = 'center';
                    postImagesContainer.style.gap = '10px';
                }

                if (postContent) {
                    postContent.style.width = '90%';
                    postContent.style.textAlign = 'center';
                    postContent.style.marginTop = '10px';
                }

                if (postTags) {
                    postTags.style.width = '90%';
                    postTags.style.display = 'flex';
                    postTags.style.flexWrap = 'wrap';
                    postTags.style.justifyContent = 'center';
                    postTags.style.marginTop = '10px';
                    postTags.style.textAlign = 'center';
                }

                if (instagramEmbed) {
                    instagramEmbed.style.width = '90%';
                    instagramEmbed.style.marginTop = '10px';
                }
            }
        } else {
            if (modalContent) {
                modalContent.style.display = 'grid';
                modalContent.style.gridTemplateColumns = '1fr 1fr 1fr';
                modalContent.style.alignItems = 'start';

                if (postTitle) {
                    postTitle.style.textAlign = 'left';
                }

                if (postImagesContainer) {
                    postImagesContainer.style.width = '100%';
                    postImagesContainer.style.textAlign = 'left';
                }

                if (postContent) {
                    postContent.style.width = 'auto';
                    postContent.style.textAlign = 'left';
                }

                if (postTags) {
                    postTags.style.width = 'auto';
                    postTags.style.display = 'block';
                    postTags.style.justifyContent = 'flex-start';
                }

                if (instagramEmbed) {
                    instagramEmbed.style.width = 'auto';
                    instagramEmbed.style.marginTop = '0';
                }
            }
        }
    }

    // Initial adjustment on page load
    adjustIndexColumns();
    adjustRecipeModalForMobile();

    // Adjust columns when the window is resized
    window.addEventListener('resize', () => {
        adjustIndexColumns();
        adjustRecipeModalForMobile();
    });
});
