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
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error('Error parsing users:', error);
        return [];
    }
}

function saveUsers(users) {
    try {
        if (!Array.isArray(users)) throw new Error('Invalid users data');
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error('Error saving users:', error);
        throw error;
    }
}

// Authentication Utils
function isAuthenticated() {
    return !!localStorage.getItem('userData') && isSessionValid();
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
    localStorage.removeItem('sessionExpiry');
    // Do not remove theme from localStorage anymore
    window.location.href = 'authentication.html';
}

// Alert Modal Functions
function showAlert(type, title, message, showCancelButton = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('alert-modal');
        if (!modal) {
            console.error('Alert modal not found!');
            resolve(false); // Resolve with false if modal is not found
            return;
        }

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

// Add input sanitization
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>&"']/g, (match) => {
        const entities = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return entities[match];
    });
}

// Add session management
function isSessionValid() {
    const session = localStorage.getItem('sessionExpiry');
    return session && Number(session) > Date.now();
}

function refreshSession() {
    const SESSION_DURATION = 3600000; // 1 hour
    localStorage.setItem('sessionExpiry', Date.now() + SESSION_DURATION);
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
    showInfo,
    refreshSession  // Add this export
};