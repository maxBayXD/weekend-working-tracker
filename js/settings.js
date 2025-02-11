import { getCurrentTheme, applyTheme, getCurrentUser, getUsers, saveUsers, showSuccess, showError, logout } from './utils.js';

class SettingsManager {
    static initialize() {
        const user = getCurrentUser();
        if (!user) {
            window.location.href = 'authentication.html';
            return;
        }

        // Display user information
        document.getElementById('user-ps-id').textContent = user.psId;
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-role').textContent = user.isAdmin ? 'Administrator' : 'User';
        document.getElementById('last-login').textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';

        // Initialize password toggle buttons
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });

        // Initialize password change form
        const passwordForm = document.getElementById('password-change-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await SettingsManager.handlePasswordChange();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = getCurrentTheme() === 'dark';
            themeToggle.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'dark' : 'light';
                applyTheme(theme);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => logout());
        }
    }

    static async handlePasswordChange() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Get current user and all users
        const currentUser = getCurrentUser();
        const users = getUsers();
        const userIndex = users.findIndex(u => u.psId === currentUser.psId);

        if (userIndex === -1) {
            await showError('Error', 'User not found');
            return;
        }

        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            await showError('Error', 'Current password is incorrect');
            return;
        }

        // Validate new password
        if (newPassword !== confirmPassword) {
            await showError('Error', 'New passwords do not match');
            return;
        }

        // Check if new password is same as current
        if (newPassword === currentPassword) {
            await showError('Error', 'New password cannot be the same as current password');
            return;
        }

        // Check password strength
        if (!SettingsManager.isPasswordStrong(newPassword)) {
            await showError('Error', 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            return;
        }

        // Update password
        users[userIndex].password = newPassword;
        saveUsers(users);

        // Clear form
        document.getElementById('password-change-form').reset();

        // Reset password toggle buttons
        document.querySelectorAll('.toggle-password i').forEach(icon => {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        });
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.type = 'password';
        });

        await showSuccess('Success', 'Password changed successfully');
    }

    static isPasswordStrong(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar
        );
    }

    static toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        const header = section.previousElementSibling;
        
        if (section.classList.contains('expanded')) {
            section.classList.remove('expanded');
            header.classList.remove('expanded');
        } else {
            section.classList.add('expanded');
            header.classList.add('expanded');
        }
    }
}

// Make toggleSection available globally for onclick handlers
window.toggleSection = SettingsManager.toggleSection;

export default SettingsManager; 