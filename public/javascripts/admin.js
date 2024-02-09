document.addEventListener('DOMContentLoaded', function() {
    fetchUsersAndDisplay();
    document.getElementById('add-user-form').addEventListener('submit', addUser);
});

function fetchUsersAndDisplay() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const table = document.getElementById('editable');
            const tableBody = table.querySelector('tbody') || table.appendChild(document.createElement('tbody'));
            tableBody.innerHTML = ''; // Clear only the body of the table
            users.forEach(user => {
                const row = tableBody.insertRow();
                const usernameCell = row.insertCell(0);
                const passwordCell = row.insertCell(1);
                // Don't try to display the password as it's not returned from the server
                usernameCell.textContent = user.username;
                passwordCell.textContent = user.password
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function addUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
    });

    window.location.reload();
}

function updatePage() {
    window.location.reload();
}

function addUserToTable(user) {
    const table = document.getElementById('editable');
    const row = table.insertRow();
    const usernameCell = row.insertCell(0);
    const passwordCell = row.insertCell(1);

    usernameCell.textContent = user.username;
    passwordCell.textContent = user.password;
}

