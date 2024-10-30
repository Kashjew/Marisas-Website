// Scroll and Hover Effect for Header
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;

    // Select headers based on their classes
    const userHeader = document.querySelector('.hero-header'); // For Index.ejs
    const adminHeader = document.querySelector('.admin-hero-header'); // For dashboard.ejs

    // Function to handle scroll behavior
    function handleScroll(header) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Hide header on scroll down, show on scroll up
        if (scrollTop > lastScrollTop) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }

    // Function to handle hover behavior
    function handleHover(header) {
        header.addEventListener('mouseenter', () => {
            header.classList.remove('hidden');
        });
    }

    // Add event listeners if headers are present
    if (userHeader) {
        console.log("Adding scroll and hover effects to User Header");
        window.addEventListener('scroll', () => handleScroll(userHeader));
        handleHover(userHeader);
    }

    if (adminHeader) {
        console.log("Adding scroll and hover effects to Admin Header");
        window.addEventListener('scroll', () => handleScroll(adminHeader));
        handleHover(adminHeader);
    }
});
