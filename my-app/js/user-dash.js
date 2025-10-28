/* global checkAuth, getCurrentUser, getUsers, saveUsers, saveCurrentUser, generateId, showToast, bootstrap, getBookings, saveBookings, getStatusBadge, formatCurrency, calculateHours, formatDate */

let currentBooking = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const currentUser = checkAuth('user');
    if (!currentUser) return;
    
    // Initialize dashboard
    initializeDashboard(currentUser);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load data
    await loadUserVehicles();
    await loadAvailableSlots();
    await loadCurrentBooking();
});

function initializeDashboard(user) {
    document.getElementById('userName').textContent = user.name;
}

function setupEventListeners() {
    const addVehicleForm = document.getElementById('addVehicleForm');
    const bookSlotForm = document.getElementById('bookSlotForm');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    
    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', handleAddVehicle);
    }
    
    if (bookSlotForm) {
        bookSlotForm.addEventListener('submit', handleBookSlot);
    }
    
    if (startTimeInput && endTimeInput) {
        startTimeInput.addEventListener('change', updateBookingSummary);
        endTimeInput.addEventListener('change', updateBookingSummary);
    }
}

async function handleAddVehicle(e) {
    e.preventDefault();
    
    const formData = {
        plateNumber: document.getElementById('plateNumber').value.trim(),
        vehicleType: document.getElementById('vehicleType').value,
        vehicleColor: document.getElementById('vehicleColor').value
    };
    
    // Validation
    if (!validateVehicleForm(formData)) {
        return;
    }
    
    const currentUser = getCurrentUser();
    
    try {
        // Add vehicle via API
        await apiCall('/vehicles/register', {
            method: 'POST',
            body: JSON.stringify({
                plateNo: formData.plateNumber,
                type: formData.vehicleType,
                color: formData.vehicleColor
            })
        });
        
        showToast('Vehicle added successfully!');
        
        // Reset form and close modal
        document.getElementById('addVehicleForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addVehicleModal'));
        modal.hide();
        
        // Reload vehicles
        await loadUserVehicles();
        
    } catch (error) {
        showToast(error.message || 'Failed to add vehicle. Please try again.', 'error');
    }
}

async function loadUserVehicles() {
    const currentUser = getCurrentUser();
    const container = document.getElementById('vehiclesContainer');
    
    try {
        // Fetch vehicles from API
        const response = await apiCall('/vehicles');
        const vehicles = response.filter(vehicle => vehicle.userId === currentUser.id).map(vehicle => ({
            _id: vehicle.id,
            plateNumber: vehicle.plateNo,
            type: vehicle.type,
            colour: vehicle.color || 'Unknown',
            status: 'available'
        }));
        
        if (!vehicles || vehicles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-car fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted mb-3">No vehicles added yet</h6>
                    <p class="text-muted small mb-3">Add your vehicles to start booking parking slots</p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addVehicleModal">
                        <i class="fas fa-plus me-2"></i>Add Your First Vehicle
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle)).join('') + 
            `
            <div class="text-center mt-3">
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#addVehicleModal">
                    <i class="fas fa-plus me-2"></i>Add Another Vehicle
                </button>
            </div>
            `;
        
        // Update vehicle select in booking modal
        updateVehicleSelect(vehicles);
        
    } catch (error) {
        console.error('Error loading vehicles:', error);
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                <h6 class="text-muted mb-3">Error loading vehicles</h6>
                <p class="text-muted small mb-3">Please try again later</p>
            </div>
        `;
    }
}

function createVehicleCard(vehicle) {
    return `
        <div class="card mb-3 vehicle-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <i class="fas fa-car text-primary me-2"></i>
                            <h6 class="card-title mb-0">${vehicle.plateNumber}</h6>
                        </div>
                        <div class="row g-2 small">
                            <div class="col-6">
                                <strong>Type:</strong> ${vehicle.type}
                            </div>
                            <div class="col-6">
                                <strong>Color:</strong> ${vehicle.colour}
                            </div>
                            <div class="col-12">
                                <strong>Status:</strong> ${getStatusBadge(vehicle.status)}
                            </div>
                        </div>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteVehicle('${vehicle._id}')" title="Delete Vehicle">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Global function for onclick handler in HTML
window.deleteVehicle = async function(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }
    
    try {
        // Delete vehicle via API
        await apiCall(`/vehicles/${vehicleId}`, {
            method: 'DELETE'
        });
        
        showToast('Vehicle deleted successfully!');
        await loadUserVehicles();
        
    } catch (error) {
        showToast(error.message || 'Failed to delete vehicle. Please try again.', 'error');
    }
}

