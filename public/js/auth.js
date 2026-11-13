
// CHICKCONNECT AUTHENTICATION

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// REGISTRATION
if (registerForm) {

    registerForm.addEventListener('submit', async (event) => {

        event.preventDefault();

        const message = document.getElementById('registerMessage');
        const formData = new FormData(registerForm);

        const userData = Object.fromEntries(formData.entries());

        message.textContent = 'Creating your account...';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            message.textContent = result.message;
            message.style.color = 'green';

            registerForm.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            message.textContent = error.message;
            message.style.color = 'red';
        }
    });
}


// LOGIN
if (loginForm) {

    loginForm.addEventListener('submit', async (event) => {

        event.preventDefault();

        const message = document.getElementById('loginMessage');
        const formData = new FormData(loginForm);

        const loginData = Object.fromEntries(formData.entries());

        message.textContent = 'Checking your account...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            // Save login information
            localStorage.setItem('chickconnect_token', result.token);
            localStorage.setItem(
                'chickconnect_user',
                JSON.stringify(result.user)
            );

            message.textContent = 'Login successful!';
            message.style.color = 'green';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            message.textContent = error.message;
            message.style.color = 'red';
        }
    });
}
