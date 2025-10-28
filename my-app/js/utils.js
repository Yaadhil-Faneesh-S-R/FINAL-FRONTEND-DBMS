/* eslint-disable no-unused-vars */
/* global bootstrap */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Check if we're running from file:// protocol and show warning
if (window.location.protocol === 'file:') {
    console.warn('⚠️ Running from file:// protocol. API calls may fail due to CORS restrictions.');
    console.warn('💡 For best results, use: npm start (then open http://localhost:3000)');
}

// API Call helper function
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getCurrentUser()?.token;
    
    // Check if we should use mock API
    const useMockAPI = window.location.protocol === 'file:' || 
                      localStorage.getItem('useMockAPI') === 'true' ||
                      !navigator.onLine;
    
    if (useMockAPI) {
        console.log('🔄 Using Mock API for:', endpoint);
        return await mockAPICall(endpoint, options);
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API call failed, falling back to mock API:', error);
        return await mockAPICall(endpoint, options);
    }
}

// Mock API implementation
async function mockAPICall(endpoint, options = {}) {
    console.log('🔄 Mock API called for:', endpoint, 'with options:', options);
    
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        const body = options.body ? JSON.parse(options.body) : {};
        console.log('📦 Parsed body:', body);
        
        switch (endpoint) {
            case '/auth/create-user':
                return await mockAPI.createUser(body);
                
            case '/auth/login':
                return await mockAPI.login(body);
                
            case '/vehicles/register':
                return await mockAPI.registerVehicle(body, userId);
                
            case '/vehicles':
                return await mockAPI.getVehicles();
                
            case '/slots':
                if (options.method === 'POST') {
                    return await mockAPI.addSlot(body);
                }
                return await mockAPI.getSlots();
                
            case '/bookings':
                if (options.method === 'POST') {
                    return await mockAPI.bookSlot(body, userId);
                }
                break;
                
            case '/bookings/me':
                return await mockAPI.getMyBookings(userId);
                
            case '/admin/catalog':
                return await mockAPI.getCatalog();
                
            default:
                if (endpoint.startsWith('/slots/') && options.method === 'DELETE') {
                    const slotId = endpoint.split('/')[2];
                    return await mockAPI.deleteSlot(slotId);
                }
                if (endpoint.includes('/cancel') && options.method === 'PUT') {
                    const bookingId = endpoint.split('/')[2];
                    return await mockAPI.cancelBooking(bookingId, userId);
                }
                throw new Error('Mock API endpoint not implemented: ' + endpoint);
        }
    } catch (error) {
        console.error('Mock API error:', error);
        throw error;
    }
}

// Local Storage helpers
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Get users from storage
function getUsers() {
    return getFromStorage('users') || [];
}

// Save users to storage
function saveUsers(users) {
    saveToStorage('users', users);
}

// Get parking slots from storage
function getParkingSlots() {
    return getFromStorage('parkingSlots') || [];
}

// Save parking slots to storage
function saveParkingSlots(slots) {
    saveToStorage('parkingSlots', slots);
}

// Get bookings from storage
function getBookings() {
    return getFromStorage('bookings') || [];
}

// Save bookings to storage
function saveBookings(bookings) {
    saveToStorage('bookings', bookings);
}

// Get current user from storage
function getCurrentUser() {
    return getFromStorage('currentUser');
}

// Save current user to storage
function saveCurrentUser(user) {
    saveToStorage('currentUser', user);
}

// Clear current user from storage
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// Generate unique ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Calculate hours between two dates
function calculateHours(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    return Math.ceil(diffMs / (1000 * 60 * 60)); // Round up to nearest hour
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary';
    
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Check if user is authenticated
function checkAuth(requiredType = null) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Check if we're in pages/ directory and adjust path accordingly
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
        return false;
    }
    
    if (requiredType && currentUser.role !== requiredType) {
        showToast('Access denied. Insufficient permissions.', 'error');
        // Check if we're in pages/ directory and adjust path accordingly
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
        return false;
    }
    
    return currentUser;
}

// Logout function
function logout() {
    clearCurrentUser();
    showToast('Logged out successfully');
    setTimeout(() => {
        // Check if we're in a subdirectory (pages/) and adjust path accordingly
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
    return password.length >= 6;
}

// Check if email already exists
function emailExists(email, excludeId = null) {
    const users = getUsers();
    return users.some(user => user.email === email && user.id !== excludeId);
}

// Format currency
function formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
}

// Get status badge HTML
function getStatusBadge(status) {
    let badgeClass = '';
    switch (status) {
        case 'available':
            badgeClass = 'bg-success';
            break;
        case 'occupied':
            badgeClass = 'bg-danger';
            break;
        case 'reserved':
            badgeClass = 'bg-warning';
            break;
        default:
            badgeClass = 'bg-secondary';
    }
    return `<span class="badge ${badgeClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Initialize page with fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('fade-in-up');
});

// Form validation helper
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Add input event listeners to remove validation classes
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('is-invalid')) {
            e.target.classList.remove('is-invalid');
        }
    });
});