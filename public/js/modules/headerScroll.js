// Scroll and Hover Effect for Header
let lastScrollTop = 0;
const header = document.querySelector('.hero-header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Hide header on scroll down, show on scroll up
    if (scrollTop > lastScrollTop) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Show header on hover
header.addEventListener('mouseenter', () => {
    header.classList.remove('hidden');
});
