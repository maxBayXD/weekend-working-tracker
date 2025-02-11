document.addEventListener('DOMContentLoaded', () => {
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('signup-form-container').style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            psId: document.getElementById('ps-id').value,
            name: document.getElementById('name').value,
            email: document.getElementById('signup-email').value,
            password: document.getElementById('signup-password').value
        };

        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (existingUsers.some(user => user.email === userData.email)) {
            alert('Email already exists!');
            return;
        }

        existingUsers.push(userData);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        localStorage.setItem('userData', JSON.stringify({
            psId: userData.psId,
            name: userData.name,
            email: userData.email
        }));
        window.location.href = 'index.html';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('userData', JSON.stringify({
                psId: user.psId,
                name: user.name,
                email: user.email
            }));
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    });
});
