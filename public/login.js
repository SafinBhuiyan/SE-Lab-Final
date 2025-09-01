// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            const messageDiv = document.getElementById('loginMessage');
            if (messageDiv) {
                messageDiv.className = response.ok ? 'message success' : 'message error';
                messageDiv.textContent = result.message;
            }

            if (response.ok && result.redirect) {
                // Redirect to homepage with login success
                setTimeout(() => window.location.href = result.redirect, 1500);
            }
        });
    }
});