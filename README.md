# Weekend Working Tracker

A web-based application to track weekend work, comp-offs, and expense claims.

## Features

- User authentication with role-based access (Admin/User)
- Dashboard for tracking weekend work entries
- Admin panel for user management
- Theme customization (Light/Dark mode)
- Responsive design for mobile and desktop
- Password management with security requirements
- Session management and auto-logout

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Login with default admin credentials:
   - PS ID: admin
   - Password: Admin@123

## Project Structure

```
weekend-working-tracker/
├── css/
│   └── styles.css           # Main stylesheet
├── js/
│   ├── auth.js             # Authentication logic
│   ├── settings.js         # Settings management
│   ├── user-management.js  # User administration
│   ├── utils.js           # Utility functions
│   └── weekend-tracker.js  # Weekend entries logic
├── index.html             # Main dashboard
├── settings.html         # User settings page
└── authentication.html   # Login/Register page
```

## User Guide

### For Users
- Login with your PS ID and password
- Add weekend work entries with dates
- Track comp-off status and expense claims
- Change password and theme preferences

### For Admins
- Manage user accounts
- View all user entries
- Add/Edit/Delete users
- Grant admin privileges

## Form Validations

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Field Validations
- Email format validation
- Required field checks
- PS ID uniqueness check
- Password confirmation match

## UI Components

### Custom Elements
- Modals with animations
- Custom checkboxes
- Password visibility toggle
- Theme switcher
- Expandable sections
- Helper text with error states

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile
- Flexible grid layouts
- Adaptive form layouts

## Development Notes

### CSS Variables
Theme colors and common values are defined as CSS variables for easy customization:
```css
:root {
  --primary-color: #1a73e8;
  --secondary-color: #ffd700;
  --text-dark: #2c3e50;
  /* ... other variables */
}
```

### JavaScript Modules
- Uses ES6 modules for better code organization
- Class-based architecture
- Utility functions for common operations
- Event-driven UI updates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - Feel free to use and modify for your needs.