async function loadAvailableSlots() {
    const container = document.getElementById('availableSlotsContainer');
    const noSlotsMessage = document.getElementById('noSlotsAvailable');
    
    try {
        const response = await apiCall('/slots');
        const slots = response.slots || response;
        const availableSlots = slots.filter(slot => slot.status === 'Available');
        
        if (availableSlots.length === 0) {
            container.innerHTML = '';
            noSlotsMessage.style.display = 'block';
            return;
        }
        
        noSlotsMessage.style.display = 'none';
        container.innerHTML = availableSlots.map(slot => createAvailableSlotCard(slot)).join('');
        
    } catch (error) {
        console.error('Error loading slots:', error);
        container.innerHTML = '';
        noSlotsMessage.style.display = 'block';
    }
}

function createAvailableSlotCard(slot) {
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card slot-card available">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title mb-1">${slot.label}</h5>
                            <p class="text-muted small mb-0">${slot.lotName}</p>
                        </div>
                        ${getStatusBadge(slot.status)}
                    </div>
                    
                    <div class="row g-2 small mb-3">
                        <div class="col-6">
                            <strong>Level:</strong>
                        </div>
                        <div class="col-6">
                            ${slot.level}
                        </div>
                        <div class="col-6">
                            <strong>Price/Hour:</strong>
                        </div>
                        <div class="col-6">
                            $${slot.hourlyRate}
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-100" onclick="openBookingModal('${slot.id}')">
                        <i class="fas fa-calendar-plus me-2"></i>Book Slot
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Global function for onclick handler in HTML
window.openBookingModal = async function(slotId) {
    try {
        const response = await apiCall('/slots');
        const slots = response.slots || response;
        const slot = slots.find(s => s.id === parseInt(slotId));
    
    if (!slot) {
        showToast('Slot not found.', 'error');
        return;
    }
    
    // Set slot info
    document.getElementById('selectedSlotId').value = slotId;
    document.getElementById('selectedSlotInfo').innerHTML = `
        <strong>${slot.label}</strong> - ${slot.lotName}<br>
        <small>Level ${slot.level} | $${slot.hourlyRate}/hour</small>
    `;
    
    // Set default times (current time + 1 hour)
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour from start
    
    document.getElementById('startTime').value = startTime.toISOString().slice(0, 16);
    document.getElementById('endTime').value = endTime.toISOString().slice(0, 16);
    
    updateBookingSummary();
    
    const modal = new bootstrap.Modal(document.getElementById('bookSlotModal'));
    modal.show();
    
    } catch (error) {
        console.error('Error opening booking modal:', error);
        showToast('Failed to load slot information', 'error');
    }
}

function updateVehicleSelect(vehicles = null) {
    const select = document.getElementById('selectedVehicle');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Choose your vehicle</option>';
    
    if (vehicles) {
        vehicles.forEach(vehicle => {
            if (vehicle.status === 'available') {
                select.innerHTML += `<option value="${vehicle._id}">${vehicle.plateNumber} (${vehicle.type})</option>`;
            }
        });
    }
}

async function updateBookingSummary() {
    const slotId = document.getElementById('selectedSlotId').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const summaryDiv = document.getElementById('bookingSummary');
    
    if (!slotId || !startTime || !endTime) {
        summaryDiv.innerHTML = '<p class="text-muted">Please fill in all details</p>';
        return;
    }
    
    try {
        const response = await apiCall('/slots');
        const slots = response.slots || response;
        const slot = slots.find(s => s.id === parseInt(slotId));
        
        if (!slot) {
            summaryDiv.innerHTML = '<p class="text-danger">Slot not found</p>';
            return;
        }
        
        const hours = calculateHours(startTime, endTime);
        const totalAmount = hours * slot.hourlyRate;
    
    if (hours <= 0) {
        summaryDiv.innerHTML = '<p class="text-danger">End time must be after start time</p>';
        return;
    }
    
    summaryDiv.innerHTML = `
        <div class="row">
            <div class="col-6">Duration:</div>
            <div class="col-6">${hours} hour(s)</div>
            <div class="col-6">Rate:</div>
            <div class="col-6">$${slot.hourlyRate}/hour</div>
            <div class="col-6"><strong>Total:</strong></div>
            <div class="col-6"><strong>$${totalAmount}</strong></div>
        </div>
    `;
    
    } catch (error) {
        console.error('Error updating booking summary:', error);
        summaryDiv.innerHTML = '<p class="text-danger">Error loading slot information</p>';
    }
}

async function handleBookSlot(e) {
    e.preventDefault();
    
    const slotId = document.getElementById('selectedSlotId').value;
    const vehicleId = document.getElementById('selectedVehicle').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    // Validation
    if (!slotId || !vehicleId || !startTime || !endTime) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    const hours = calculateHours(startTime, endTime);
    if (hours <= 0) {
        showToast('End time must be after start time.', 'error');
        return;
    }
    
    const currentUser = getCurrentUser();
    const slotsResponse = await apiCall('/slots');
    const slots = slotsResponse.slots || slotsResponse;
    const slot = slots.find(s => s.id === parseInt(slotId));
    
    if (!slot || slot.status !== 'Available') {
        showToast('Slot is no longer available.', 'error');
        return;
    }
    
    try {
        // Book slot via API
        const amount = hours * slot.hourlyRate;
        await apiCall('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                slotId: parseInt(slotId),
                vehicleId: parseInt(vehicleId),
                startTime: startTime,
                endTime: endTime
            })
        });
        
        showToast('Slot booked successfully!');
        
        // Close modal and reload data
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookSlotModal'));
        modal.hide();
        
        await loadAvailableSlots();
        await loadCurrentBooking();
        await loadUserVehicles();
        
    } catch (error) {
        showToast(error.message || 'Failed to book slot. Please try again.', 'error');
    }
}

