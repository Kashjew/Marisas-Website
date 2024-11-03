document.addEventListener("DOMContentLoaded", function() {
    function adjustColumns() {
        const leftColumn = document.querySelector('.left-column');
        const rightColumn = document.querySelector('.right-column');
        const latestPostLeft = document.querySelector('.latest-post-left');
        const latestPostRight = document.querySelector('.latest-post-right');

        // Define the threshold for wide vs narrow screens
        const screenWidth = window.innerWidth;

        if (screenWidth >= 1024) {
            // On larger screens, use a 40:60 ratio for left and right columns
            leftColumn.style.flex = '2';
            rightColumn.style.flex = '3';
            latestPostLeft.style.flex = '2';
            latestPostRight.style.flex = '3';
        } else if (screenWidth >= 768) {
            // On medium-sized screens, use a 50:50 ratio
            leftColumn.style.flex = '1';
            rightColumn.style.flex = '1';
            latestPostLeft.style.flex = '1';
            latestPostRight.style.flex = '1';
        } else {
            // On small screens, stack columns
            leftColumn.style.flex = '1';
            rightColumn.style.flex = '1';
            latestPostLeft.style.flex = '1';
            latestPostRight.style.flex = '1';
        }
    }

    // Initial adjustment on page load
    adjustColumns();

    // Adjust columns when the window is resized
    window.addEventListener('resize', adjustColumns);
});
