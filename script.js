// ============================================
// PRIMAL LAB MARKETPLACE - COMPLETE JAVASCRIPT
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let currentFilter = 'all';
let allListings = [];
let currentConversationId = null;
let messagePollingInterval = null;

// ============================================
// AUTHENTICATION
// ============================================

// Check if user is logged in on page load
async function checkAuth() {
    const token = localStorage.getItem('primal_auth_token');
    const userId = localStorage.getItem('primal_user_id');
    
    if (token && userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (data && !error) {
                currentUser = data;
                updateUIForLoggedInUser();
            } else {
                // Token invalid, clear it
                localStorage.removeItem('primal_auth_token');
                localStorage.removeItem('primal_user_id');
            }
        } catch (err) {
            console.error('Auth check error:', err);
        }
    }
}

// Update UI based on login status
function updateUIForLoggedInUser() {
    if (currentUser) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('listGearBtn').style.display = 'block';
        document.getElementById('myListingsNav').style.display = 'block';
        document.getElementById('myChatsNav').style.display = 'block';
        document.getElementById('userMenu').style.display = 'block';
        document.getElementById('userNameDisplay').textContent = currentUser.name;
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('listGearBtn').style.display = 'none';
        document.getElementById('myListingsNav').style.display = 'none';
        document.getElementById('myChatsNav').style.display = 'none';
        document.getElementById('userMenu').style.display = 'none';
    }
}

// Hash password (simple for demo - use proper bcrypt in production)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Login
async function login(email, password) {
    try {
        const passwordHash = await hashPassword(password);
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password_hash', passwordHash)
            .single();
        
        if (error || !data) {
            showToast('Invalid email or password', 'error');
            return false;
        }
        
        currentUser = data;
        localStorage.setItem('primal_auth_token', 'logged_in'); // Simple token
        localStorage.setItem('primal_user_id', data.id);
        
        showToast('Welcome back, ' + data.name + '!', 'success');
        updateUIForLoggedInUser();
        closeModal('authModal');
        return true;
    } catch (err) {
        console.error('Login error:', err);
        showToast('Login failed', 'error');
        return false;
    }
}

// Register
async function register(name, email, password) {
    try {
        // Check if email already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        
        if (existing) {
            showToast('Email already registered', 'error');
            return false;
        }
        
        const passwordHash = await hashPassword(password);
        
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email: email,
                password_hash: passwordHash,
                name: name
            }])
            .select()
            .single();
        
        if (error) {
            console.error('Registration error:', error);
            showToast('Registration failed', 'error');
            return false;
        }
        
        currentUser = data;
        localStorage.setItem('primal_auth_token', 'logged_in');
        localStorage.setItem('primal_user_id', data.id);
        
        showToast('Account created successfully!', 'success');
        updateUIForLoggedInUser();
        closeModal('authModal');
        return true;
    } catch (err) {
        console.error('Registration error:', err);
        showToast('Registration failed', 'error');
        return false;
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('primal_auth_token');
    localStorage.removeItem('primal_user_id');
    updateUIForLoggedInUser();
    showToast('Logged out successfully', 'success');
    loadListings(); // Reload to show only active listings
}

// ============================================
// LISTINGS
// ============================================

// Load all listings
async function loadListings() {
    const loadingState = document.getElementById('loadingState');
    const productGrid = document.getElementById('productGrid');
    
    loadingState.style.display = 'block';
    
    try {
        let query = supabase
            .from('listings')
            .select(`
                *,
                users!inner(name, email)
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        allListings = data || [];
        displayListings(allListings);
        
    } catch (err) {
        console.error('Error loading listings:', err);
        productGrid.innerHTML = '<div class="error-state"><p>Failed to load listings</p></div>';
    } finally {
        loadingState.style.display = 'none';
    }
}

// Display listings
function displayListings(listings) {
    const productGrid = document.getElementById('productGrid');
    
    if (!listings || listings.length === 0) {
        productGrid.innerHTML = '<div class="empty-state"><p>No listings found</p></div>';
        return;
    }
    
    productGrid.innerHTML = listings.map(listing => `
        <div class="product-card" data-category="${listing.category}">
            <div class="product-image" style="background-image: url('${listing.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}');">
                <div class="product-badge">${formatCondition(listing.condition)}</div>
            </div>
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-title">${escapeHtml(listing.title)}</h3>
                    <div class="product-price">$${listing.price.toFixed(2)}</div>
                </div>
                <p class="product-description">${escapeHtml(listing.description.substring(0, 100))}${listing.description.length > 100 ? '...' : ''}</p>
                <div class="product-meta">
                    <span class="product-location">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13C7 13 11.5 9 11.5 5.5C11.5 3 9.5 1 7 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        ${escapeHtml(listing.city)}, ${escapeHtml(listing.state)}
                    </span>
                    <span class="product-seller">by ${escapeHtml(listing.users.name)}</span>
                </div>
                <button class="action-btn action-btn--primary action-btn--full contact-seller-btn" data-listing-id="${listing.id}" data-seller-id="${listing.user_id}">
                    <span class="btn-text">Contact Seller</span>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to contact buttons
    document.querySelectorAll('.contact-seller-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const listingId = this.dataset.listingId;
            const sellerId = this.dataset.sellerId;
            handleContactSeller(listingId, sellerId);
        });
    });
}

