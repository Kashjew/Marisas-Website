export function adjustBodyPadding() {
    // Ensure the adjustment is only done for specific pages
    const applicablePages = ['user-page', 'login-page'];
    const bodyClassList = document.body.classList;

    // Check if the body has a class that matches the applicable pages
    if (applicablePages.some(pageClass => bodyClassList.contains(pageClass))) {
        if (bodyClassList.contains('login-page') && window.innerWidth > 768) {
            // Login page specific padding for desktop
            document.body.style.paddingTop = '100px'; // Adjust to reduce padding
        } else if (bodyClassList.contains('user-page') && window.innerWidth > 768) {
            // Post page specific padding for desktop
            document.body.style.paddingTop = '190px';
        } else {
            // Mobile view
            document.body.style.paddingTop = '0';
        }
    } else {
        // Reset padding if not on applicable pages
        document.body.style.paddingTop = '0';
    }
}

// Recalculate padding on load and resize
window.addEventListener('load', adjustBodyPadding);
window.addEventListener('resize', adjustBodyPadding);
