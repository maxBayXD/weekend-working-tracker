import { isAuthenticated, getCurrentUser, isAdmin, applyTheme, getCurrentTheme } from './utils.js';
import UserManager from './user-management.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'authentication.html';
        return;
    }

    // Apply saved theme
    applyTheme(getCurrentTheme());

    // Show admin or user dashboard based on user role
    const user = getCurrentUser();
    const adminDashboard = document.getElementById('admin-dashboard');
    const userDashboard = document.getElementById('user-dashboard');

    if (user.isAdmin) {
        adminDashboard.style.display = 'block';
        userDashboard.style.display = 'none';
        UserManager.initialize();
    } else {
        adminDashboard.style.display = 'none';
        userDashboard.style.display = 'block';
    }

    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
});
