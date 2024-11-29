document.addEventListener("DOMContentLoaded", () => {
    const titleContainers = document.querySelectorAll('.recipe-title-container');

    const adjustTitleContainer = (container) => {
        // Remove the class before checking
        container.classList.remove('long-title');

        // Reset font size and line height to their defaults
        container.style.fontSize = '';
        container.style.lineHeight = '';

        // Check if the text overflows the container
        if (container.scrollHeight > container.clientHeight) {
            console.log('Title is too long, adjusting:', container.textContent.trim());
            container.classList.add('long-title'); // Add the class for long titles
            container.style.fontSize = '14px'; // Adjust font size
            container.style.lineHeight = '1.1'; // Slightly reduce line height
        }
    };

    // Apply adjustments to all title containers
    titleContainers.forEach(adjustTitleContainer);

    // Reapply adjustments on window resize
    window.addEventListener('resize', () => {
        titleContainers.forEach(adjustTitleContainer);
    });
});