async function loadCurrentBooking() {
    const currentUser = getCurrentUser();
    const container = document.getElementById('currentBooking');
    
    try {
        const response = await apiCall('/bookings/me');
        const allBookings = response.bookings || response;
        
        // Filter for active bookings (status = Pending)
        const activeBookings = allBookings.filter(b => b.paymentStatus === 'Pending');
        
        if (activeBookings.length === 0) {
            container.innerHTML = '<p class="text-muted">No active bookings</p>';
            currentBooking = null;
            return;
        }
        
        // Get all slots and vehicles for display
        const slotsResponse = await apiCall('/slots');
        const allSlots = slotsResponse.slots || slotsResponse;
        const vehiclesResponse = await apiCall('/vehicles');
        const allVehicles = vehiclesResponse || [];
        
        // Build HTML for all active bookings
        let bookingsHTML = '';
        
        activeBookings.forEach((booking, index) => {
            const slot = allSlots.find(s => s.id === booking.slotId);
            const vehicle = allVehicles.find(v => v.id === booking.vehicleId);
            const hours = calculateHours(booking.startTime, booking.endTime);
            const totalAmount = hours * (slot ? slot.hourlyRate : 0);
            
            bookingsHTML += `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="card-title mb-1">
                                    <i class="fas fa-square-parking text-primary me-2"></i>
                                    ${slot ? slot.label : 'Unknown Slot'}
                                </h6>
                                <p class="text-muted small mb-1">
                                    <i class="fas fa-map-marker-alt me-1"></i>
                                    ${slot ? slot.lotName : 'Unknown Lot'} 
                                    ${slot ? `(Level ${slot.level})` : ''}
                                </p>
                            </div>
                            <span class="badge bg-success">Active</span>
                        </div>
                        
                        <div class="mb-3">
                            <p class="small mb-1">
                                <i class="fas fa-car me-2"></i>
                                <strong>Vehicle:</strong> ${vehicle ? vehicle.plateNo : 'Unknown'}
                            </p>
                            <p class="small mb-1">
                                <i class="fas fa-tag me-2"></i>
                                <strong>Type:</strong> ${vehicle ? vehicle.type : 'Unknown'}
                            </p>
                            ${vehicle && vehicle.color ? `
                            <p class="small mb-1">
                                <i class="fas fa-palette me-2"></i>
                                <strong>Color:</strong> ${vehicle.color}
                            </p>
                            ` : ''}
                        </div>
                        
                        <div class="mb-3">
                            <p class="small mb-1">
                                <i class="fas fa-clock me-2"></i>
                                <strong>Start:</strong> ${new Date(booking.startTime).toLocaleString()}
                            </p>
                            <p class="small mb-1">
                                <i class="fas fa-clock me-2"></i>
                                <strong>End:</strong> ${new Date(booking.endTime).toLocaleString()}
                            </p>
                            <p class="small mb-1">
                                <i class="fas fa-hourglass-half me-2"></i>
                                <strong>Duration:</strong> ${hours} hour(s)
                            </p>
                            <p class="small mb-0">
                                <i class="fas fa-money-bill-wave me-2"></i>
                                <strong>Rate:</strong> ₹${slot ? slot.hourlyRate : 0}/hour
                            </p>
                        </div>
                        
                        <hr>
                        
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <strong class="text-primary">Total Amount:</strong>
                            <strong class="text-primary">₹${totalAmount}</strong>
                        </div>
                        
                        <button class="btn btn-danger btn-sm w-100" onclick="endSpecificBooking(${booking.id})">
                            <i class="fas fa-stop me-2"></i>End This Booking
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Add summary if multiple bookings
        if (activeBookings.length > 1) {
            const summaryHTML = `
                <div class="alert alert-info mb-3">
                    <i class="fas fa-info-circle me-2"></i>
                    You have <strong>${activeBookings.length}</strong> active booking(s)
                </div>
            `;
            bookingsHTML = summaryHTML + bookingsHTML;
        }
        
        container.innerHTML = bookingsHTML;
        
        // Set the first booking as currentBooking for backward compatibility
        currentBooking = activeBookings[0];
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = '<p class="text-muted">Error loading bookings</p>';
    }
}

// Global function for onclick handler in HTML (backward compatibility)
window.endBooking = async function() {
    if (!currentBooking) return;
    await endSpecificBooking(currentBooking.id);
}

// New function to end a specific booking by ID
window.endSpecificBooking = async function(bookingId) {
    if (!confirm('Are you sure you want to end this booking?')) {
        return;
    }
    
    try {
        // Cancel booking via API
        await apiCall(`/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
        
        showToast('Booking ended successfully!');
        
        // Reload data
        await loadCurrentBooking();
        await loadAvailableSlots();
        await loadUserVehicles();
        
    } catch (error) {
        showToast(error.message || 'Failed to end booking. Please try again.', 'error');
    }
}

function showBill(booking, slot, vehicle) {
    const billContent = document.getElementById('billContent');
    const actualEndTime = new Date();
    const actualHours = calculateHours(booking.startTime, actualEndTime.toISOString());
    const actualAmount = actualHours * (slot ? slot.pricePerHour : 0);
    
    billContent.innerHTML = `
        <div class="text-center mb-4">
            <h4>Parking Bill</h4>
            <p class="text-muted">Thank you for using Smart Parking</p>
        </div>
        
        <div class="row g-3">
            <div class="col-6"><strong>Booking ID:</strong></div>
            <div class="col-6">${booking.id}</div>
            
            <div class="col-6"><strong>Slot:</strong></div>
            <div class="col-6">${slot ? slot.name : 'Unknown'}</div>
            
            <div class="col-6"><strong>Vehicle:</strong></div>
            <div class="col-6">${vehicle ? vehicle.plateNumber : 'Unknown'}</div>
            
            <div class="col-6"><strong>Start Time:</strong></div>
            <div class="col-6">${formatDate(booking.startTime)}</div>
            
            <div class="col-6"><strong>End Time:</strong></div>
            <div class="col-6">${formatDate(actualEndTime.toISOString())}</div>
            
            <div class="col-6"><strong>Duration:</strong></div>
            <div class="col-6">${actualHours} hour(s)</div>
            
            <div class="col-6"><strong>Rate:</strong></div>
            <div class="col-6">${slot ? formatCurrency(slot.pricePerHour) : '₹0'}/hour</div>
            
            <div class="col-12"><hr></div>
            
            <div class="col-6"><strong>Total Amount:</strong></div>
            <div class="col-6"><strong>${formatCurrency(actualAmount)}</strong></div>
        </div>
        
        <div class="text-center mt-4">
            <p class="text-muted small">Generated on ${formatDate(new Date().toISOString())}</p>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('billModal'));
    modal.show();
}

function validateVehicleForm(data) {
    if (!data.plateNumber || !data.vehicleType || !data.vehicleColor) {
        showToast('Please fill in all required fields.', 'error');
        return false;
    }
    
    return true;
}