// Filter listings
function filterListings(category) {
    currentFilter = category;
    
    // Update active filter chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('filter-chip--active');
        if (chip.dataset.filter === category) {
            chip.classList.add('filter-chip--active');
        }
    });
    
    // Filter and display
    if (category === 'all') {
        displayListings(allListings);
    } else {
        const filtered = allListings.filter(listing => listing.category === category);
        displayListings(filtered);
    }
}

// Create new listing
async function createListing(formData) {
    if (!currentUser) {
        showToast('Please sign in to list items', 'error');
        openModal('authModal');
        return false;
    }
    
    try {
        const { data, error } = await supabase
            .from('listings')
            .insert([{
                user_id: currentUser.id,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                condition: formData.condition,
                price: parseFloat(formData.price),
                negotiable: formData.negotiable,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                local_pickup: formData.local_pickup,
                shipping: formData.shipping,
                local_delivery: formData.local_delivery,
                image_url: formData.image_url || null
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        showToast('Listing created successfully!', 'success');
        closeModal('listGearModal');
        loadListings(); // Reload listings
        return true;
        
    } catch (err) {
        console.error('Error creating listing:', err);
        showToast('Failed to create listing', 'error');
        return false;
    }
}

// Load user's listings
async function loadMyListings() {
    if (!currentUser) {
        showToast('Please sign in first', 'error');
        return;
    }
    
    const container = document.getElementById('myListingsContainer');
    container.innerHTML = '<div class="loading-state"><p>Loading your listings...</p></div>';
    
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>You haven\'t listed any items yet</p></div>';
            return;
        }
        
        container.innerHTML = data.map(listing => `
            <div class="my-listing-card">
                <div class="my-listing-image" style="background-image: url('${listing.image_url || 'https://via.placeholder.com/200x150?text=No+Image'}');"></div>
                <div class="my-listing-info">
                    <h4>${escapeHtml(listing.title)}</h4>
                    <p class="my-listing-price">$${listing.price.toFixed(2)}</p>
                    <p class="my-listing-status">Status: ${formatStatus(listing.status)}</p>
                    <div class="my-listing-actions">
                        <button class="action-btn action-btn--small edit-listing-btn" data-listing-id="${listing.id}">
                            Edit
                        </button>
                        <button class="action-btn action-btn--small delete-listing-btn" data-listing-id="${listing.id}">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.edit-listing-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // For simplicity, just show update options
                showToast('Edit functionality - update status or delete', 'info');
            });
        });
        
        container.querySelectorAll('.delete-listing-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const listingId = this.dataset.listingId;
                if (confirm('Are you sure you want to delete this listing?')) {
                    await deleteListing(listingId);
                }
            });
        });
        
    } catch (err) {
        console.error('Error loading my listings:', err);
        container.innerHTML = '<div class="error-state"><p>Failed to load listings</p></div>';
    }
}

// Delete listing
async function deleteListing(listingId) {
    try {
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', listingId)
            .eq('user_id', currentUser.id); // Ensure user owns the listing
        
        if (error) throw error;
        
        showToast('Listing deleted successfully', 'success');
        loadMyListings(); // Reload
        loadListings(); // Refresh main view
        
    } catch (err) {
        console.error('Error deleting listing:', err);
        showToast('Failed to delete listing', 'error');
    }
}

// ============================================
// CHAT SYSTEM
// ============================================

// Handle contact seller
async function handleContactSeller(listingId, sellerId) {
    if (!currentUser) {
        showToast('Please sign in to contact sellers', 'error');
        openModal('authModal');
        return;
    }
    
    if (currentUser.id === sellerId) {
        showToast('You cannot message your own listing', 'error');
        return;
    }
    
    try {
        // Check if conversation already exists
        const { data: existing, error: checkError } = await supabase
            .from('conversations')
            .select('*')
            .eq('listing_id', listingId)
            .eq('buyer_id', currentUser.id)
            .single();
        
        let conversationId;
        
        if (existing && !checkError) {
            conversationId = existing.id;
        } else {
            // Create new conversation
            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert([{
                    listing_id: listingId,
                    buyer_id: currentUser.id,
                    seller_id: sellerId
                }])
                .select()
                .single();
            
            if (createError) throw createError;
            conversationId = newConv.id;
        }
        
        // Open chat modal
        openChatModal(conversationId);
        
    } catch (err) {
        console.error('Error starting conversation:', err);
        showToast('Failed to start conversation', 'error');
    }
}

// Open chat modal
async function openChatModal(conversationId) {
    currentConversationId = conversationId;
    
    try {
        // Get conversation details
        const { data: conv, error: convError } = await supabase
            .from('conversations')
            .select(`
                *,
                listings(id, title, price, image_url),
                buyer:buyer_id(name),
                seller:seller_id(name)
            `)
            .eq('id', conversationId)
            .single();
        
        if (convError) throw convError;
        
        // Update modal header
        const otherUser = conv.buyer_id === currentUser.id ? conv.seller.name : conv.buyer.name;
        document.getElementById('chatModalTitle').textContent = `Chat with ${otherUser}`;
        
        // Update listing info
        document.getElementById('chatListingImage').src = conv.listings.image_url || 'https://via.placeholder.com/60x60';
        document.getElementById('chatListingTitle').textContent = conv.listings.title;
        document.getElementById('chatListingPrice').textContent = `$${conv.listings.price.toFixed(2)}`;
        document.getElementById('chatParticipant').textContent = `Chatting with ${otherUser}`;
        
        // Load messages
        await loadMessages(conversationId);
        
        // Open modal
        openModal('chatModal');
        
        // Start polling for new messages
        startMessagePolling();
        
    } catch (err) {
        console.error('Error opening chat:', err);
        showToast('Failed to open chat', 'error');
    }
}

// Load messages
async function loadMessages(conversationId) {
    const messagesContainer = document.getElementById('chatMessages');
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(name)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            messagesContainer.innerHTML = '<div class="empty-state"><p>No messages yet. Start the conversation!</p></div>';
            return;
        }
        
        messagesContainer.innerHTML = data.map(msg => {
            const isOwn = msg.sender_id === currentUser.id;
            return `
                <div class="chat-message ${isOwn ? 'chat-message--own' : ''}">
                    <div class="chat-message-sender">${escapeHtml(msg.sender.name)}</div>
                    <div class="chat-message-text">${escapeHtml(msg.message)}</div>
                    <div class="chat-message-time">${formatTime(msg.created_at)}</div>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Mark messages as read
        await markMessagesAsRead(conversationId);
        
    } catch (err) {
        console.error('Error loading messages:', err);
        messagesContainer.innerHTML = '<div class="error-state"><p>Failed to load messages</p></div>';
    }
}

// Send message
async function sendMessage(conversationId, messageText) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversationId,
                sender_id: currentUser.id,
                message: messageText
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // Reload messages
        await loadMessages(conversationId);
        
    } catch (err) {
        console.error('Error sending message:', err);
        showToast('Failed to send message', 'error');
    }
}

