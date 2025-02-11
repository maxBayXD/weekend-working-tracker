function displayUserInfo() {
    const userInfoDiv = document.getElementById('user-info-display');
    const userData = JSON.parse(localStorage.getItem('userData')) || {};

    userInfoDiv.innerHTML = `
            <h3>User Information</h3>
            <div class="user-info-grid">
                <div class="user-info-item">
                    <div class="user-info-label">PS ID</div>
                    <div class="user-info-value">${userData.psId || 'Not set'}</div>
                </div>
                <div class="user-info-item">
                    <div class="user-info-label">Name</div>
                    <div class="user-info-value">${userData.name || 'Not set'}</div>
                </div>
                <div class="user-info-item">
                    <div class="user-info-label">Email</div>
                    <div class="user-info-value">${userData.email || 'Not set'}</div>
                </div>
            </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const accountForm = document.getElementById('account-form');

    if (accountForm) {
        accountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const psId = document.getElementById('ps-id').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;

            // Store user data
            localStorage.setItem('userData', JSON.stringify({ psId, name, email }));

            // Show user info
            document.getElementById('account-creation').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
            displayUserInfo();
        });
    }

    // Load initial user data if exists
    if (localStorage.getItem('userData')) {
        document.getElementById('account-creation').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        displayUserInfo();
    }
});
