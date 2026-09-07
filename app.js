// Sackhe Technologies - SPA Router & App Logic

// Initial Auth State Helper Functions
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('sackhe_auth_user');
    if (!raw) return null;
    if (raw.startsWith('{')) {
      return JSON.parse(raw);
    }
    const isAdmin = raw.toLowerCase().includes('admin');
    return {
      name: isAdmin ? 'Admin User' : raw,
      email: raw.includes('@') ? raw : (isAdmin ? 'admin@sackhe.com' : 'user@example.com'),
      role: isAdmin ? 'admin' : 'user',
      org: isAdmin ? 'Sackhe Technologies' : 'Institutional Partner',
      phone: '+91 73372 38466'
    };
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem('sackhe_auth_user');
  } else {
    localStorage.setItem('sackhe_auth_user', JSON.stringify(user));
  }
  updateAuthUI();
}

// Initial Mock Data Sources
const INITIAL_ORDERS = [
  {
    _id: 'ord-883921',
    email: 'kavitha.reddy@hyderabadinstitutes.edu.in',
    client_name: 'Kavitha Reddy (Principal)',
    product_name: 'Dual-Chamber Eco Incinerator 1500W',
    quantity: 2,
    total_price: 129898,
    user_bank_name: 'HDFC Bank - Current A/C',
    transaction_ref: 'HDFC9088310023X',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    _id: 'ord-774019',
    email: 'procurement@telanganahospital.gov.in',
    client_name: 'Dr. R. V. Rao',
    product_name: 'Biodegradable Sanitary Pads - 500pk Institutional Box',
    quantity: 10,
    total_price: 34500,
    user_bank_name: 'State Bank of India',
    transaction_ref: 'SBIIN7811902401',
    status: 'verified',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    _id: 'ord-665201',
    email: 'admin@sackhe.com',
    client_name: 'Sackhe Operations Pilot',
    product_name: 'Smart Automated Dispenser Model S-2',
    quantity: 1,
    total_price: 18500,
    user_bank_name: 'ICICI Bank Corporate',
    transaction_ref: 'ICIC00018829910',
    status: 'verified',
    created_at: new Date(Date.now() - 3600000 * 24 * 9).toISOString()
  }
];

