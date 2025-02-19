import { getUsers, saveUsers, showWarning, showError, showSuccess, getCurrentUser } from './utils.js';

class UserManager {
    static editingUserId = null;

    // Initialization
    static initialize() {
        this.initializeEventListeners();
        this.loadUsers();
    }

    static initializeEventListeners() {
        this.initializeModalControls();
        this.initializePasswordToggle();
    }

    static initializeModalControls() {
        const addUserBtn = document.getElementById('add-user-btn');
        const userForm = document.getElementById('user-form');
        const closeButtons = document.querySelectorAll('.close-modal');

        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showModal());
        }

        if (closeButtons) {
            closeButtons.forEach(button => {
                button.addEventListener('click', () => this.hideModal());
            });
        }

        if (userForm) {
            // Add validation to each input
            const inputs = userForm.querySelectorAll('input:not([type="checkbox"])');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.validateUserField(input));
                input.addEventListener('blur', () => this.validateUserField(input));
            });

            userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    static validateUserField(input) {
        const formGroup = input.closest('.form-group');
        const helperText = formGroup.querySelector('.helper-text');

        // Clear existing error state
        formGroup.classList.remove('error');
        helperText?.classList.remove('visible');

        // Validate field
        if (!input.value) {
            formGroup.classList.add('error');
            if (helperText) {
                helperText.textContent = `${input.placeholder} is required`;
                helperText.classList.add('visible');
            }
            return false;
        }

        if (input.type === 'email' && !this.validateEmail(input.value)) {
            formGroup.classList.add('error');
            if (helperText) {
                helperText.textContent = 'Please enter a valid email address';
                helperText.classList.add('visible');
            }
            return false;
        }

        return true;
    }

    static clearError(input) {
        const formGroup = input.closest('.form-group');
        const helperText = formGroup.querySelector('.helper-text');
        if (formGroup) {
            formGroup.classList.remove('error');
        }
        if (helperText) {
            helperText.classList.remove('visible');
        }
    }

    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // User Management
    static loadUsers() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        const users = getUsers();
        const currentUser = getCurrentUser();

        if (!users || users.length === 0) {
            usersList.innerHTML = '<p class="no-users">No users found</p>';
            return;
        }

        const filteredUsers = currentUser.isAdmin
            ? users.filter(user => user.psId !== currentUser.psId) // Admin sees all users except self
            : users.filter(user => !user.isAdmin); // Regular users see only non-admin users

        if (filteredUsers.length === 0) {
            usersList.innerHTML = '<p class="no-users">No users to display</p>';
            return;
        }

        usersList.innerHTML = filteredUsers
            .map(user => this.createUserCard(user))
            .join('');
    }

    static createUserCard(user) {
        if (!user) return '';

        return `
            <div class="user-card">
                <div class="user-card-header">
                    <h3 class="user-card-title">${user.name || 'No Name'}</h3>
                    <div class="user-card-actions">
                        <button onclick="UserManager.editUser('${user.psId}')" class="primary-button" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="UserManager.deleteUser('${user.psId}')" class="secondary-button" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="user-card-info">
                    <div class="info-row"><i class="fas fa-id-badge"></i> <span>${user.psId}</span></div>
                    <div class="info-row"><i class="fas fa-envelope"></i> <span>${user.email || 'No Email'}</span></div>
                    <div class="info-row"><i class="fas fa-clock"></i> <span>Last Login: ${this.formatDate(user.lastLogin)}</span></div>
                </div>
                ${user.isAdmin ? '<div class="user-card-badge"><i class="fas fa-shield-alt"></i> Administrator</div>' : ''}
            </div>
        `;
    }

    static formatDate(dateString) {
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
    }

    // Modal Management
    static showModal(title = 'Add New User') {
        const userModal = document.getElementById('user-modal');
        const modalTitle = document.getElementById('modal-title');
        const passwordField = document.getElementById('modal-password');
        const passwordLabel = document.querySelector('label[for="modal-password"]');
        const passwordToggle = document.querySelector('.toggle-password[data-target="modal-password"]');

        modalTitle.textContent = title;
        userModal.classList.add('active');

        const isEditing = !!this.editingUserId;
        passwordField.style.display = isEditing ? 'none' : 'block';
        passwordLabel.style.display = isEditing ? 'none' : 'block';
        if (passwordToggle) {
            passwordToggle.style.display = isEditing ? 'none' : 'block';
        }
        passwordField.required = !isEditing;
    }

    static hideModal() {
        const userModal = document.getElementById('user-modal');
        const userForm = document.getElementById('user-form');
        userModal.classList.remove('active');
        userForm.reset();
        this.editingUserId = null;
    }

    // User Operations
    static async editUser(psId) {
        const users = getUsers();
        const user = users.find(u => u.psId === psId);
        if (user) {
            this.editingUserId = psId;
            this.populateForm(user);
            this.showModal('Edit User');
        }
    }

    static async deleteUser(psId) {
        const confirmed = await showWarning(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            true
        );

        if (confirmed) {
            const users = getUsers();
            const updatedUsers = users.filter(u => u.psId !== psId);
            saveUsers(updatedUsers);
            this.loadUsers();
            await showSuccess('Success', 'User has been successfully deleted.');
        }
    }

    static async handleFormSubmit(e) {
        e.preventDefault();

        // Get form data first
        const formData = this.getFormData();
        const isEditing = !!this.editingUserId;

        // Validate required fields
        const requiredFields = ['name', 'email'];
        if (!isEditing) {
            requiredFields.push('psId', 'password');
        }

        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            showError('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Save user
        this.saveUser(formData, isEditing);
    }

    // Helper Methods
    static populateForm(user) {
        document.getElementById('modal-ps-id').value = user.psId;
        document.getElementById('modal-name').value = user.name;
        document.getElementById('modal-email').value = user.email;
        document.getElementById('modal-is-admin').checked = user.isAdmin;
    }

    static getFormData() {
        return {
            psId: document.getElementById('modal-ps-id').value,
            name: document.getElementById('modal-name').value,
            email: document.getElementById('modal-email').value,
            isAdmin: document.getElementById('modal-is-admin').checked,
            password: document.getElementById('modal-password')?.value
        };
    }

    static validateFormData(formData, isEditing) {
        const users = getUsers();

        // For new users
        if (!isEditing) {
            if (!formData.password) {
                showError('Error', 'Password is required for new users');
                return false;
            }
            if (users.some(u => u.psId === formData.psId)) {
                showError('Error', 'PS ID already exists! Please choose a different PS ID.');
                return false;
            }
        }

        // Check email uniqueness (except for the current user being edited)
        const emailConflict = users.find(u =>
            u.email === formData.email &&
            (!isEditing || u.psId !== this.editingUserId)
        );

        if (emailConflict) {
            showError('Error', 'Email already exists! Please use a different email.');
            return false;
        }

        return true;
    }

    static async saveUser(formData, isEditing) {
        try {
            const users = getUsers();

            if (isEditing) {
                // For editing existing user
                const userIndex = users.findIndex(u => u.psId === this.editingUserId);
                if (userIndex === -1) {
                    throw new Error('User not found');
                }

                // Check if email is unique (excluding current user)
                const emailExists = users.some(u =>
                    u.email === formData.email &&
                    u.psId !== this.editingUserId
                );

                if (emailExists) {
                    throw new Error('Email already exists');
                }

                // Update user while preserving sensitive data
                const existingUser = users[userIndex];
                users[userIndex] = {
                    ...existingUser,           // Keep all existing data
                    name: formData.name,       // Update editable fields
                    email: formData.email,
                    isAdmin: formData.isAdmin
                };

                // Save changes
                saveUsers(users);
                await showSuccess('Success', 'User details have been successfully updated.');
            } else {
                // For new user
                if (!formData.password) {
                    throw new Error('Password is required for new users');
                }

                // Validate new user data
                if (users.some(u => u.psId === formData.psId)) {
                    throw new Error('PS ID already exists');
                }

                if (users.some(u => u.email === formData.email)) {
                    throw new Error('Email already exists');
                }

                // Add new user
                users.push({
                    ...formData,
                    lastLogin: null,
                    theme: 'light'
                });

                // Save changes
                saveUsers(users);
                await showSuccess('Success', 'New user has been successfully added.');
            }

            // Update UI
            this.hideModal();
            this.loadUsers();
            return true;

        } catch (error) {
            console.error('Save user error:', error);
            await showError('Error', error.message);
            return false;
        }
    }

    static togglePasswordVisibility(button) {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
    }

    static initializePasswordToggle() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = button.querySelector('i');

                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                icon.classList.toggle('fa-eye', !isPassword);
                icon.classList.toggle('fa-eye-slash', isPassword);
            });
        });
    }
}

// Make methods available globally for onclick handlers
window.UserManager = UserManager;

export default UserManager;