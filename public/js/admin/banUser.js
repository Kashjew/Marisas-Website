// banUser.js

document.addEventListener('DOMContentLoaded', function () {
    window.banUser = function(userId) {
        if (!confirm("Are you sure you want to ban this user?")) return;

        fetch(`/admin/ban-user`, {
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
            alert('User has been banned successfully.');
            document.getElementById(`user-${userId}`).remove();
        })
        .catch(error => {
            console.error('Error banning user:', error);
            alert('Error banning user.');
        });
    }
});
