import { getUsers, saveUsers, showError, showSuccess, sanitizeInput, refreshSession, applyTheme } from './utils.js';

class AuthManager {
    // Constants
    static PASSWORD_REQUIREMENTS = {
        minLength: 8,
        maxLength: 128,
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
        password: 'Admin@123', // Changed to meet password requirements
        isAdmin: true,
        lastLogin: null,
        theme: 'light'
    };

    // Initialization
    static initialize() {
        this.initializeDefaultAdmin();
        this.initializeEventListeners();
    }

    static initializeDefaultAdmin() {
        const users = getUsers();
        // Check if admin exists
        const adminExists = users.some(user => user.psId === 'admin');
        if (!adminExists) {
            users.push(this.DEFAULT_ADMIN);
            saveUsers(users);
            console.log('Default admin account created');
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
            this.addInputValidation(loginForm);
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (signupForm) {
            this.addInputValidation(signupForm);
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    static addInputValidation(form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            // Add validation listeners
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    static validateField(input) {
        const formGroup = input.closest('.form-group');
        const helperText = formGroup.querySelector('.helper-text');

        // Clear existing error state
        formGroup.classList.remove('error');
        helperText?.classList.remove('visible');

        // Validate field
        let isValid = true;
        let errorMessage = '';

        if (!input.value) {
            isValid = false;
            errorMessage = `${input.placeholder} is required`;
        } else if (input.type === 'email' && !this.validateEmail(input.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        } else if (input.id === 'signup-password' && !this.validatePassword(input.value)) {
            isValid = false;
            errorMessage = 'Password must meet the requirements';
        }

        // Show error if validation fails
        if (!isValid && helperText) {
            formGroup.classList.add('error');
            helperText.textContent = errorMessage;
            helperText.classList.add('visible');
        }

        return isValid;
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

    static clearAllErrors(form) {
        form.querySelectorAll('.error-message').forEach(errorDiv => {
            errorDiv.classList.remove('active');
        });
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
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
        const form = e.target;
        const psId = document.getElementById('login-psid');
        const password = document.getElementById('login-password');

        // Clear previous errors
        this.clearError(psId);
        this.clearError(password);

        let isValid = true;
        if (!psId.value) {
            this.validateField(psId);
            isValid = false;
        }
        if (!password.value) {
            this.validateField(password);
            isValid = false;
        }

        if (!isValid) return;

        const success = await this.login({ psId: psId.value, password: password.value });
        if (!success) {
            password.value = '';
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
    static async login(credentials) {
        try {
            const { psId, password } = credentials;
            if (!psId || !password) throw new Error('Missing credentials');

            const sanitizedPsId = sanitizeInput(psId);
            const users = getUsers();

            // Find user case-insensitive match for PS ID
            const user = users.find(u =>
                u.psId.toLowerCase() === sanitizedPsId.toLowerCase() &&
                u.password === password
            );

            if (!user) throw new Error('Invalid credentials');

            // Update user's last login
            const userIndex = users.findIndex(u => u.psId.toLowerCase() === sanitizedPsId.toLowerCase());
            users[userIndex].lastLogin = new Date().toISOString();
            users[userIndex].theme = users[userIndex].theme || 'light';

            saveUsers(users);

            // Set session and save user data
            refreshSession();
            const { password: _, ...userData } = users[userIndex];
            localStorage.setItem('userData', JSON.stringify(userData));

            // Apply theme
            applyTheme(userData.theme);

            window.location.href = 'index.html';
            return true;
        } catch (error) {
            console.error('Login error:', error);
            await showError('Login Failed', 'Invalid PS ID or password');
            return false;
        }
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

        if (!this.validatePassword(password)) {
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

    static validatePassword(password) {
        if (!password || typeof password !== 'string') return false;
        if (password.length < this.PASSWORD_REQUIREMENTS.minLength ||
            password.length > this.PASSWORD_REQUIREMENTS.maxLength) return false;

        return Object.values(this.PASSWORD_REQUIREMENTS.patterns)
            .every(pattern => pattern.test(password));
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