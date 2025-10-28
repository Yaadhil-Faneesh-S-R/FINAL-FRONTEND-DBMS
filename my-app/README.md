# Smart Parking Management System - Frontend

This is the updated frontend for the Smart Parking Management System that works with the new backend API.

## Changes Made

The frontend has been updated to work with the new backend API endpoints while maintaining the same look and functionality:

### Key Updates:
1. **API Integration**: All data operations now use API calls instead of localStorage
2. **Authentication**: Login and registration now work with the backend authentication system
3. **Vehicle Management**: Vehicle CRUD operations use the `/vehicles` API endpoints
4. **Parking Slot Management**: Admin can manage parking slots via `/parking-slots` API
5. **Booking System**: Slot booking and cancellation use the `/bookings` API endpoints

### Files Modified:
- `js/utils.js` - Added API helper functions and updated data management
- `js/login.js` - Updated to use API authentication
- `js/register.js` - Updated to use API registration
- `js/user-dash.js` - Updated all functions to use API calls
- `js/admin-dash.js` - Updated all functions to use API calls

## How to Run

1. **Start the Backend**: Make sure your backend server is running on `http://localhost:5000`
2. **Start the Frontend**: 
   ```bash
   cd my-app
   npm run dev
   ```
3. **Access the Application**: Open `http://localhost:5173` in your browser

## API Endpoints Used

The frontend now communicates with these backend endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/register-admin` - Admin registration  
- `POST /api/auth/login` - User login
- `POST /api/auth/login-admin` - Admin login
- `GET /api/vehicles/:userId` - Get user vehicles
- `POST /api/vehicles` - Add vehicle
- `DELETE /api/vehicles/:vehicleId` - Delete vehicle
- `GET /api/parking-slots` - Get parking slots
- `POST /api/parking-slots` - Add parking slot
- `DELETE /api/parking-slots/:slotId` - Delete parking slot
- `POST /api/bookings` - Book slot
- `POST /api/bookings/:transactionId/cancel` - Cancel booking
- `GET /api/bookings/user/:userId` - Get user bookings

## Features

- **User Dashboard**: View vehicles, book parking slots, manage bookings
- **Admin Dashboard**: Manage parking slots, view statistics
- **Authentication**: Secure login/registration for users and admins
- **Real-time Updates**: All data is fetched from the backend API
- **Error Handling**: Proper error messages for API failures

The frontend maintains the same beautiful UI and user experience while now being fully integrated with the backend database and API.