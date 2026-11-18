

const sellForm = document.getElementById('sellForm');
const sellMessage = document.getElementById('sellMessage');

const token = localStorage.getItem('chickconnect_token');

if (!token) {
    window.location.href = 'login.html';
}

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

        // Read the response as text first
        const responseText = await response.text();

        console.log('Server response:', responseText);

        // Convert response to JSON
        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                'The server returned HTML instead of JSON. Check your API route in server.js.'
            );
        }

        if (!response.ok) {
            throw new Error(data.message || 'Unable to publish listing.');
        }

        sellMessage.textContent = data.message || 'Listing published successfully!';
        sellMessage.style.color = 'green';

        sellForm.reset();

    } catch (error) {
        console.error('Publishing error:', error);
        sellMessage.textContent = error.message;
        sellMessage.style.color = 'red';
    }
});
