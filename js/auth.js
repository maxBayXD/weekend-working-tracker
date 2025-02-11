import { getUsers, saveUsers, showError, showSuccess } from './utils.js';

class AuthManager {
    static initialize() {
        // Create default admin user if no users exist
        const users = getUsers();
        if (users.length === 0) {
            const defaultAdmin = {
                psId: 'admin',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123', // In a real app, this should be hashed
                isAdmin: true,
                lastLogin: null
            };
            users.push(defaultAdmin);
            saveUsers(users);
        }

        // Setup event listeners
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const showSignup = document.getElementById('show-signup');
        const showLogin = document.getElementById('show-login');

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

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => AuthManager.handleLogin(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => AuthManager.handleSignup(e));
        }
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('login-form-container').style.display = 'none';
                document.getElementById('signup-form-container').style.display = 'block';
            });
        }
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('signup-form-container').style.display = 'none';
                document.getElementById('login-form-container').style.display = 'block';
            });
        }
    }

    static async login(psId, password) {
        const users = getUsers();
        const user = users.find(u => u.psId === psId && u.password === password);
        
        if (!user) {
            await showError('Login Failed', 'Invalid PS ID or password');
            return false;
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        saveUsers(users);

        // Store user data in localStorage (excluding password)
        const { password: _, ...userData } = user;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect immediately after successful login
        window.location.href = 'index.html';
        return true;
    }

    static async register(psId, name, email, password, confirmPassword) {
        if (password !== confirmPassword) {
            await showError('Registration Failed', 'Passwords do not match');
            return false;
        }

        // Validate password strength
        if (!AuthManager.isPasswordStrong(password)) {
            await showError('Registration Failed', 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            return false;
        }

        const users = getUsers();
        
        // Check if user already exists
        if (users.some(u => u.psId === psId)) {
            await showError('Registration Failed', 'PS ID already exists');
            return false;
        }

        if (users.some(u => u.email === email)) {
            await showError('Registration Failed', 'Email already exists');
            return false;
        }

        // Create new user
        const newUser = {
            psId,
            name,
            email,
            password,
            isAdmin: false,
            lastLogin: null
        };

        users.push(newUser);
        saveUsers(users);

        await showSuccess('Success', 'Registration successful! Please login.');
        return true;
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

    static handleLogin(e) {
        e.preventDefault();
        const psId = document.getElementById('login-psid').value;
        const password = document.getElementById('login-password').value;

        // Call login without then/catch since we handle redirect in login method
        AuthManager.login(psId, password);
    }

    static handleSignup(e) {
        e.preventDefault();
        const psId = document.getElementById('ps-id').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        AuthManager.register(psId, name, email, password, confirmPassword)
            .then(success => {
                if (success) {
                    // Show success message and redirect to login form
                    document.getElementById('signup-form-container').style.display = 'none';
                    document.getElementById('login-form-container').style.display = 'block';
                    document.getElementById('signup-form').reset();
                }
            });
    }
}

export default AuthManager; 