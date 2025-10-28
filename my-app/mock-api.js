// Mock API for frontend testing when backend is not available
// This simulates the Backend_alpha API responses

// Mock data storage - use localStorage for persistence
function getMockUsers() {
    const stored = localStorage.getItem('mockUsers');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default users
    const defaultUsers = [
        { id: 1, name: 'Admin User', email: 'admin@test.com', role: 'admin' },
        { id: 2, name: 'Test User', email: 'user@test.com', role: 'user' }
    ];
    localStorage.setItem('mockUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
}

function saveMockUsers(users) {
    localStorage.setItem('mockUsers', JSON.stringify(users));
}

function getMockVehicles() {
    const stored = localStorage.getItem('mockVehicles');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default vehicles
    const defaultVehicles = [
        { id: 1, userId: 2, plateNo: 'ABC123', type: 'Car', color: 'Red' },
        { id: 2, userId: 2, plateNo: 'XYZ789', type: 'TwoWheeler', color: 'Blue' }
    ];
    localStorage.setItem('mockVehicles', JSON.stringify(defaultVehicles));
    return defaultVehicles;
}

function saveMockVehicles(vehicles) {
    localStorage.setItem('mockVehicles', JSON.stringify(vehicles));
}

function getMockSlots() {
    const stored = localStorage.getItem('mockSlots');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default slots
    const defaultSlots = [
        { id: 1, label: 'A1', lotName: 'Main Lot', status: 'Available', level: 0, hourlyRate: 20 },
        { id: 2, label: 'A2', lotName: 'Main Lot', status: 'Available', level: 0, hourlyRate: 25 },
        { id: 3, label: 'B1', lotName: 'Main Lot', status: 'Occupied', level: 0, hourlyRate: 30 },
        { id: 4, label: 'B2', lotName: 'Main Lot', status: 'Reserved', level: 0, hourlyRate: 35 }
    ];
    localStorage.setItem('mockSlots', JSON.stringify(defaultSlots));
    return defaultSlots;
}

function saveMockSlots(slots) {
    localStorage.setItem('mockSlots', JSON.stringify(slots));
}

function getMockBookings() {
    const stored = localStorage.getItem('mockBookings');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default bookings
    const defaultBookings = [
        { id: 1, userId: 2, vehicleId: 1, slotId: 1, startTime: '2024-01-01T10:00:00Z', endTime: '2024-01-01T12:00:00Z', paymentStatus: 'Pending' }
    ];
    localStorage.setItem('mockBookings', JSON.stringify(defaultBookings));
    return defaultBookings;
}

function saveMockBookings(bookings) {
    localStorage.setItem('mockBookings', JSON.stringify(bookings));
}

function getNextId() {
    const stored = localStorage.getItem('mockNextId');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default IDs
    const defaultNextId = { users: 3, vehicles: 3, slots: 5, bookings: 2 };
    localStorage.setItem('mockNextId', JSON.stringify(defaultNextId));
    return defaultNextId;
}

function saveNextId(nextId) {
    localStorage.setItem('mockNextId', JSON.stringify(nextId));
}

// Initialize data from localStorage
let mockUsers = getMockUsers();
let mockVehicles = getMockVehicles();
let mockSlots = getMockSlots();
let mockBookings = getMockBookings();
let nextId = getNextId();

// Mock API functions
const mockAPI = {
    // Auth endpoints - Admin creates users only
    createUser: async (data) => {
        const { name, email, password, contact, role = 'user' } = data;
        
        // Check if user exists
        if (mockUsers.find(u => u.email === email)) {
            throw new Error('User already exists');
        }
        
        const newUser = {
            id: nextId.users++,
            name,
            email,
            contact: contact || '',
            role
        };
        
        mockUsers.push(newUser);
        saveMockUsers(mockUsers);
        
        console.log('✅ New user created by admin:', newUser);
        console.log('📋 All users now:', mockUsers);
        
        return {
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        };
    },
    
    login: async (data) => {
        const { email, password } = data;
        
        // Reload users from localStorage
        mockUsers = getMockUsers();
        
        console.log('🔍 Mock API Login - Looking for email:', email);
        console.log('📋 Available users:', mockUsers.map(u => u.email));
        console.log('📋 Full user list:', mockUsers);
        
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
            console.log('❌ User not found for email:', email);
            console.log('🔍 Searched in:', mockUsers);
            throw new Error('Invalid credentials');
        }
        
        console.log('✅ User found:', user);
        
        return {
            message: 'Login successful',
            token: 'mock-jwt-token-' + Date.now(),
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        };
    },
    
    // Vehicle endpoints
    registerVehicle: async (data, userId) => {
        const { plateNo, type, color } = data;
        
        // Reload from localStorage
        mockVehicles = getMockVehicles();
        nextId = getNextId();
        
        if (mockVehicles.find(v => v.plateNo === plateNo)) {
            throw new Error('Vehicle already registered');
        }
        
        const newVehicle = {
            id: nextId.vehicles++,
            userId,
            plateNo,
            type,
            color: color || 'Unknown'
        };
        
        mockVehicles.push(newVehicle);
        saveMockVehicles(mockVehicles);
        saveNextId(nextId);
        
        return { msg: 'Vehicle registered successfully', vehicle: newVehicle };
    },
    
    getVehicles: async () => {
        return getMockVehicles();
    },
    
    // Slot endpoints
    getSlots: async () => {
        return { slots: getMockSlots() };
    },
    
    addSlot: async (data) => {
        const { label, lotName, level, hourlyRate } = data;
        
        // Reload from localStorage
        mockSlots = getMockSlots();
        nextId = getNextId();
        
        if (mockSlots.find(s => s.label === label)) {
            throw new Error('Slot with this label already exists');
        }
        
        const newSlot = {
            id: nextId.slots++,
            label,
            lotName,
            status: 'Available',
            level,
            hourlyRate
        };
        
        mockSlots.push(newSlot);
        saveMockSlots(mockSlots);
        saveNextId(nextId);
        
        return newSlot;
    },
    
    deleteSlot: async (slotId) => {
        // Reload from localStorage
        mockSlots = getMockSlots();
        
        const index = mockSlots.findIndex(s => s.id === parseInt(slotId));
        if (index === -1) {
            throw new Error('Slot not found');
        }
        
        mockSlots.splice(index, 1);
        saveMockSlots(mockSlots);
        
        return { message: 'Slot deleted' };
    },
    
    // Booking endpoints
    bookSlot: async (data, userId) => {
        const { slotId, vehicleId, startTime, endTime } = data;
        
        // Reload from localStorage
        mockSlots = getMockSlots();
        mockBookings = getMockBookings();
        nextId = getNextId();
        
        const slot = mockSlots.find(s => s.id === slotId);
        if (!slot || slot.status !== 'Available') {
            throw new Error('Slot not available');
        }
        
        // Reserve slot
        slot.status = 'Reserved';
        
        const newBooking = {
            id: nextId.bookings++,
            userId,
            vehicleId,
            slotId,
            startTime,
            endTime,
            paymentStatus: 'Pending'
        };
        
        mockBookings.push(newBooking);
        saveMockSlots(mockSlots);
        saveMockBookings(mockBookings);
        saveNextId(nextId);
        
        return { booking: newBooking };
    },
    
    getMyBookings: async (userId) => {
        const mockBookings = getMockBookings();
        const userBookings = mockBookings.filter(b => b.userId === userId);
        return { bookings: userBookings };
    },
    
    cancelBooking: async (bookingId, userId) => {
        // Reload from localStorage
        mockSlots = getMockSlots();
        mockBookings = getMockBookings();
        
        const booking = mockBookings.find(b => b.id === parseInt(bookingId));
        if (!booking) {
            throw new Error('Booking not found');
        }
        
        if (booking.userId !== userId) {
            throw new Error('Forbidden: Cannot cancel this booking');
        }
        
        booking.paymentStatus = 'Cancelled';
        
        // Free slot
        const slot = mockSlots.find(s => s.id === booking.slotId);
        if (slot) slot.status = 'Available';
        
        saveMockSlots(mockSlots);
        saveMockBookings(mockBookings);
        
        return { message: 'Booking cancelled successfully' };
    },
    
    // Admin endpoints
    getCatalog: async () => {
        // Reload from localStorage
        const mockBookings = getMockBookings();
        const mockUsers = getMockUsers();
        const mockVehicles = getMockVehicles();
        const mockSlots = getMockSlots();
        
        const catalog = mockBookings.map(booking => {
            const user = mockUsers.find(u => u.id === booking.userId);
            const vehicle = mockVehicles.find(v => v.id === booking.vehicleId);
            const slot = mockSlots.find(s => s.id === booking.slotId);
            
            return {
                id: booking.id,
                startTime: booking.startTime,
                endTime: booking.endTime,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.startTime,
                User: user,
                Vehicle: vehicle,
                Slot: slot
            };
        });
        
        return {
            message: 'Admin catalog fetched successfully',
            count: catalog.length,
            catalog
        };
    }
};

// Export for use in browser
if (typeof window !== 'undefined') {
    window.mockAPI = mockAPI;
    
    // Add utility functions
    window.clearMockData = function() {
        localStorage.removeItem('mockUsers');
        localStorage.removeItem('mockVehicles');
        localStorage.removeItem('mockSlots');
        localStorage.removeItem('mockBookings');
        localStorage.removeItem('mockNextId');
        console.log('🗑️ All mock data cleared');
    };
    
    window.showMockUsers = function() {
        console.log('👥 Current mock users:', getMockUsers());
    };
    
    window.showMockSlots = function() {
        console.log('🅿️ Current mock slots:', getMockSlots());
    };
    
    window.showAllMockData = function() {
        console.log('📊 All mock data:', {
            users: getMockUsers(),
            vehicles: getMockVehicles(),
            slots: getMockSlots(),
            bookings: getMockBookings(),
            nextId: getNextId()
        });
    };
}
