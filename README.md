# Weekend Working Tracker

A web-based application to track weekend working hours, comp-offs, and expense claims.

## Features

- **User Authentication**
  - Login/Signup functionality
  - Role-based access (Admin/User)
  - Password security with requirements
  - Session management

- **Admin Dashboard**
  - User management (Add/Edit/Delete)
  - View all users
  - Manage user roles
  - Default admin account (psId: admin, password: Admin@123)

- **User Dashboard**
  - Track weekend working details
  - Record comp-off status
  - Manage expense claims
  - View history in tabular format

- **Settings**
  - Theme toggle (Light/Dark mode)
  - Password change functionality
  - View profile information

## Technical Stack

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- LocalStorage for data persistence
- Font Awesome for icons

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Login with default admin credentials:
   - PS ID: `admin`
   - Password: `Admin@123`

## Usage

### Admin Users

1. Login with admin credentials
2. Manage users through the admin dashboard
3. Add new users with the "Add User" button
4. Edit or delete existing users

### Regular Users

1. Login with your credentials
2. Click "Add Weekend Entry" to record new weekend work
3. Fill in the required details:
   - Weekend Date
   - Comp Off Earned (Yes/No)
   - Comp Off Availed Date (if applicable)
   - Expense Claimed (Yes/No/Pending)
4. View your entries in the table below

## Project Structure

```
weekend-working-tracker/
├── css/
│   └── styles.css
├── js/
│   ├── auth.js
│   ├── index.js
│   ├── settings.js
│   ├── user-management.js
│   ├── utils.js
│   └── weekend-tracker.js
├── index.html
├── authentication.html
├── settings.html
└── README.md
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Features

- Password hashing simulation
- Session management
- Input sanitization
- Form validation
- Role-based access control

## Local Storage Schema

```javascript
{
  users: [
    {
      psId: string,
      name: string,
      email: string,
      password: string,
      isAdmin: boolean,
      lastLogin: string,
      theme: string
    }
  ],
  weekendEntries: [
    {
      userId: string,
      weekendDate: string,
      compOffEarned: string,
      compOffDate: string,
      expenseClaimed: string,
      createdAt: string
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning purposes.