// Mark messages as read
async function markMessagesAsRead(conversationId) {
    try {
        await supabase
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUser.id)
            .eq('read', false);
    } catch (err) {
        console.error('Error marking messages as read:', err);
    }
}

// Start polling for new messages
function startMessagePolling() {
    // Clear any existing interval
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    
    // Poll every 3 seconds
    messagePollingInterval = setInterval(() => {
        if (currentConversationId) {
            loadMessages(currentConversationId);
        }
    }, 3000);
}

// Stop polling
function stopMessagePolling() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }
}

// Load user's conversations
async function loadMyChats() {
    if (!currentUser) {
        showToast('Please sign in first', 'error');
        return;
    }
    
    const container = document.getElementById('myChatsContainer');
    container.innerHTML = '<div class="loading-state"><p>Loading conversations...</p></div>';
    
    try {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                listings(id, title, price, image_url),
                buyer:buyer_id(name),
                seller:seller_id(name),
                messages(message, created_at)
            `)
            .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No conversations yet</p></div>';
            return;
        }
        
        container.innerHTML = data.map(conv => {
            const otherUser = conv.buyer_id === currentUser.id ? conv.seller.name : conv.buyer.name;
            const lastMsg = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
            
            return `
                <div class="chat-list-item" data-conversation-id="${conv.id}">
                    <img src="${conv.listings.image_url || 'https://via.placeholder.com/60x60'}" alt="" class="chat-list-thumb">
                    <div class="chat-list-info">
                        <div class="chat-list-title">${escapeHtml(conv.listings.title)}</div>
                        <div class="chat-list-participant">${escapeHtml(otherUser)}</div>
                        ${lastMsg ? `<div class="chat-list-last-msg">${escapeHtml(lastMsg.message.substring(0, 50))}${lastMsg.message.length > 50 ? '...' : ''}</div>` : ''}
                    </div>
                    <div class="chat-list-action">
                        <button class="action-btn action-btn--small">Open</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        container.querySelectorAll('.chat-list-item').forEach(item => {
            item.addEventListener('click', function() {
                const convId = this.dataset.conversationId;
                closeModal('myChatsModal');
                openChatModal(convId);
            });
        });
        
    } catch (err) {
        console.error('Error loading chats:', err);
        container.innerHTML = '<div class="error-state"><p>Failed to load conversations</p></div>';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format condition
function formatCondition(condition) {
    const conditions = {
        'new': 'New',
        'like-new': 'Like New',
        'good': 'Good',
        'fair': 'Fair',
        'used': 'Used'
    };
    return conditions[condition] || condition;
}

// Format status
function formatStatus(status) {
    const statuses = {
        'active': 'Active',
        'pending': 'Pending Sale',
        'sold': 'Sold',
        'inactive': 'Inactive'
    };
    return statuses[status] || status;
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast toast--' + type + ' toast--show';
    
    setTimeout(() => {
        toast.classList.remove('toast--show');
    }, 3000);
}

// Modal management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Stop message polling if closing chat modal
    if (modalId === 'chatModal') {
        stopMessagePolling();
        currentConversationId = null;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    await checkAuth();
    
    // Load listings
    await loadListings();
    
    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            filterListings(this.dataset.filter);
        });
    });
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
        openModal('authModal');
    });
    
    // List gear button
    document.getElementById('listGearBtn').addEventListener('click', () => {
        if (!currentUser) {
            showToast('Please sign in first', 'error');
            openModal('authModal');
            return;
        }
        openModal('listGearModal');
    });
    
    // My listings nav
    document.getElementById('myListingsNav').addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            showToast('Please sign in first', 'error');
            openModal('authModal');
            return;
        }
        openModal('myListingsModal');
        loadMyListings();
    });
    
    // My chats nav
    document.getElementById('myChatsNav').addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            showToast('Please sign in first', 'error');
            openModal('authModal');
            return;
        }
        openModal('myChatsModal');
        loadMyChats();
    });
    
    // User menu
    document.getElementById('userMenuBtn').addEventListener('click', () => {
        document.getElementById('userDropdown').classList.toggle('show');
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown').classList.remove('show');
        }
    });
    
    // Auth modal - switch between login/register
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('authModalTitle').textContent = 'Create Account';
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('authModalTitle').textContent = 'Sign In';
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await login(email, password);
    });
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        await register(name, email, password);
    });
    
    // List gear form
    document.getElementById('listGearForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('listingTitle').value,
            description: document.getElementById('listingDescription').value,
            category: document.getElementById('listingCategory').value,
            condition: document.getElementById('listingCondition').value,
            price: document.getElementById('listingPrice').value,
            negotiable: document.getElementById('listingNegotiable').checked,
            city: document.getElementById('listingCity').value,
            state: document.getElementById('listingState').value,
            postal_code: document.getElementById('listingPostal').value,
            local_pickup: document.getElementById('listingLocalPickup').checked,
            shipping: document.getElementById('listingShipping').checked,
            local_delivery: document.getElementById('listingDelivery').checked,
            image_url: document.getElementById('listingImage').value
        };
        
        const success = await createListing(formData);
        if (success) {
            e.target.reset();
        }
    });
    
    // Chat form
    document.getElementById('chatInputForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message && currentConversationId) {
            await sendMessage(currentConversationId, message);
            input.value = '';
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', function(e) {
            if (e.target === this) {
                const modal = this.closest('.modal');
                closeModal(modal.id);
            }
        });
    });
    
    // Specific close buttons
    document.getElementById('closeAuthModal').addEventListener('click', () => closeModal('authModal'));
    document.getElementById('closeListGearModal').addEventListener('click', () => closeModal('listGearModal'));
    document.getElementById('closeMyListingsModal').addEventListener('click', () => closeModal('myListingsModal'));
    document.getElementById('closeChatModal').addEventListener('click', () => closeModal('chatModal'));
    document.getElementById('closeMyChatsModal').addEventListener('click', () => closeModal('myChatsModal'));
    
    // Hero buttons
    document.getElementById('browseBtn').addEventListener('click', () => {
        document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('topRatedBtn').addEventListener('click', () => {
        showToast('Top rated feature coming soon!', 'info');
    });
});