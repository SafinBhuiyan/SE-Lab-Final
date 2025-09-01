// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();
            const messageDiv = document.getElementById('registerMessage');
            if (messageDiv) {
                messageDiv.className = response.ok ? 'message success' : 'message error';
                messageDiv.textContent = result.message;
            }

            if (response.ok) {
                // Switch to login tab after successful registration
                setTimeout(() => {
                    if (typeof showLogin === 'function') {
                        showLogin();
                    }
                    if (messageDiv) {
                        messageDiv.textContent = 'Registration successful! Please login.';
                        messageDiv.className = 'message success';
                    }
                }, 1500);
            }
        });
    }
});