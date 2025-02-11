import { getUsers, saveUsers, showWarning, showError, showSuccess } from './utils.js';

class UserManager {
    static initialize() {
        const addUserBtn = document.getElementById('add-user-btn');
        const userModal = document.getElementById('user-modal');
        const userForm = document.getElementById('user-form');
        const closeButtons = document.querySelectorAll('.close-modal');
        const passwordField = document.getElementById('modal-password');
        const passwordLabel = document.querySelector('label[for="modal-password"]');

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

        this.loadUsers();
    }

    static loadUsers() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        const users = getUsers();
        usersList.innerHTML = users.map(user => `
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
        `).join('');
    }

    static showModal(title = 'Add New User') {
        const userModal = document.getElementById('user-modal');
        const modalTitle = document.getElementById('modal-title');
        const passwordField = document.getElementById('modal-password');
        const passwordLabel = document.querySelector('label[for="modal-password"]');

        modalTitle.textContent = title;
        userModal.classList.add('active');
        
        if (this.editingUserId) {
            passwordField.style.display = 'none';
            passwordLabel.style.display = 'none';
            passwordField.required = false;
        } else {
            passwordField.style.display = 'block';
            passwordLabel.style.display = 'block';
            passwordField.required = true;
        }
    }

    static hideModal() {
        const userModal = document.getElementById('user-modal');
        const userForm = document.getElementById('user-form');
        userModal.classList.remove('active');
        userForm.reset();
        this.editingUserId = null;
    }

    static editUser(psId) {
        const users = getUsers();
        const user = users.find(u => u.psId === psId);
        if (user) {
            this.editingUserId = psId;
            document.getElementById('modal-ps-id').value = user.psId;
            document.getElementById('modal-name').value = user.name;
            document.getElementById('modal-email').value = user.email;
            document.getElementById('modal-is-admin').checked = user.isAdmin;
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
        const formData = {
            psId: document.getElementById('modal-ps-id').value,
            name: document.getElementById('modal-name').value,
            email: document.getElementById('modal-email').value,
            isAdmin: document.getElementById('modal-is-admin').checked
        };

        const users = getUsers();

        if (this.editingUserId) {
            const userIndex = users.findIndex(u => u.psId === this.editingUserId);
            if (userIndex !== -1) {
                formData.password = users[userIndex].password;
                users[userIndex] = formData;
            }
        } else {
            if (users.some(u => u.psId === formData.psId)) {
                await showError('Error', 'PS ID already exists! Please choose a different PS ID.');
                return;
            }
            formData.password = document.getElementById('modal-password').value;
            users.push(formData);
        }

        saveUsers(users);
        this.hideModal();
        this.loadUsers();
        await showSuccess(
            'Success',
            this.editingUserId ? 'User has been successfully updated.' : 'New user has been successfully added.'
        );
    }
}

// Make methods available globally for onclick handlers
window.UserManager = UserManager;

export default UserManager; 