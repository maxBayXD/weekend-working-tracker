# Weekend Working Tracker

A web application to track and manage weekend working hours for employees.

## Features

- **User Authentication**
  - Secure login and registration system
  - Password strength validation
  - Password visibility toggle
  - Session management

- **User Management**
  - Admin dashboard for user management
  - Create, update, and delete users
  - Role-based access control (Admin/User)

- **Settings Management**
  - Dark/Light theme toggle
  - Password change functionality
  - User profile information display
  - Last login tracking

- **UI/UX Features**
  - Responsive design for all devices
  - Modern and clean interface
  - Custom alert modals
  - Expandable sections
  - Password visibility toggles
  - Form validation

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (can use VS Code Live Server or any HTTP server)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/weekend-working-tracker.git
cd weekend-working-tracker
```

2. Open the project in your preferred code editor

3. Start a local web server in the project directory
   - Using VS Code: Install "Live Server" extension and click "Go Live"
   - Using Python: `python -m http.server 8000`
   - Using Node.js: `npx http-server`

4. Access the application in your browser at `http://localhost:8000` (or the port your server is using)

### Default Admin Credentials
- PS ID: admin
- Password: admin123

## Project Structure

```
weekend-working-tracker/
├── css/
│   └── styles.css
├── js/
│   ├── auth.js
│   ├── settings.js
│   ├── user-management.js
│   └── utils.js
├── index.html
├── authentication.html
├── settings.html
└── README.md
```

## Features in Detail

### Authentication
- User registration with email verification
- Secure password requirements
- Session-based authentication
- Remember me functionality

### User Management
- Admin dashboard for user overview
- Add new users
- Edit user details
- Delete users
- Role assignment (Admin/User)

### Settings
- Theme customization (Dark/Light mode)
- Password management
- Profile information display
- Session management

## Security Features

- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Form validation
- Session management
- Role-based access control

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for icons
- Modern CSS features
- LocalStorage for client-side data persistence
