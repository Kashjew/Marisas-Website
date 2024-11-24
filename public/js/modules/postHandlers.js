export function initPostHandlers() {
    // Log that handlers are being initialized
    console.log("Initializing post handlers for clickable images.");

    // Attach click event listener to the body to debug
    document.body.addEventListener('click', (event) => {
        console.log("Body clicked:", event.target);

        // If the click is on an <a> tag, allow default navigation
        if (event.target.tagName === 'A') {
            console.log("Anchor tag clicked, allowing default navigation to:", event.target.href);
            return;
        }

        // Handle clicks on recipe grid items (if needed)
        const gridItem = event.target.closest('.recipe-grid-item');
        if (gridItem) {
            console.log("Recipe grid item clicked. Ignoring interference.");
        }
    });

    console.log("Post handlers fully initialized.");
}
