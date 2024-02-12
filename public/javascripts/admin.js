document.addEventListener('DOMContentLoaded', function() {
    fetchUsersAndDisplay();
    document.getElementById('add-user-form').addEventListener('submit', addUser);
});

function fetchUsersAndDisplay() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const tableBody = document.querySelector('#editable tbody');
            tableBody.innerHTML = '';
            users.forEach(user => {
                const row = tableBody.insertRow();
                const usernameCell = row.insertCell(0);
                const passwordCell = row.insertCell(1);
                const adminCell = row.insertCell(2);
                usernameCell.textContent = user.username;
                passwordCell.textContent = user.password;
                adminCell.textContent = user.isAdmin;
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.setAttribute('data-username', user.username);
                deleteButton.addEventListener('click', function() {
                    deleteUser(user.username);
                });

                const deleteCell = row.insertCell(3);
                deleteCell.appendChild(deleteButton);

                const editCell = row.insertCell(4);
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'btn btn-success btn-sm';
                editButton.addEventListener('click', () => editUser(user._id, user.username));
                editCell.appendChild(editButton);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}


function addUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;

    if (!username) {
        alert('Username cannot be empty.');
        return;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "User already exists") {
            alert('User already is in database');
        } else {
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
    });

    // window.location.reload();
}

function addUserToTable(user) {
    const table = document.getElementById('editable');
    const row = table.insertRow();
    const usernameCell = row.insertCell(0);
    const passwordCell = row.insertCell(1);

    usernameCell.textContent = user.username;
    passwordCell.textContent = user.password;
}


function deleteUser(username) {
    fetch(`/api/users/${username}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        fetchUsersAndDisplay(); 
    })
    .catch(error => {
        console.error('Error deleting user:', error);
    });
}

function editUser(userId, currentUsername) {
    document.getElementById('edit-username').value = currentUsername;
    document.getElementById('edit-password').value = '';
    document.getElementById('edit-user-form').style.display = 'block';

    document.getElementById('edit-user-form').onsubmit = (event) => {
        event.preventDefault();
        const newUsername = document.getElementById('edit-username').value.trim();
        const newPassword = document.getElementById('edit-password').value.trim();
        
        if (newPassword && newPassword.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        if (!newUsername) {
            console.error('Username cannot be empty');
            return;
        }

        fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUsername, password: newPassword })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            fetchUsersAndDisplay();
            document.getElementById('edit-user-form').style.display = 'none';
        })
        .catch(error => console.error('Error updating user:', error));
    };
}