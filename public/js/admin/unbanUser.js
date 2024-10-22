// unbanUser.js

document.addEventListener('DOMContentLoaded', function () {
    window.unbanUser = function(userId) {
        if (!confirm("Are you sure you want to unban this user?")) return;

        fetch(`/admin/unban-user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ userId })
        })
        .then(response => response.json())
        .then(result => {
            alert('User has been unbanned successfully.');
            // Optionally, reload the page or update the UI dynamically
            location.reload();
        })
        .catch(error => {
            console.error('Error unbanning user:', error);
            alert('Error unbanning user.');
        });
    }
});
