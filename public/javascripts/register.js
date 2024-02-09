document.getElementById('register-form').addEventListener('submit', function(event) {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value.trim();

    if (!username || !password) {
        event.preventDefault(); 
        alert('Username and password cannot be empty.');
        return;
    }

    if (password.length < 8) {
        event.preventDefault(); 
        alert('Password must be at least 8 characters long.');
        return;
    }

});
