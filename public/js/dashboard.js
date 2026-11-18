


const token = localStorage.getItem('chickconnect_token');

// Protect the dashboard
if (!token) {
    window.location.replace('login.html');
} else {

    // Load saved user information
    const savedUser = JSON.parse(
        localStorage.getItem('chickconnect_user') || 'null'
    );

    if (savedUser) {
        document.getElementById('userName').textContent =
            savedUser.full_name || 'User';

        document.getElementById('sidebarUserName').textContent =
            savedUser.full_name || 'My Account';
    }

    // Verify the user's session
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
        const user = data.user;

        document.getElementById('userName').textContent =
            user.full_name || 'User';

        document.getElementById('sidebarUserName').textContent =
            user.full_name || 'My Account';

        localStorage.setItem(
            'chickconnect_user',
            JSON.stringify(user)
        );

        // Load this user's chicken listings
        loadMyListings();
    })
    .catch(error => {
        console.error('Authentication error:', error);

        localStorage.removeItem('chickconnect_token');
        localStorage.removeItem('chickconnect_user');

        window.location.replace('login.html');
    });
}


// Safely display text received from the server
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);
}


// LOAD MY CHICKEN LISTINGS
async function loadMyListings() {

    const container = document.getElementById('myListingsContainer');

    if (!container) return;

    try {
        const response = await fetch('/api/my-listings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to load listings.');
        }

        const listings = data.listings || [];

        // Update dashboard listing count
        const listingCount = document.querySelector(
            '#listings .dashboard-section-heading'
        );

        if (listings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>🐔</div>
                    <h3>No listings yet</h3>
                    <p>Your published chicken listings will appear here.</p>
                    <a href="sell.html">Create Listing</a>
                </div>
            `;

        } else {

            container.innerHTML = listings.map(listing => {

                const image = listing.image
                    ? `<img src="${escapeHTML(listing.image)}"
                            alt="${escapeHTML(listing.title)}"
                            class="my-listing-image"
                            onerror="this.style.display='none'">`
                    : `<div class="my-listing-placeholder">🐔</div>`;

                const status = escapeHTML(listing.status || 'available');

                return `
                    <article class="my-listing-card">

                        ${image}

                        <div class="my-listing-details">

                            <h3>${escapeHTML(listing.title)}</h3>

                            <p>
                                ${escapeHTML(listing.chicken_type)}
                                · ${escapeHTML(listing.location)}
                            </p>

                            <strong>
                                ${Number(listing.price).toLocaleString()}
                                FCFA
                            </strong>

                            <small>
                                Quantity: ${escapeHTML(listing.quantity)}
                            </small>

                            <span class="listing-status">
                                ${status}
                            </span>

                        </div>

                    </article>
                `;
            }).join('');
        }

        // Update the listing count in the dashboard statistics
        const statCards = document.querySelectorAll('.stat-card');

        if (statCards[1]) {
            statCards[1].querySelector('h2').textContent =
                listings.length;
        }

    } catch (error) {
        console.error('Listings error:', error);

        container.innerHTML = `
            <p class="listings-error">
                Unable to load your listings. Please try again.
            </p>
        `;
    }
}


// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => {

    localStorage.removeItem('chickconnect_token');
    localStorage.removeItem('chickconnect_user');

    window.location.replace('login.html');

});
