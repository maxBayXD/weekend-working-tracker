import { getUsers, saveUsers, showError, showSuccess } from './utils.js';

class AuthManager {
    // Constants
    static PASSWORD_REQUIREMENTS = {
        minLength: 8,
        patterns: {
            uppercase: /[A-Z]/,
            lowercase: /[a-z]/,
            numbers: /\d/,
            specialChars: /[!@#$%^&*(),.?":{}|<>]/
        }
    };

    static DEFAULT_ADMIN = {
        psId: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // In a real app, this should be hashed
        isAdmin: true,
        lastLogin: null
    };

    // Initialization
    static initialize() {
        this.initializeDefaultAdmin();
        this.initializeEventListeners();
    }

    static initializeDefaultAdmin() {
        const users = getUsers();
        if (users.length === 0) {
            users.push(this.DEFAULT_ADMIN);
            saveUsers(users);
        }
    }

    static initializeEventListeners() {
        this.initializeFormListeners();
        this.initializePasswordToggles();
        this.initializeFormSwitchers();
    }

    static initializeFormListeners() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    static initializePasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', () => this.togglePasswordVisibility(button));
        });
    }

    static initializeFormSwitchers() {
        const showSignup = document.getElementById('show-signup');
        const showLogin = document.getElementById('show-login');

        if (showSignup) {
            showSignup.addEventListener('click', (e) => this.switchForm(e, 'signup'));
        }
        if (showLogin) {
            showLogin.addEventListener('click', (e) => this.switchForm(e, 'login'));
        }
    }

    // Form Handling
    static async handleLogin(e) {
        e.preventDefault();
        const psId = document.getElementById('login-psid').value;
        const password = document.getElementById('login-password').value;

        const success = await this.login(psId, password);
        if (!success) {
            document.getElementById('login-password').value = '';
        }
    }

    static async handleSignup(e) {
        e.preventDefault();
        const formData = {
            psId: document.getElementById('ps-id').value,
            name: document.getElementById('name').value,
            email: document.getElementById('signup-email').value,
            password: document.getElementById('signup-password').value,
            confirmPassword: document.getElementById('confirm-password').value
        };

        const success = await this.register(formData);
        if (success) {
            this.switchForm(null, 'login');
            document.getElementById('signup-form').reset();
        }
    }

    // Authentication Methods
    static async login(psId, password) {
        const users = getUsers();
        const user = users.find(u => u.psId === psId && u.password === password);
        
        if (!user) {
            await showError('Login Failed', 'Invalid PS ID or password');
            return false;
        }

        user.lastLogin = new Date().toISOString();
        saveUsers(users);

        const { password: _, ...userData } = user;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        window.location.href = 'index.html';
        return true;
    }

    static async register({ psId, name, email, password, confirmPassword }) {
        if (!this.validateRegistration({ psId, name, email, password, confirmPassword })) {
            return false;
        }

        const newUser = {
            psId,
            name,
            email,
            password,
            isAdmin: false,
            lastLogin: null
        };

        const users = getUsers();
        users.push(newUser);
        saveUsers(users);

        await showSuccess('Success', 'Registration successful! Please login.');
        return true;
    }

    // Validation Methods
    static validateRegistration({ psId, name, email, password, confirmPassword }) {
        if (password !== confirmPassword) {
            showError('Registration Failed', 'Passwords do not match');
            return false;
        }

        if (!this.isPasswordStrong(password)) {
            showError('Registration Failed', 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            return false;
        }

        const users = getUsers();
        if (users.some(u => u.psId === psId)) {
            showError('Registration Failed', 'PS ID already exists');
            return false;
        }

        if (users.some(u => u.email === email)) {
            showError('Registration Failed', 'Email already exists');
            return false;
        }

        return true;
    }

    static isPasswordStrong(password) {
        const { minLength, patterns } = this.PASSWORD_REQUIREMENTS;
        return (
            password.length >= minLength &&
            Object.values(patterns).every(pattern => pattern.test(password))
        );
    }

    // UI Helpers
    static togglePasswordVisibility(button) {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
    }

    static switchForm(e, formType) {
        if (e) e.preventDefault();
        
        const loginContainer = document.getElementById('login-form-container');
        const signupContainer = document.getElementById('signup-form-container');
        
        loginContainer.style.display = formType === 'login' ? 'block' : 'none';
        signupContainer.style.display = formType === 'signup' ? 'block' : 'none';
    }
}

export default AuthManager; 