/* global showToast, isValidEmail, isValidPassword, emailExists, generateId, getUsers, saveUsers */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user or admin registration form exists
    const userForm = document.getElementById('userRegisterForm');
    const adminForm = document.getElementById('adminRegisterForm');
    
    if (userForm) {
        userForm.addEventListener('submit', handleUserRegistration);
    }
    
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminRegistration);
    }
});

async function handleUserRegistration(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        plateNumber: document.getElementById('plateNumber').value.trim(),
        vehicleType: document.getElementById('vehicleType').value,
        vehicleColor: document.getElementById('vehicleColor').value
    };
    
    // Validation
    if (!validateUserForm(formData)) {
        return;
    }
    
    try {
        // Register user with API
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                plateNumber: formData.plateNumber,
                vehicleType: formData.vehicleType,
                vehicleColor: formData.vehicleColor
            })
        });
        
        showToast('User account created successfully!');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
    } catch (error) {
        showToast(error.message || 'Registration failed. Please try again.', 'error');
    }
}

async function handleAdminRegistration(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Validation
    if (!validateAdminForm(formData)) {
        return;
    }
    
    try {
        // Register admin with API
        const response = await apiCall('/auth/register-admin', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password
            })
        });
        
        showToast('Admin account created successfully!');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
    } catch (error) {
        showToast(error.message || 'Registration failed. Please try again.', 'error');
    }
}

function validateUserForm(data) {
    // Check required fields
    if (!data.name || !data.email || !data.password || !data.confirmPassword || 
        !data.plateNumber || !data.vehicleType || !data.vehicleColor) {
        showToast('Please fill in all required fields.', 'error');
        return false;
    }
    
    // Validate email
    if (!isValidEmail(data.email)) {
        showToast('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Validate password
    if (!isValidPassword(data.password)) {
        showToast('Password must be at least 6 characters long.', 'error');
        return false;
    }
    
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return false;
    }
    
    return true;
}

function validateAdminForm(data) {
    // Check required fields
    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
        showToast('Please fill in all required fields.', 'error');
        return false;
    }
    
    // Validate email
    if (!isValidEmail(data.email)) {
        showToast('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Validate password
    if (!isValidPassword(data.password)) {
        showToast('Password must be at least 6 characters long.', 'error');
        return false;
    }
    
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return false;
    }
    
    return true;
}