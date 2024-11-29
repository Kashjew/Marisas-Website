export function initHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (!hamburgerMenu || !dropdownMenu) {
        console.warn("Hamburger menu or dropdown menu not found on this page.");
        return;
    }

    // Debugging: Check if the elements are being found
    console.log("Hamburger menu and dropdown found. Adding click listener...");

    // Add event listener for toggling the dropdown menu
    hamburgerMenu.addEventListener('click', function () {
        console.log("Hamburger menu clicked.");
        dropdownMenu.classList.toggle('hidden');
        dropdownMenu.classList.toggle('show');
    });
}
