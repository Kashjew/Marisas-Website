// Function to toggle the hamburger menu visibility
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('open');
        console.log('Menu toggled:', menu.classList.contains('open') ? 'visible' : 'hidden');
    }
}

// Function to close the menu
function closeMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu && menu.classList.contains('open')) {
        menu.classList.add('hidden');
        menu.classList.remove('open');
        console.log('Menu closed via close button');
    }
}

// Initialize menu functionality
function initMenu(menuId, hamburgerId, closeId) {
    const hamburgerMenuButton = document.getElementById(hamburgerId);
    const closeMenuButton = document.getElementById(closeId);

    if (hamburgerMenuButton) {
        hamburgerMenuButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent the click from propagating to the document
            toggleMenu(menuId); // Toggle visibility when hamburger icon is clicked
        });
    }

    if (closeMenuButton) {
        closeMenuButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent the click from propagating to the document
            closeMenu(menuId); // Close the menu when the X button is clicked
        });
    }
}

// Close the menu when clicking outside of it
document.addEventListener("click", function (event) {
    const adminMenu = document.getElementById('menuContainerAdmin');
    const userMenu = document.getElementById('menuContainer');
    const hamburgerMenuButtonAdmin = document.getElementById("hamburgerMenuAdmin");
    const hamburgerMenuButtonUser = document.getElementById("hamburgerMenu");

    // Close admin menu if open
    if (adminMenu && hamburgerMenuButtonAdmin && !adminMenu.contains(event.target) && event.target !== hamburgerMenuButtonAdmin) {
        if (adminMenu.classList.contains('open')) {
            closeMenu('menuContainerAdmin');
        }
    }

    // Close user menu if open
    if (userMenu && hamburgerMenuButtonUser && !userMenu.contains(event.target) && event.target !== hamburgerMenuButtonUser) {
        if (userMenu.classList.contains('open')) {
            closeMenu('menuContainer');
        }
    }
});

// Prevent closing when clicking inside the menu container
document.getElementById('menuContainer')?.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the click from propagating to the document
});
document.getElementById('menuContainerAdmin')?.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the click from propagating to the document
});

// Initialize the menu once DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    initMenu('menuContainer', 'hamburgerMenu', 'closeMenu'); // Initialize the user hamburger menu functionality
    initMenu('menuContainerAdmin', 'hamburgerMenuAdmin', 'closeMenuAdmin'); // Initialize the admin hamburger menu functionality
});
