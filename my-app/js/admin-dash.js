/* global checkAuth, generateId, getParkingSlots, saveParkingSlots, showToast, bootstrap, getStatusBadge, formatCurrency */

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const currentUser = checkAuth('admin');
    if (!currentUser) return;
    
    // Initialize dashboard
    initializeDashboard(currentUser);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load data
    await loadSlots();
    await loadCatalog();
    await updateStats();
});

function initializeDashboard(user) {
    document.getElementById('adminName').textContent = user.name;
}

function setupEventListeners() {
    const addSlotForm = document.getElementById('addSlotForm');
    if (addSlotForm) {
        addSlotForm.addEventListener('submit', handleAddSlot);
    }
    
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', handleCreateUser);
    }
}

async function handleAddSlot(e) {
    e.preventDefault();
    
    const formData = {
        slotNumber: document.getElementById('slotName').value.trim(),
        location: document.getElementById('slotLocation').value.trim(),
        vehicleType: document.getElementById('vehicleType').value,
        pricePerHour: parseFloat(document.getElementById('pricePerHour').value),
        status: document.getElementById('slotStatus').value
    };
    
    // Validation
    if (!validateSlotForm(formData)) {
        return;
    }
    
    try {
        // Add slot via API
        await apiCall('/slots', {
            method: 'POST',
            body: JSON.stringify({
                label: formData.slotNumber,
                lotName: formData.location,
                level: 0,
                hourlyRate: formData.pricePerHour
            })
        });
        
        showToast('Parking slot added successfully!');
        
        // Reset form and close modal
        document.getElementById('addSlotForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSlotModal'));
        modal.hide();
        
        // Reload data
        await loadSlots();
        await updateStats();
        
    } catch (error) {
        showToast(error.message || 'Failed to add parking slot. Please try again.', 'error');
    }
}

async function handleCreateUser(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        contact: document.getElementById('userContact').value,
        role: document.getElementById('userRole').value
    };
    
    try {
        await apiCall('/auth/create-user', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showToast('User created successfully!');
        
        // Reset form and close modal
        document.getElementById('createUserForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
        modal.hide();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showToast('Failed to create user. Please try again.', 'error');
    }
}

async function loadCatalog() {
    const container = document.getElementById('catalogContainer');
    
    try {
        const response = await apiCall('/admin/catalog');
        const catalog = response.catalog || [];
        
        if (catalog.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-list fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted mb-3">No bookings found</h6>
                    <p class="text-muted small">Bookings will appear here once users start booking slots</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = catalog.map(booking => {
            const startTime = new Date(booking.startTime).toLocaleString();
            const endTime = booking.endTime ? new Date(booking.endTime).toLocaleString() : 'Ongoing';
            const statusBadge = getStatusBadge(booking.paymentStatus);
            
            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <h6 class="mb-1">${booking.User.name}</h6>
                                <small class="text-muted">${booking.User.email}</small>
                                <br><small class="text-muted">${booking.User.contact || 'No contact'}</small>
                            </div>
                            <div class="col-md-2">
                                <h6 class="mb-1">${booking.Vehicle.plateNo}</h6>
                                <small class="text-muted">${booking.Vehicle.type}</small>
                                <br><small class="text-muted">${booking.Vehicle.color || 'Unknown'}</small>
                            </div>
                            <div class="col-md-2">
                                <h6 class="mb-1">Slot ${booking.Slot.label}</h6>
                                <small class="text-muted">${booking.Slot.lotName}</small>
                                <br><small class="text-muted">Level ${booking.Slot.level}</small>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted">Start: ${startTime}</small>
                                <br><small class="text-muted">End: ${endTime}</small>
                            </div>
                            <div class="col-md-2 text-end">
                                ${statusBadge}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading catalog:', error);
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h6 class="text-danger mb-3">Failed to load catalog</h6>
                <p class="text-muted small">Please try refreshing the page</p>
            </div>
        `;
    }
}

async function loadSlots() {
    const container = document.getElementById('slotsContainer');
    const noSlotsMessage = document.getElementById('noSlotsMessage');
    
    try {
        // Fetch slots from API
        const response = await apiCall('/slots');
        const slots = response.slots || response;
        
        if (slots.length === 0) {
            container.innerHTML = '';
            noSlotsMessage.style.display = 'block';
            return;
        }
        
        noSlotsMessage.style.display = 'none';
        container.innerHTML = slots.map(slot => createSlotCard({
            id: slot.id,
            name: slot.label,
            location: slot.lotName,
            vehicleType: slot.type || 'Car',
            pricePerHour: slot.hourlyRate,
            status: slot.status === 'Available' ? 'available' : 
                   slot.status === 'Occupied' ? 'occupied' : 'reserved'
        })).join('');
        
    } catch (error) {
        console.error('Error loading slots:', error);
        container.innerHTML = '';
        noSlotsMessage.style.display = 'block';
    }
}

function createSlotCard(slot) {
    const statusClass = slot.status === 'available' ? 'available' : 
                       slot.status === 'occupied' ? 'occupied' : 'reserved';
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card slot-card ${statusClass}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title mb-1">${slot.name}</h5>
                            <p class="text-muted small mb-0">${slot.location}</p>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSlot('${slot.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="row g-2 small">
                        <div class="col-6">
                            <strong>Status:</strong>
                        </div>
                        <div class="col-6">
                            ${getStatusBadge(slot.status)}
                        </div>
                        <div class="col-6">
                            <strong>Vehicle Type:</strong>
                        </div>
                        <div class="col-6">
                            ${slot.vehicleType}
                        </div>
                        <div class="col-6">
                            <strong>Price/Hour:</strong>
                        </div>
                        <div class="col-6">
                            ${formatCurrency(slot.pricePerHour)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Global function for onclick handler in HTML
window.deleteSlot = async function(slotId) {
    if (!confirm('Are you sure you want to delete this parking slot?')) {
        return;
    }
    
    try {
        // Delete slot via API
        await apiCall(`/slots/${slotId}`, {
            method: 'DELETE'
        });
        
        showToast('Parking slot deleted successfully!');
        
        await loadSlots();
        await updateStats();
        
    } catch (error) {
        showToast(error.message || 'Failed to delete parking slot. Please try again.', 'error');
    }
}

async function updateStats() {
    try {
        // Fetch slots from API
        const response = await apiCall('/slots');
        const slots = response.slots || response;
        
        const totalSlots = slots.length;
        const availableSlots = slots.filter(slot => slot.status === 'Available').length;
        const occupiedSlots = slots.filter(slot => slot.status === 'Occupied').length;
        const reservedSlots = slots.filter(slot => slot.status === 'Reserved').length;
        
        document.getElementById('totalSlots').textContent = totalSlots;
        document.getElementById('availableSlots').textContent = availableSlots;
        document.getElementById('occupiedSlots').textContent = occupiedSlots;
        document.getElementById('reservedSlots').textContent = reservedSlots;
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function validateSlotForm(data) {
    if (!data.slotNumber || !data.location || !data.vehicleType || !data.pricePerHour || !data.status) {
        showToast('Please fill in all required fields.', 'error');
        return false;
    }
    
    if (data.pricePerHour <= 0) {
        showToast('Price per hour must be greater than 0.', 'error');
        return false;
    }
    
    return true;
}