

const sellForm = document.getElementById('sellForm');
const sellMessage = document.getElementById('sellMessage');

// Get the token using the correct storage key
const token = localStorage.getItem('chickconnect_token');

// Check login status
if (!token) {
    window.location.href = 'login.html';
}

// Handle listing submission
sellForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(sellForm);
    const listingData = Object.fromEntries(formData.entries());

    sellMessage.textContent = 'Publishing your listing...';

    try {
        const response = await fetch('/api/listings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(listingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to publish listing.');
        }

        sellMessage.textContent = data.message;
        sellMessage.style.color = 'green';

        sellForm.reset();

    } catch (error) {
        sellMessage.textContent = error.message;
        sellMessage.style.color = 'red';
    }
});
