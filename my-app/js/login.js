/* global showToast, isValidEmail, getUsers, saveCurrentUser */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    console.log('🔐 Login attempt started');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('📧 Email:', email);
    
    // Validation
    if (!email || !password) {
        showToast('Please fill in all fields.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }
    
    console.log('✅ Validation passed, calling API...');
    
    try {
        // Login with new backend API
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        console.log('🎉 Login successful:', response);
        
        // Save current user session with token
        const userWithToken = {
            ...response.user,
            token: response.token
        };
        saveCurrentUser(userWithToken);
        
        console.log('💾 User saved:', userWithToken);
        console.log('🔍 Current URL:', window.location.href);
        
        showToast('Login successful!');
        
        // Redirect based on user role
        const redirectPath = response.user.role === 'admin' ? 'admin-dash.html' : 'user-dash.html';
        console.log('🔄 Redirecting to:', redirectPath);
        
        setTimeout(() => {
            // Check if we're in pages/ directory and adjust path accordingly
            if (window.location.pathname.includes('/pages/')) {
                window.location.href = redirectPath;
            } else {
                window.location.href = `pages/${redirectPath}`;
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        showToast('Invalid credentials. Please try again.', 'error');
    }
}