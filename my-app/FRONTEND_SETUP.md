# Frontend Setup Instructions

This frontend has been updated to work with the new Backend_alpha API.

## Prerequisites

1. **Backend Setup**: Make sure the Backend_alpha is running on port 5000
2. **Node.js**: Ensure Node.js is installed on your system

## Quick Start

### Option 1: Using the Local Server (Recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the frontend server:
   ```bash
   npm start
   # or
   npm run serve
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Using Vite Development Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite dev server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Backend Integration

The frontend is configured to connect to the Backend_alpha API running on `http://localhost:5000`. 

### API Endpoints Used:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/slots` - Get parking slots
- `POST /api/slots` - Create parking slot (admin only)
- `DELETE /api/slots/:id` - Delete parking slot (admin only)
- `POST /api/vehicles/register` - Register vehicle
- `GET /api/vehicles` - Get vehicles
- `POST /api/bookings` - Create booking
- `GET /api/bookings/me` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

## Features

### User Features:
- User registration and login
- Vehicle registration
- View available parking slots
- Book parking slots
- View current bookings
- Cancel bookings

### Admin Features:
- Admin registration and login
- Create parking slots
- Delete parking slots
- View slot statistics
- Manage all slots

## Troubleshooting

1. **CORS Issues**: The backend should have CORS enabled. If you encounter CORS errors, check the Backend_alpha server configuration.

2. **API Connection Issues**: Ensure the Backend_alpha is running on port 5000. You can change the API URL in `js/utils.js` if needed.

3. **Authentication Issues**: Make sure to register users first before trying to log in.

## File Structure

```
my-app/
├── js/
│   ├── utils.js          # API utilities and helper functions
│   ├── login.js          # Login functionality
│   ├── register.js       # Registration functionality
│   ├── user-dash.js      # User dashboard
│   └── admin-dash.js     # Admin dashboard
├── pages/
│   ├── login.html
│   ├── user-reg.html
│   ├── admin-reg.html
│   ├── user-dash.html
│   └── admin-dash.html
├── server.js             # Local development server
└── package.json
```

## Notes

- The frontend uses JWT tokens for authentication
- All API calls include proper error handling
- The UI is responsive and uses Bootstrap for styling
- QR code generation is available for user profiles