const INITIAL_LEADS = [
  {
    _id: 'lead-101',
    name: 'Suresh Kumar',
    email: 'suresh.k@greenindiafoundation.org',
    phone: '+91 98490 11223',
    organization: 'Green India Foundation',
    message: 'We are interested in installing 12 emission-controlled incinerators across rural government residential colleges.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'lead-102',
    name: 'Priya Sharma',
    email: 'priya.s@delhiedu.org',
    phone: '+91 98111 44556',
    organization: 'Delhi Model Schools Network',
    message: 'Seeking a formal quote for menstrual hygiene waste management demo & continuous servicing agreement.',
    created_at: new Date(Date.now() - 3600000 * 42).toISOString()
  },
  {
    _id: 'lead-103',
    name: 'Ananya Deshmukh',
    email: 'ananya@csr-reliance.com',
    phone: '+91 97234 56789',
    organization: 'Reliance Foundation CSR',
    message: 'Looking to partner under the "Cycle of Change" initiative to sponsor 25 community dispensers in Telangana.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

function getOrders() {
  try {
    const data = localStorage.getItem('sackhe_orders');
    if (!data) {
      localStorage.setItem('sackhe_orders', JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ORDERS;
  }
}

function saveOrders(orders) {
  localStorage.setItem('sackhe_orders', JSON.stringify(orders));
}

function getLeads() {
  try {
    const data = localStorage.getItem('sackhe_leads');
    if (!data) {
      localStorage.setItem('sackhe_leads', JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_LEADS;
  }
}

function saveLeads(leads) {
  localStorage.setItem('sackhe_leads', JSON.stringify(leads));
}

// Routing Map
const routes = {
  '/': { templateId: 'page-home', title: 'Home - Sackhe Technologies' },
  '/about': { templateId: 'page-about', title: 'About Us - Sackhe Technologies' },
  '/products': { templateId: 'page-products', title: 'Products - Sackhe Technologies' },
  '/services': { templateId: 'page-services', title: 'Services - Sackhe Technologies' },
  '/initiatives': { templateId: 'page-initiatives', title: 'Initiatives - Sackhe Technologies' },
  '/contact': { templateId: 'page-contact', title: 'Contact Us - Sackhe Technologies' },
  '/profile': { templateId: 'page-profile', title: 'My Account & History - Sackhe Technologies', requiresAuth: true },
  '/admin': { templateId: 'page-admin', title: 'Admin Operations Console - Sackhe Technologies', requiresAdmin: true }
};

// Toast Notification System
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  
  const icon = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// Open/Close Auth Modal
function toggleAuthModal(show) {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  
  if (show) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}
window.toggleAuthModal = toggleAuthModal;

// Auth Tab Switching
function switchAuthTab(tab) {
  const signinBtn = document.getElementById('tab-btn-signin');
  const regBtn = document.getElementById('tab-btn-register');
  const signinPane = document.getElementById('auth-signin-pane');
  const regPane = document.getElementById('auth-register-pane');
  
  if (tab === 'signin') {
    signinBtn?.classList.add('active');
    regBtn?.classList.remove('active');
    if (signinPane) signinPane.style.display = 'block';
    if (regPane) regPane.style.display = 'none';
  } else {
    regBtn?.classList.add('active');
    signinBtn?.classList.remove('active');
    if (signinPane) signinPane.style.display = 'none';
    if (regPane) regPane.style.display = 'block';
  }
}
window.switchAuthTab = switchAuthTab;

// Update Auth UI Elements
function updateAuthUI() {
  const user = getCurrentUser();
  const userButton = document.getElementById('user-auth-btn');
  const adminNav = document.getElementById('nav-admin-link');

  // Always keep admin navbar pill visible
  if (adminNav) {
    adminNav.style.display = 'inline-flex';
  }

  if (!userButton) return;

  if (user) {
    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    userButton.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <a href="#/profile" class="user-avatar-badge" title="View Profile">
          <span class="user-avatar-circle">${initials}</span>
          <span class="user-nav-name">${user.name}</span>
        </a>
        <button id="signout-trigger" class="btn-signout" title="Sign Out">Sign Out</button>
      </div>
    `;
    
    // Bind sign out click
    const signOutBtn = document.getElementById('signout-trigger');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setCurrentUser(null);
        showToast('Successfully signed out.', 'default');
        window.location.hash = '#/';
      });
    }
  } else {
    userButton.innerHTML = `<button class="nav-signin-btn" onclick="toggleAuthModal(true)">Sign In</button>`;
  }
}

// Google Auth Sign-In Logic
function handleGoogleSignIn() {
  const btn = document.getElementById('google-signin-action');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2.5" class="spin-icon">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
      </svg>
      <span>Signing in with Google...</span>
    `;
  }

  setTimeout(() => {
    const googleUser = {
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'user',
      org: 'Institutional Partner',
      phone: '+91 98765 43210'
    };
    setCurrentUser(googleUser);
    toggleAuthModal(false);
    showToast('Signed in successfully with Google!', 'success');
    
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg class="google-icon-svg" width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.31 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
        </svg>
        <span>Sign in with Google</span>
      `;
    }
  }, 900);
}
window.handleGoogleSignIn = handleGoogleSignIn;

// SPA Router
let initialRouteChecked = false;

function router() {
  let hash = window.location.hash;
  
  if (!hash || hash === '#') {
    hash = '#/';
  }
  
  const routePath = hash.substring(1);
  const route = routes[routePath] || routes['/'];
  const user = getCurrentUser();

  // Seamless Access Handlers (Ensure Admin and Profile always open)
  if (route.requiresAdmin) {
    if (!user || user.role !== 'admin') {
      const adminUser = {
        name: 'Admin User',
        email: 'admin@sackhe.com',
        role: 'admin',
        org: 'Sackhe Technologies',
        phone: '+91 73372 38466'
      };
      setCurrentUser(adminUser);
    }
  }

  if (route.requiresAuth && !user) {
    const defaultUser = {
      name: 'Admin User',
      email: 'admin@sackhe.com',
      role: 'admin',
      org: 'Sackhe Technologies',
      phone: '+91 73372 38466'
    };
    setCurrentUser(defaultUser);
  }

  const template = document.getElementById(route.templateId);
  const container = document.getElementById('app-view');
  
  if (!template || !container) {
    console.error('Template or target container not found for', route.templateId);
    return;
  }
  
  document.title = route.title;
  
  // Update nav active link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    }
  });
  
  // Close mobile drawer
  const navMenu = document.getElementById('nav-menu');
  const menuToggle = document.getElementById('menu-toggle');
  if (navMenu && menuToggle) {
    navMenu.classList.remove('open');
    menuToggle.classList.remove('open');
  }

  // Pre-rendered home optimization
  if (!initialRouteChecked) {
    initialRouteChecked = true;
    if (routePath === '/' && container.querySelector('[data-route="/"]')) {
      setupHomePage();
      return;
    }
  }

  // Render transition orchestrator
  const renderNewPage = () => {
    container.innerHTML = '';
    const clone = template.content.cloneNode(true);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'view-enter';
    wrapper.setAttribute('data-route', routePath);
    wrapper.appendChild(clone);
    container.appendChild(wrapper);
    
    window.scrollTo(0, 0);
    
    // Page handlers
    if (routePath === '/') {
      setupHomePage();
    } else if (routePath === '/about') {
      setupAboutPage();
    } else if (routePath === '/services') {
      setupServicesPage();
    } else if (routePath === '/initiatives') {
      setupInitiativesPage();
    } else if (routePath === '/contact') {
      setupContactPage();
    } else if (routePath === '/profile') {
      setupProfilePage();
    } else if (routePath === '/admin') {
      setupAdminPage();
    }
  };

  const currentView = container.firstElementChild;
  if (currentView) {
    currentView.className = 'view-exit';
    setTimeout(renderNewPage, 180);
  } else {
    renderNewPage();
  }
}

// Page Specific Handlers
function setupHomePage() {
  // Quick specification click bindings if needed
}

function setupAboutPage() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelector('.timeline-content').style.opacity = '1';
          entry.target.querySelector('.timeline-content').style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    timelineItems.forEach(item => {
      const content = item.querySelector('.timeline-content');
      content.style.opacity = '0';
      content.style.transform = 'translateY(30px)';
      content.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(item);
    });
  }
}

function setupServicesPage() {
  // Support triggers
}

function setupInitiativesPage() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    const text = stat.textContent;
    const target = parseInt(text.replace(/[^0-9]/g, ''), 10);
    const hasPlus = text.includes('+');
    
    let current = 0;
    const duration = 1500;
    const stepTime = 30;
    const increment = Math.ceil(target / (duration / stepTime));
    
    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target + (hasPlus ? '+' : '');
        clearInterval(counter);
      } else {
        stat.textContent = current + (hasPlus ? '+' : '');
      }
    }, stepTime);
  });
}

function setupContactPage() {
  const contactForm = document.getElementById('contact-inquiry-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('.contact-submit-button');
    const originalContent = submitBtn ? submitBtn.innerHTML : 'Send Message';
    
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const messageInput = document.getElementById('contact-message');
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
        </svg>
        <span>Sending...</span>
      `;
    }

    setTimeout(() => {
      // Store lead in admin leads list
      const leads = getLeads();
      const newLead = {
        _id: 'lead-' + Date.now().toString().slice(-4),
        name: nameInput?.value || 'Interested Client',
        email: emailInput?.value || 'client@example.com',
        phone: phoneInput?.value || '+91 73372 38466',
        organization: 'Direct Contact Portal',
        message: messageInput?.value || 'Inquiry regarding Sackhe waste solutions.',
        created_at: new Date().toISOString()
      };
      leads.unshift(newLead);
      saveLeads(leads);

      showToast('Thank you! Your message has been sent successfully. Our team will get in touch shortly.', 'success');
      contactForm.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
      }
    }, 900);
  });
}

// Profile Page Handler
function setupProfilePage() {
  const user = getCurrentUser();
  if (!user) return;

  // Identity Elements
  const nameEl = document.getElementById('profile-user-name');
  const emailEl = document.getElementById('profile-user-email');
  const avatarEl = document.getElementById('profile-avatar-icon');
  const orgEl = document.getElementById('profile-org-val');
  const phoneEl = document.getElementById('profile-phone-val');
  const roleBadgeContainer = document.getElementById('profile-role-badge-container');
  const adminQuicklink = document.getElementById('admin-quicklink-card');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (orgEl) orgEl.textContent = user.org || 'Institutional Partner';
  if (phoneEl) phoneEl.textContent = user.phone || '+91 73372 38466';

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  if (avatarEl) avatarEl.textContent = initials;

  if (roleBadgeContainer) {
    if (user.role === 'admin') {
      roleBadgeContainer.innerHTML = `
        <span class="profile-role-pill profile-role-admin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Administrator
        </span>
      `;
      if (adminQuicklink) adminQuicklink.style.display = 'block';
    } else {
      roleBadgeContainer.innerHTML = `
        <span class="profile-role-pill profile-role-user">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          Partner Client
        </span>
      `;
      if (adminQuicklink) adminQuicklink.style.display = 'none';
    }
  }

  // Render Orders Table
  const ordersTableBody = document.getElementById('user-orders-table-body');
  if (ordersTableBody) {
    const allOrders = getOrders();
    // Show orders matching user's email, or all orders if admin/demo
    const displayOrders = user.role === 'admin' 
      ? allOrders 
      : allOrders.filter(o => o.email.toLowerCase() === user.email.toLowerCase() || o.email === 'admin@sackhe.com');

    if (displayOrders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
            No procurement orders found. Explore our <a href="#/products" style="color: var(--primary); font-weight: 700;">Products catalog</a> to make an initial requisition.
          </td>
        </tr>
      `;
    } else {
      ordersTableBody.innerHTML = displayOrders.map(ord => `
        <tr>
          <td><span class="order-id-pill">${ord._id.toUpperCase()}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${ord.product_name}</div>
            <div style="font-size: 0.76rem; color: var(--text-secondary);">${new Date(ord.created_at).toLocaleDateString()}</div>
          </td>
          <td style="font-weight: 700;">${ord.quantity} units</td>
          <td style="font-weight: 800; color: var(--secondary);">₹${Number(ord.total_price).toLocaleString()}</td>
          <td>
            <span class="badge-status ${ord.status === 'verified' ? 'badge-verified' : (ord.status === 'rejected' ? 'badge-rejected' : 'badge-pending')}">
              ${ord.status.toUpperCase()}
            </span>
          </td>
          <td style="font-size: 0.8rem; font-family: monospace; color: var(--text-secondary);">
            ${ord.transaction_ref || 'TRX-ONLINE'}
          </td>
        </tr>
      `).join('');
    }
  }

  // Profile Edit Modal bindings
  const editOverlay = document.getElementById('profile-edit-overlay');
  const openEditBtn = document.getElementById('open-edit-profile-btn');
  const closeEditBtn = document.getElementById('close-profile-modal');
  const editForm = document.getElementById('profile-edit-form');
  const editNameInput = document.getElementById('edit-profile-name');
  const editOrgInput = document.getElementById('edit-profile-org');
  const editPhoneInput = document.getElementById('edit-profile-phone');

  if (openEditBtn && editOverlay) {
    openEditBtn.addEventListener('click', () => {
      if (editNameInput) editNameInput.value = user.name || '';
      if (editOrgInput) editOrgInput.value = user.org || '';
      if (editPhoneInput) editPhoneInput.value = user.phone || '';
      editOverlay.classList.add('active');
    });
  }

  if (closeEditBtn && editOverlay) {
    closeEditBtn.addEventListener('click', () => {
      editOverlay.classList.remove('active');
    });
  }

  if (editForm && editOverlay) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedUser = {
        ...user,
        name: editNameInput?.value.trim() || user.name,
        org: editOrgInput?.value.trim() || user.org,
        phone: editPhoneInput?.value.trim() || user.phone
      };
      setCurrentUser(updatedUser);
      editOverlay.classList.remove('active');
      showToast('Profile information updated successfully!', 'success');
      setupProfilePage();
    });
  }

  // Sign out button
  const signOutBtn = document.getElementById('profile-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      setCurrentUser(null);
      showToast('Successfully signed out.', 'default');
      window.location.hash = '#/';
    });
  }
}

// Admin Page Handler
function setupAdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') return;

  // Tabs
  const tabs = document.querySelectorAll('.admin-nav-tab');
  const ordersTab = document.getElementById('admin-tab-content-orders');
  const leadsTab = document.getElementById('admin-tab-content-leads');
  const settingsTab = document.getElementById('admin-tab-content-settings');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-admin-tab');

      if (ordersTab) ordersTab.style.display = target === 'orders' ? 'block' : 'none';
      if (leadsTab) leadsTab.style.display = target === 'leads' ? 'block' : 'none';
      if (settingsTab) settingsTab.style.display = target === 'settings' ? 'block' : 'none';
    });
  });

  // Refresh KPI and counters
  function refreshKPIs() {
    const orders = getOrders();
    const leads = getLeads();

    const verifiedOrders = orders.filter(o => o.status === 'verified');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const totalRev = verifiedOrders.reduce((sum, o) => sum + Number(o.total_price), 0);

    const revEl = document.getElementById('admin-stat-revenue');
    const ordersEl = document.getElementById('admin-stat-orders');
    const leadsEl = document.getElementById('admin-stat-leads');
    const ordersCountEl = document.getElementById('admin-orders-count');
    const leadsCountEl = document.getElementById('admin-leads-count');

    if (revEl) revEl.textContent = `₹${totalRev.toLocaleString()}`;
    if (ordersEl) ordersEl.textContent = `${orders.length} Orders`;
    if (leadsEl) leadsEl.textContent = `${leads.length} Inquiries`;
    if (ordersCountEl) ordersCountEl.textContent = orders.length;
    if (leadsCountEl) leadsCountEl.textContent = leads.length;
  }

  // Render Orders Table
  let currentOrderFilter = 'all';

  function renderAdminOrders() {
    const ordersTableBody = document.getElementById('admin-orders-table-body');
    if (!ordersTableBody) return;

    const orders = getOrders();
    const filtered = currentOrderFilter === 'all'
      ? orders
      : orders.filter(o => o.status === currentOrderFilter);

    if (filtered.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
            No purchase records found matching filter "${currentOrderFilter}".
          </td>
        </tr>
      `;
      return;
    }

    ordersTableBody.innerHTML = filtered.map(ord => `
      <tr>
        <td><span class="order-id-pill">${ord._id.toUpperCase()}</span></td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${ord.client_name || ord.email}</div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">${ord.email}</div>
        </td>
        <td style="font-size: 0.88rem; max-width: 220px;">${ord.product_name}</td>
        <td style="font-weight: 700;">${ord.quantity}</td>
        <td style="font-weight: 800; color: var(--secondary);">₹${Number(ord.total_price).toLocaleString()}</td>
        <td>
          <span class="badge-status ${ord.status === 'verified' ? 'badge-verified' : (ord.status === 'rejected' ? 'badge-rejected' : 'badge-pending')}">
            ${ord.status.toUpperCase()}
          </span>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 600;">${ord.user_bank_name}</div>
          <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-secondary);">${ord.transaction_ref || 'N/A'}</div>
        </td>
        <td>
          ${ord.status === 'pending' ? `
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn-action-verify" data-order-action="verify" data-order-id="${ord._id}" title="Approve & Verify">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Verify
              </button>
              <button class="btn-action-reject" data-order-action="reject" data-order-id="${ord._id}" title="Reject Transaction">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Reject
              </button>
            </div>
          ` : `
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Action Locked</span>
          `}
        </td>
      </tr>
    `).join('');

    // Bind action buttons
    ordersTableBody.querySelectorAll('[data-order-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-order-action');
        const id = btn.getAttribute('data-order-id');
        const all = getOrders();
        const target = all.find(o => o._id === id);
        if (target) {
          target.status = action === 'verify' ? 'verified' : 'rejected';
          saveOrders(all);
          showToast(`Order ${id.toUpperCase()} marked as ${target.status}!`, 'success');
          refreshKPIs();
          renderAdminOrders();
        }
      });
    });
  }

  // Filter Buttons
  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOrderFilter = btn.getAttribute('data-order-filter');
      renderAdminOrders();
    });
  });

  // Render Leads
  function renderAdminLeads(query = '') {
    const leadsContainer = document.getElementById('admin-leads-list');
    if (!leadsContainer) return;

    const leads = getLeads();
    const q = query.toLowerCase().trim();
    const filtered = q
      ? leads.filter(l => 
          l.name.toLowerCase().includes(q) || 
          l.email.toLowerCase().includes(q) || 
          (l.organization && l.organization.toLowerCase().includes(q)) ||
          l.message.toLowerCase().includes(q)
        )
      : leads;

    if (filtered.length === 0) {
      leadsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary); background: rgba(0,0,0,0.01); border-radius: var(--radius-lg);">
          No customer inquiries matching "${query}".
        </div>
      `;
      return;
    }

    leadsContainer.innerHTML = filtered.map(l => `
      <div class="glass-card" style="padding: 1.5rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 0.75rem; background: rgba(255,255,255,0.7);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.75rem;">
          <div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">${l.name}</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">${l.email} &bull; ${l.phone || 'No phone'}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge" style="background: rgba(147, 51, 234, 0.1); color: var(--primary); margin: 0; font-size: 0.75rem;">
              ${l.organization || 'Individual'}
            </span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${new Date(l.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div style="font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary);">
          ${l.message}
        </div>
      </div>
    `).join('');
  }

  // Lead search listener
  const leadSearchInput = document.getElementById('admin-lead-search');
  if (leadSearchInput) {
    leadSearchInput.addEventListener('input', (e) => {
      renderAdminLeads(e.target.value);
    });
  }

  // Export CSV
  const exportBtn = document.getElementById('admin-export-leads-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const leads = getLeads();
      if (leads.length === 0) {
        showToast('No inquiries available to export.', 'default');
        return;
      }
      let csvContent = 'data:text/csv;charset=utf-8,ID,Name,Email,Phone,Organization,Date,Message\n';
      leads.forEach(l => {
        const row = [
          `"${l._id}"`,
          `"${l.name.replace(/"/g, '""')}"`,
          `"${l.email.replace(/"/g, '""')}"`,
          `"${l.phone || ''}"`,
          `"${(l.organization || '').replace(/"/g, '""')}"`,
          `"${new Date(l.created_at).toLocaleDateString()}"`,
          `"${l.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`
        ].join(',');
        csvContent += row + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `sackhe_leads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported customer inquiries to CSV!', 'success');
    });
  }

  // Settings form
  const settingsForm = document.getElementById('admin-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('System and pricing configurations updated successfully!', 'success');
    });
  }

  refreshKPIs();
  renderAdminOrders();
  renderAdminLeads();
}

// Global Event Listeners
window.addEventListener('DOMContentLoaded', () => {
  // Force Light Mode
  document.documentElement.classList.remove('dark-mode');
  localStorage.removeItem('sackhe_theme');

  // Route matching
  router();
  window.addEventListener('hashchange', router);
  
  // Auth system init
  updateAuthUI();

  // Wire up Auth Modal Forms
  const loginForm = document.getElementById('auth-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      if (!email) return;

      const isAdmin = email.toLowerCase().includes('admin');
      const user = {
        name: isAdmin ? 'Admin User' : email.split('@')[0].toUpperCase(),
        email: email,
        role: isAdmin ? 'admin' : 'user',
        org: isAdmin ? 'Sackhe Technologies' : 'Institutional Partner',
        phone: '+91 73372 38466'
      };

      setCurrentUser(user);
      toggleAuthModal(false);
      showToast(`Welcome back, ${user.name}!`, 'success');

      if (isAdmin) {
        window.location.hash = '#/admin';
      } else {
        window.location.hash = '#/profile';
      }
    });
  }

  const registerForm = document.getElementById('auth-register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name')?.value.trim();
      const email = document.getElementById('register-email')?.value.trim();
      const org = document.getElementById('register-org')?.value.trim();
      if (!email) return;

      const isAdmin = email.toLowerCase().includes('admin');
      const user = {
        name: name || 'Valued Partner',
        email: email,
        role: isAdmin ? 'admin' : 'user',
        org: org || 'Institutional Partner',
        phone: '+91 73372 38466'
      };

      setCurrentUser(user);
      toggleAuthModal(false);
      showToast('Account registered successfully!', 'success');
      window.location.hash = '#/profile';
    });
  }

  // Mobile nav toggler
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }
  
  // Header scroll appearance
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
});

// Progressive Web Font Enhancement
(() => {
  let fontsLoaded = false;
  const loadFonts = () => {
    if (fontsLoaded) return;
    fontsLoaded = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:wght@700&display=swap';
    document.head.appendChild(link);
    ['scroll', 'touchstart', 'pointerdown', 'mousemove', 'keydown'].forEach(e => {
      window.removeEventListener(e, loadFonts);
    });
  };
  ['scroll', 'touchstart', 'pointerdown', 'mousemove', 'keydown'].forEach(e => {
    window.addEventListener(e, loadFonts, { once: true, passive: true });
  });
  setTimeout(loadFonts, 4500);
})();
