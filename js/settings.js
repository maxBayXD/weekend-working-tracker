import { getCurrentTheme, applyTheme, getCurrentUser, getUsers, saveUsers, showSuccess, showError, logout } from './utils.js';

class SettingsManager {
    static initialize() {
        try {
            const user = getCurrentUser();
            if (!user) {
                window.location.href = 'authentication.html';
                return;
            }

            this.renderUserInfo(user);
            this.initializeThemeToggle();
            this.initializePasswordForm();
            this.initializeLogout();
        } catch (error) {
            console.error('Settings initialization error:', error);
            showError('Error', 'Failed to initialize settings');
        }
    }

    static renderUserInfo(user) {
        if (!user) return;

        const formatDate = (dateString) => {
            if (!dateString) return 'Never';
            try {
                return new Date(dateString).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return 'Invalid date';
            }
        };

        const elements = {
            'user-ps-id': user.psId,
            'user-name': user.name,
            'user-email': user.email,
            'user-role': user.isAdmin ? 'Administrator' : 'User',
            'last-login': formatDate(user.lastLogin)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    static initializeThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = getCurrentTheme() === 'dark';
            themeToggle.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'dark' : 'light';
                // Update theme in both localStorage and user data
                applyTheme(theme);

                // Save theme preference to user data
                const users = getUsers();
                const currentUser = getCurrentUser();
                if (currentUser && users.length > 0) {
                    const userIndex = users.findIndex(u => u.psId === currentUser.psId);
                    if (userIndex !== -1) {
                        users[userIndex].theme = theme;
                        saveUsers(users);

                        // Update current user data in localStorage
                        const userData = { ...currentUser, theme };
                        localStorage.setItem('userData', JSON.stringify(userData));
                    }
                }
            });
        }
    }

    static initializePasswordForm() {
        const passwordForm = document.getElementById('password-change-form');
        if (passwordForm) {
            const inputs = passwordForm.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validatePasswordField(input));
                // Add input event listener to hide error messages
                input.addEventListener('input', () => {
                    const formGroup = input.closest('.form-group');
                    const helperText = formGroup.querySelector('.helper-text');
                    formGroup.classList.remove('error');
                    helperText.classList.remove('error', 'active');
                });
            });

            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Validate all fields before submission
                const inputs = passwordForm.querySelectorAll('input');
                let isValid = true;
                inputs.forEach(input => {
                    if (!this.validatePasswordField(input)) {
                        isValid = false;
                    }
                });

                if (isValid) {
                    await this.handlePasswordChange();
                }
            });
        }

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
    }

    static validatePasswordField(input) {
        const formGroup = input.closest('.form-group');
        const helperText = formGroup.querySelector('.helper-text');

        // Clear existing error state
        formGroup.classList.remove('error');
        helperText.classList.remove('error', 'active');

        // Get dynamic error message based on input type and validation
        let errorMessage = '';
        if (!input.value) {
            errorMessage = `Please enter your ${input.placeholder.toLowerCase()}`;
        } else if (input.id === 'new-password' && !this.isPasswordStrong(input.value)) {
            errorMessage = 'Password must contain at least 8 characters with uppercase, lowercase, number and special character';
        } else if (input.id === 'confirm-password' && input.value !== document.getElementById('new-password').value) {
            errorMessage = 'Passwords do not match';
        }

        // Show error if there is an error message
        if (errorMessage) {
            formGroup.classList.add('error');
            helperText.classList.add('error', 'active');
            helperText.textContent = errorMessage;
            return false;
        }

        return true;
    }

    static initializeLogout() {
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

        // Show success message and then logout
        await showSuccess('Success', 'Password changed successfully. You will be logged out for security reasons.');

        // Logout after showing success message
        logout();
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