# Weekend Working Tracker

A web application to track weekend working hours and manage compensation time-off for employees.

## Features

- **User Authentication**: Secure login and registration system
- **Weekend Work Tracking**: Log weekend working days
- **Compensation Management**: Track comp-off earnings and usage
- **Dark Mode Support**: Comfortable viewing experience in low-light conditions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Theme Support

The application supports both light and dark themes:
- **Light Theme**: Default theme optimized for daytime use
- **Dark Theme**: Eye-friendly dark mode for low-light environments
  - Enhanced contrast for better readability
  - Properly visible form controls and icons in dark mode
  - Consistent styling across all components

## Recent Updates

### Version 1.1.0
- Added dark mode support with proper icon visibility
- Fixed calendar and dropdown icons in dark theme
- Improved form control contrast in dark mode
- Enhanced overall accessibility

### Version 1.0.0
- Initial release with basic weekend tracking functionality
- User authentication system
- Responsive design implementation

## Installation

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run the application

## Usage

1. Register or login to your account
2. Navigate to the weekend tracker
3. Add new weekend working entries
4. Manage your compensation time-off
5. Toggle between light and dark themes as needed

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

## Development

### Prerequisites
- Modern web browser
- Basic understanding of HTML, CSS, and JavaScript

### Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
