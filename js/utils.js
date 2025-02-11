// Theme Management
function applyTheme(theme = 'light') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function getCurrentTheme() {
    return localStorage.getItem('theme') || 'light';
}

// User Management
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Authentication Utils
function isAuthenticated() {
    return !!localStorage.getItem('userData');
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.isAdmin;
}

function logout() {
    localStorage.removeItem('userData');
    window.location.href = 'authentication.html';
}

// Alert Modal Functions
function showAlert(type, title, message, showCancelButton = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('alert-modal');
        const icon = modal.querySelector('.alert-modal-header i');
        const titleEl = modal.querySelector('.alert-modal-header h3');
        const body = modal.querySelector('.alert-modal-body');
        const confirmBtn = document.getElementById('alert-confirm-btn');
        const cancelBtn = document.getElementById('alert-cancel-btn');

        // Set icon and class based on type
        icon.className = 'fas';
        switch (type) {
            case 'success':
                icon.classList.add('fa-check-circle', 'success');
                break;
            case 'error':
                icon.classList.add('fa-times-circle', 'error');
                break;
            case 'warning':
                icon.classList.add('fa-exclamation-triangle', 'warning');
                break;
            default:
                icon.classList.add('fa-info-circle', 'info');
        }

        // Set content
        titleEl.textContent = title;
        body.textContent = message;

        // Show/hide cancel button
        cancelBtn.style.display = showCancelButton ? 'block' : 'none';

        // Handle button clicks
        const handleConfirm = () => {
            modal.classList.remove('active');
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            modal.classList.remove('active');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);

        // Show modal
        modal.classList.add('active');
    });
}

function showSuccess(title, message) {
    return showAlert('success', title, message);
}

function showError(title, message) {
    return showAlert('error', title, message);
}

function showWarning(title, message, showCancel = true) {
    return showAlert('warning', title, message, showCancel);
}

function showInfo(title, message) {
    return showAlert('info', title, message);
}

// Export all functions
export {
    applyTheme,
    getCurrentTheme,
    getUsers,
    saveUsers,
    isAuthenticated,
    getCurrentUser,
    isAdmin,
    logout,
    showSuccess,
    showError,
    showWarning,
    showInfo
}; 