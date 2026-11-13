
const token = localStorage.getItem('chickconnect_token');

if (!token) {
    window.location.replace('login.html');
} else {

    fetch('/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(async response => {
        if (!response.ok) {
            throw new Error('Session expired. Please login again.');
        }

        return response.json();
    })
    .then(data => {
        document.getElementById('userName').textContent =
            data.user.full_name;

        localStorage.setItem(
            'chickconnect_user',
            JSON.stringify(data.user)
        );
    })
    .catch(() => {
        localStorage.removeItem('chickconnect_token');
        localStorage.removeItem('chickconnect_user');
        window.location.replace('login.html');
    });
}

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('chickconnect_token');
    localStorage.removeItem('chickconnect_user');

    window.location.replace('login.html');
});
