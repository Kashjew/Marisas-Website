// JavaScript to handle saving the "Hello" section
document.getElementById('hello-section-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Retrieve content from form
    const helloContent = document.getElementById('hello-content').value;

    try {
        // Send a POST request to the updated API route
        const response = await fetch('/api/update-hello-section', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: helloContent }) // Send the helloContent in request
        });

        // Handle the response
        const result = await response.json();
        if (result.success) {
            alert('Hello section updated successfully!');
        } else {
            alert('Failed to update the Hello section.');
        }
    } catch (error) {
        console.error('Error updating Hello section:', error);
        alert('An error occurred. Please try again.');
    }
});
