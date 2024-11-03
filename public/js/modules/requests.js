// Function to submit a user request
export function submitUserRequest(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const requestContent = document.querySelector('.request-input').value;

    fetch('/api/requests', {
        method: 'POST',
        credentials: 'include', // Include credentials
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ content: requestContent })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit request');
        }
        return response.json();
    })
    .then(request => {
        console.log('Request submitted:', request);
        alert('Your request has been submitted. Thank you!');
        document.querySelector('.request-input').value = ''; // Clear the input after submission
    })
    .catch(error => {
        console.error('Error submitting request:', error);
        alert('There was an error submitting your request. Please try again later.');
    });
}

// Function to show the request popup modal
export function showRequestPopup() {
    document.getElementById('requestPopup').style.display = 'block';
}

// Function to close the request popup modal
export function closeRequestPopup() {
    document.getElementById('requestPopup').style.display = 'none';
}

// Initialize the request popup modal functionality
export function initRequestPopup() {
    // Attach event listeners for showing and closing the popup modal
    const requestButton = document.querySelector('.request-button');
    const closeButton = document.querySelector('.close-request-popup');

    if (requestButton) {
        requestButton.addEventListener('click', showRequestPopup);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeRequestPopup);
    }
}
