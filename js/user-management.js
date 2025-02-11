import { getUsers, saveUsers, showWarning, showError, showSuccess } from './utils.js';

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
            userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    static initializePasswordToggle() {
        const togglePassword = document.querySelector('.toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility(togglePassword));
        }
    }

    // User Management
    static loadUsers() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        const users = getUsers();
        usersList.innerHTML = users.map(user => this.createUserCard(user)).join('');
    }

    static createUserCard(user) {
        return `
            <div class="user-card">
                <div class="user-card-header">
                    <h3 class="user-card-title">${user.name}</h3>
                    <div class="user-card-actions">
                        <button onclick="UserManager.editUser('${user.psId}')" class="secondary-button">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="UserManager.deleteUser('${user.psId}')" class="secondary-button">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="user-card-info">
                    <p>PS ID: ${user.psId}</p>
                    <p>Email: ${user.email}</p>
                </div>
                ${user.isAdmin ? '<span class="user-card-badge">Admin</span>' : ''}
            </div>
        `;
    }

    // Modal Management
    static showModal(title = 'Add New User') {
        const userModal = document.getElementById('user-modal');
        const modalTitle = document.getElementById('modal-title');
        const passwordField = document.getElementById('modal-password');
        const passwordLabel = document.querySelector('label[for="modal-password"]');

        modalTitle.textContent = title;
        userModal.classList.add('active');
        
        const isEditing = !!this.editingUserId;
        passwordField.style.display = isEditing ? 'none' : 'block';
        passwordLabel.style.display = isEditing ? 'none' : 'block';
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
        const formData = this.getFormData();
        const isEditing = !!this.editingUserId;

        if (!this.validateFormData(formData, isEditing)) {
            return;
        }

        await this.saveUser(formData, isEditing);
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
        if (!isEditing && users.some(u => u.psId === formData.psId)) {
            showError('Error', 'PS ID already exists! Please choose a different PS ID.');
            return false;
        }
        return true;
    }

    static async saveUser(formData, isEditing) {
        const users = getUsers();
        
        if (isEditing) {
            const userIndex = users.findIndex(u => u.psId === this.editingUserId);
            if (userIndex !== -1) {
                formData.password = users[userIndex].password;
                users[userIndex] = formData;
            }
        } else {
            users.push(formData);
        }

        saveUsers(users);
        this.hideModal();
        this.loadUsers();

        const message = isEditing 
            ? 'User details have been successfully updated.'
            : 'New user has been successfully added.';
        
        await showSuccess('Success', message);
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
}

// Make methods available globally for onclick handlers
window.UserManager = UserManager;

export default UserManager; 