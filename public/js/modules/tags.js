// Fetch tags to populate dropdown
export function fetchTags() {
    console.log('Attempting to fetch tags from /api/tags...');
    fetch('/api/tags', {
        method: 'GET',
        credentials: 'include', // Include credentials
        headers: {
            'Accept': 'application/json' // Specify JSON response
        }
    })
    .then(response => {
        console.log('Response received:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(tags => {
        console.log('Tags fetched successfully:', tags);
        renderTagsDropdown(tags);
    })
    .catch(error => {
        console.error('Error fetching tags:', error);
    });
}

// Render tags in dropdown
export function renderTagsDropdown(tags) {
    const tagsDropdown = document.getElementById("tags");
    if (tagsDropdown) {
        console.log('Rendering tags to dropdown:', tags);
        tagsDropdown.innerHTML = '<option value="">Select a tag</option>';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagsDropdown.appendChild(option);
        });
    } else {
        console.error('Tags dropdown element not found');
    }
}

// Initialize tags dropdown functionality
export function initTagsDropdown() {
    // Fetch and render tags when the dropdown is initialized
    fetchTags();
}
