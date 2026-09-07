// Sackhe Technologies - SPA Router & App Logic

// Initial Users Store (Admin vs Normal User)
const INITIAL_USERS = [
  {
    name: 'Admin User',
    email: 'admin@sackhe.com',
    role: 'admin',
    org: 'Sackhe Technologies',
    phone: '+91 73372 38466'
  },
  {
    name: 'Standard User',
    email: 'user@example.com',
    role: 'user',
    org: 'Institutional Partner',
    phone: '+91 98765 43210'
  }
];

function getUsers() {
  try {
    const raw = localStorage.getItem('sackhe_users');
    if (!raw) {
      localStorage.setItem('sackhe_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
  } catch (e) {
    return INITIAL_USERS;
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem('sackhe_users', JSON.stringify(users));
  } catch (e) {}
}

function findUserByEmail(email) {
  if (!email) return null;
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Initial Auth State Helper Functions
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('sackhe_auth_user');
    if (!raw) return null;
    let parsed = null;
    if (raw.startsWith('{')) {
      parsed = JSON.parse(raw);
    }
    if (parsed && parsed.email) {
      // Re-verify against user store so stored role strictly reflects authoritative role
      const matched = findUserByEmail(parsed.email);
      if (matched) {
        return { ...parsed, role: matched.role };
      }
      return parsed;
    }
    // Fallback if stored as simple email/string
    const matched = findUserByEmail(raw);
    if (matched) return matched;
    return {
      name: raw.includes('@') ? raw.split('@')[0] : raw,
      email: raw.includes('@') ? raw : `${raw}@example.com`,
      role: 'user',
      org: 'Institutional Partner',
      phone: ''
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

// E-Commerce Cart State System
function getCart() {
  try {
    const data = localStorage.getItem('sackhe_cart');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('sackhe_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product, qty = 1, openDrawer = true) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image || 'home_view2.webp',
      quantity: qty
    });
  }
  saveCart(cart);
  showToast(`Added ${qty} × "${product.title}" to cart!`, 'success');
  if (openDrawer) {
    toggleCartDrawer(true);
  }
}

function updateCartItemQty(productId, delta) {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === productId);
  if (index > -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
  }
}

function removeCartItem(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function toggleCartDrawer(open = true) {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!overlay) return;
  if (open) {
    overlay.classList.add('active');
    renderCartDrawer();
  } else {
    overlay.classList.remove('active');
  }
}
window.toggleCartDrawer = toggleCartDrawer;

function updateCartUI() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById('cart-counter-badge');
  if (badge) {
    badge.textContent = totalCount;
    badge.classList.remove('cart-badge-pop');
    void badge.offsetWidth;
    badge.classList.add('cart-badge-pop');
  }

  const drawerCount = document.getElementById('cart-drawer-items-count');
  if (drawerCount) {
    drawerCount.textContent = `${totalCount} Item${totalCount === 1 ? '' : 's'}`;
  }

  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay && overlay.classList.contains('active')) {
    renderCartDrawer();
  }
}

function renderCartDrawer() {
  const cart = getCart();
  const body = document.getElementById('cart-drawer-body');
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  const totalEl = document.getElementById('cart-drawer-total');
  const footer = document.getElementById('cart-drawer-footer');

  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h4 class="cart-empty-title">Your Cart is Empty</h4>
        <p class="cart-empty-desc">Explore our zero-waste institutional hardware catalog to add items for procurement.</p>
        <button class="btn btn-primary" onclick="toggleCartDrawer(false); window.location.hash='#/products';" style="font-size: 0.88rem; padding: 0.65rem 1.25rem;">Explore Catalog</button>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += (item.price || 0) * (item.quantity || 1);
  });

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  body.innerHTML = cart.map(item => `
    <div class="cart-item-row" data-product-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-info">
        <div>
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-unit-price font-mono">₹${(item.price || 0).toLocaleString('en-IN')} / unit</div>
        </div>
        <div class="cart-item-bottom-bar">
          <div class="cart-qty-inline">
            <button class="cart-qty-btn" onclick="updateCartItemQty('${item.id}', -1)" aria-label="Decrease">&minus;</button>
            <span class="cart-qty-val font-mono">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="updateCartItemQty('${item.id}', 1)" aria-label="Increase">+</button>
          </div>
          <div class="cart-item-subtotal font-mono">₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}</div>
          <button class="cart-item-remove-btn" onclick="removeCartItem('${item.id}')" title="Remove item" aria-label="Remove item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}
window.updateCartItemQty = updateCartItemQty;
window.removeCartItem = removeCartItem;

// Routing Map
const routes = {
  '/': { templateId: 'page-home', title: 'Home - Sackhe Technologies' },
  '/about': { templateId: 'page-about', title: 'About Us - Sackhe Technologies' },
  '/products': { templateId: 'page-products', title: 'Products - Sackhe Technologies' },
  '/services': { templateId: 'page-services', title: 'Services - Sackhe Technologies' },
  '/initiatives': { templateId: 'page-initiatives', title: 'Initiatives - Sackhe Technologies' },
  '/contact': { templateId: 'page-contact', title: 'Contact Us - Sackhe Technologies' },
  '/checkout': { templateId: 'page-checkout', title: 'Procurement & Checkout - Sackhe Technologies' },
  '/profile': { templateId: 'page-profile', title: 'My Account & History - Sackhe Technologies', requiresAuth: true },
  '/admin': { templateId: 'page-admin', title: 'Admin Operations Console - Sackhe Technologies', requiresAdmin: true }
};

// Toast Notification System
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeClass = type === 'success' ? 'toast-success' : (type === 'error' ? 'toast-error' : '');
  toast.className = `toast ${typeClass}`.trim();
  
  const icon = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : (type === 'error'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`);

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
  const footerAdmin = document.getElementById('footer-admin-link');

  // Show admin links ONLY for authenticated users with role === 'admin'
  const isAdmin = Boolean(user && user.role === 'admin');
  if (adminNav) {
    adminNav.style.display = isAdmin ? 'inline-flex' : 'none';
  }
  if (footerAdmin) {
    footerAdmin.style.display = isAdmin ? 'inline-block' : 'none';
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
    let googleUser = findUserByEmail('user@gmail.com');
    if (!googleUser) {
      googleUser = {
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'user',
        org: 'Institutional Partner',
        phone: '+91 98765 43210'
      };
      const allUsers = getUsers();
      allUsers.push(googleUser);
      saveUsers(allUsers);
    }
    setCurrentUser(googleUser);
    toggleAuthModal(false);
    showToast('Signed in successfully with Google!', 'success');
    
    // Role-based redirect
    if (googleUser.role === 'admin') {
      window.location.hash = '#/admin';
    } else {
      if (window.location.hash === '#/admin') {
        window.location.hash = '#/';
      }
    }

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
  
  const fullHash = hash.substring(1);
  const [routePath, queryString] = fullHash.split('?');
  const route = routes[routePath] || routes['/'];
  const user = getCurrentUser();
  const queryParams = new URLSearchParams(queryString || '');

  // Authorization and Authentication route guards
  if (route.requiresAdmin) {
    if (!user || user.role !== 'admin') {
      showToast('Access denied. Administrator privileges required.', 'error');
      window.location.hash = '#/';
      return;
    }
  }

  if (route.requiresAuth) {
    if (!user) {
      showToast('Please sign in to access this page.', 'default');
      toggleAuthModal(true);
      window.location.hash = '#/';
      return;
    }
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
    const linkHref = link.getAttribute('href');
    if (linkHref === hash || linkHref === `#${routePath}`) {
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
    } else if (routePath === '/products') {
      setupProductsPage();
    } else if (routePath === '/services') {
      setupServicesPage();
    } else if (routePath === '/initiatives') {
      setupInitiativesPage();
    } else if (routePath === '/contact') {
      const selectedProduct = queryParams.get('product') || '';
      setupContactPage(selectedProduct);
    } else if (routePath === '/checkout') {
      setupCheckoutPage();
    } else if (routePath === '/profile') {
      setupProfilePage();
    } else if (routePath === '/admin') {
      setupAdminPage();
    }
  };

  const currentView = container.firstElementChild;
  if (currentView && currentView.getAttribute('data-route') === '/contact' && routePath === '/contact') {
    const selectedProduct = queryParams.get('product') || '';
    setupContactPage(selectedProduct);
    return;
  }

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

function setupProductsPage() {
  // Wire quantity buttons on products page
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute('data-target');
      const action = btn.getAttribute('data-qty-action');
      const input = document.getElementById(targetId);
      if (!input) return;
      let val = parseInt(input.value, 10) || 1;
      const min = parseInt(input.min, 10) || 1;
      const max = parseInt(input.max, 10) || 500;
      const step = (targetId === 'qty-pads' ? 5 : 1);
      if (action === 'inc' && val < max) {
        val += step;
      } else if (action === 'dec' && val > min) {
        val -= step;
        if (val < min) val = min;
      }
      input.value = val;
    };
  });

  // Wire Add to Cart buttons
  document.querySelectorAll('.product-add-cart-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-product-id');
      const title = btn.getAttribute('data-product-title');
      const price = parseInt(btn.getAttribute('data-product-price'), 10) || 0;
      const image = btn.getAttribute('data-product-img') || 'home_view2.webp';
      
      let qty = 1;
      if (id === 'incinerator') {
        qty = parseInt(document.getElementById('qty-incinerator')?.value, 10) || 1;
      } else if (id === 'sanitary-pad') {
        qty = parseInt(document.getElementById('qty-pads')?.value, 10) || 5;
      }
      
      addToCart({ id, title, price, image }, qty, true);
    };
  });

  // Wire Buy Now buttons
  document.querySelectorAll('.product-buy-now-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-product-id');
      const title = btn.getAttribute('data-product-title');
      const price = parseInt(btn.getAttribute('data-product-price'), 10) || 0;
      const image = btn.getAttribute('data-product-img') || 'home_view2.webp';
      
      let qty = 1;
      if (id === 'incinerator') {
        qty = parseInt(document.getElementById('qty-incinerator')?.value, 10) || 1;
      } else if (id === 'sanitary-pad') {
        qty = parseInt(document.getElementById('qty-pads')?.value, 10) || 5;
      }
      
      addToCart({ id, title, price, image }, qty, false);
      window.location.hash = '#/checkout';
    };
  });

  // Ensure contact inquiry links carry product param
  const cards = document.querySelectorAll('.product-split-card');
  cards.forEach(card => {
    const titleEl = card.querySelector('.product-title');
    if (!titleEl) return;
    const prodName = titleEl.textContent.trim();
    const targetHash = `#/contact?product=${encodeURIComponent(prodName)}`;
    
    const contactLinks = card.querySelectorAll('a[href*="#/contact"]');
    contactLinks.forEach(link => {
      link.href = targetHash;
      link.setAttribute('data-product', prodName);
      link.onclick = (e) => {
        e.preventDefault();
        window.location.hash = targetHash;
      };
    });
  });
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

function setupContactPage(selectedProduct = '') {
  // If not passed directly, parse from hash query string or search params
  if (!selectedProduct) {
    const fullHash = (window.location.hash || '').substring(1);
    const [, queryString] = fullHash.split('?');
    if (queryString) {
      const params = new URLSearchParams(queryString);
      selectedProduct = params.get('product') || params.get('item') || '';
    }
  }
  if (!selectedProduct && window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    selectedProduct = searchParams.get('product') || searchParams.get('item') || '';
  }

  const contactForm = document.getElementById('contact-inquiry-form');
  const productInput = document.getElementById('contact-product');
  const messageInput = document.getElementById('contact-message');

  // Pre-fill product and message if selected
  if (selectedProduct) {
    if (productInput) {
      productInput.value = selectedProduct;
      productInput.classList.add('product-selected-highlight');
    }
    if (messageInput) {
      messageInput.value = `I am interested in ordering / inquiring about the "${selectedProduct}". Please provide detailed pricing, availability, and delivery timelines.`;
    }
  } else if (productInput) {
    productInput.classList.remove('product-selected-highlight');
  }

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('.contact-submit-button');
    const originalContent = submitBtn ? submitBtn.innerHTML : 'Send Message';
    
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const orgInput = document.getElementById('contact-org');
    const prodVal = productInput?.value.trim() || selectedProduct || 'General Inquiry';
    const msgVal = messageInput?.value.trim() || 'Inquiry regarding Sackhe waste solutions.';
    
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
        organization: orgInput?.value || (prodVal ? `Inquiry: ${prodVal}` : 'Direct Contact Portal'),
        message: prodVal && prodVal !== 'General Inquiry' ? `[Product: ${prodVal}]\n${msgVal}` : msgVal,
        created_at: new Date().toISOString()
      };
      leads.unshift(newLead);
      saveLeads(leads);

      showToast(`Thank you! Your inquiry for ${prodVal} has been sent successfully.`, 'success');
      contactForm.reset();
      if (productInput && selectedProduct) {
        productInput.value = selectedProduct;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
      }
    }, 900);
  });
}

// Checkout & Procurement Page Handler
function setupCheckoutPage() {
  const cart = getCart();
  const checkoutItemsContainer = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal-val');
  const totalEl = document.getElementById('checkout-total-val');
  const placeOrderBtn = document.getElementById('checkout-place-order-btn');

  // Pre-fill user information if logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const phoneInput = document.getElementById('checkout-phone');
    const orgInput = document.getElementById('checkout-org');
    if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
    if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';
    if (orgInput && !orgInput.value) orgInput.value = currentUser.org || '';
  }

  // If cart is empty
  if (cart.length === 0) {
    if (checkoutItemsContainer) {
      checkoutItemsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.25rem;">Your procurement cart is currently empty.</p>
          <a href="#/products" class="btn btn-primary" style="display: inline-flex; font-size: 0.88rem;">Explore Catalog & Add Items</a>
        </div>
      `;
    }
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.opacity = '0.5';
    }
    return;
  }

  // Calculate totals
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += (item.price || 0) * (item.quantity || 1);
  });

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  // Render items
  if (checkoutItemsContainer) {
    checkoutItemsContainer.innerHTML = cart.map(item => `
      <div class="checkout-item-row">
        <img src="${item.image}" alt="${item.title}" class="checkout-item-thumb">
        <div class="checkout-item-details">
          <div class="checkout-item-name">${item.title}</div>
          <div class="checkout-item-qty font-mono">Qty: ${item.quantity} × ₹${(item.price || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="checkout-item-price font-mono">₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}</div>
      </div>
    `).join('');
  }

  // Wire Payment Tabs
  let activePaymentTab = 'upi';
  const paymentTabButtons = document.querySelectorAll('.payment-tab-btn');
  paymentTabButtons.forEach(btn => {
    btn.onclick = () => {
      paymentTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePaymentTab = btn.getAttribute('data-payment-tab');

      const upiPanel = document.getElementById('payment-content-upi');
      const bankPanel = document.getElementById('payment-content-bank');
      const poPanel = document.getElementById('payment-content-po');

      if (upiPanel) upiPanel.style.display = activePaymentTab === 'upi' ? 'block' : 'none';
      if (bankPanel) bankPanel.style.display = activePaymentTab === 'bank' ? 'block' : 'none';
      if (poPanel) poPanel.style.display = activePaymentTab === 'po' ? 'block' : 'none';
    };
  });

  // Handle Order Placement
  if (placeOrderBtn) {
    placeOrderBtn.disabled = false;
    placeOrderBtn.style.opacity = '1';

    placeOrderBtn.onclick = () => {
      const name = document.getElementById('checkout-name')?.value.trim();
      const org = document.getElementById('checkout-org')?.value.trim();
      const email = document.getElementById('checkout-email')?.value.trim();
      const phone = document.getElementById('checkout-phone')?.value.trim();
      const address = document.getElementById('checkout-address')?.value.trim();
      const city = document.getElementById('checkout-city')?.value.trim();
      const pincode = document.getElementById('checkout-pincode')?.value.trim();
      const notes = document.getElementById('checkout-notes')?.value.trim();

      if (!name || !org || !email || !phone || !address || !city || !pincode) {
        showToast('Please fill in all required delivery and contact fields.', 'default');
        return;
      }

      let paymentRef = '';
      if (activePaymentTab === 'upi') {
        paymentRef = document.getElementById('checkout-upi-utr')?.value.trim() || 'UPI-REF-' + Date.now().toString().slice(-6);
      } else if (activePaymentTab === 'bank') {
        const remitter = document.getElementById('checkout-remitter-bank')?.value.trim() || 'NEFT';
        const utr = document.getElementById('checkout-bank-utr')?.value.trim() || Date.now().toString().slice(-6);
        paymentRef = `${remitter} / UTR: ${utr}`;
      } else if (activePaymentTab === 'po') {
        paymentRef = 'PO Ref: ' + (document.getElementById('checkout-po-number')?.value.trim() || 'SANCTION-REQUEST');
      }

      // Generate order
      const orderRef = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      const orders = getOrders();
      const newOrder = {
        _id: 'ord-' + Date.now().toString().slice(-4),
        product_name: cart.map(i => `${i.quantity}× ${i.title}`).join(', '),
        quantity: cart.reduce((sum, i) => sum + i.quantity, 0),
        amount: subtotal,
        totalPrice: subtotal,
        status: 'Pending Verification',
        payment_status: activePaymentTab === 'po' ? 'PO Issued' : 'Under Review',
        payment_method: activePaymentTab.toUpperCase(),
        paymentRef: paymentRef,
        customer_name: name,
        organization: org,
        email: email,
        phone: phone,
        address: `${address}, ${city} - ${pincode}`,
        notes: notes,
        created_at: new Date().toISOString(),
        items: cart.map(i => ({
          productId: i.id,
          title: i.title,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity
        }))
      };

      orders.unshift(newOrder);
      saveOrders(orders);
      clearCart();

      // Show success celebration & navigate to Profile Orders table
      showToast(`Procurement Order ${orderRef} placed successfully!`, 'success');
      setTimeout(() => {
        window.location.hash = '#/profile';
      }, 500);
    };
  }
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
    // Show orders matching user's email, or all orders if admin
    const displayOrders = user.role === 'admin' 
      ? allOrders 
      : allOrders.filter(o => o.email.toLowerCase() === user.email.toLowerCase());

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

      // Look up authenticated user from user store or determine role
      let user = findUserByEmail(email);
      if (!user) {
        // Fallback for new sign-in
        user = {
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: 'user',
          org: 'Institutional Partner',
          phone: '+91 73372 38466'
        };
        const allUsers = getUsers();
        allUsers.push(user);
        saveUsers(allUsers);
      }

      setCurrentUser(user);
      toggleAuthModal(false);
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Role-based redirection:
      // 1. Authorized admin -> Open ONLY the Admin Dashboard (#/admin)
      // 2. Normal user -> Keep on existing website experience (do NOT open Admin Dashboard)
      if (user.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        if (window.location.hash === '#/admin') {
          window.location.hash = '#/';
        }
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

      let user = findUserByEmail(email);
      if (!user) {
        user = {
          name: name || 'Valued Partner',
          email: email,
          role: 'user',
          org: org || 'Institutional Partner',
          phone: '+91 73372 38466'
        };
        const allUsers = getUsers();
        allUsers.push(user);
        saveUsers(allUsers);
      }

      setCurrentUser(user);
      toggleAuthModal(false);
      showToast('Account registered successfully!', 'success');

      // Role-based redirection
      if (user.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        if (window.location.hash === '#/admin') {
          window.location.hash = '#/';
        }
      }
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

  // Initialize E-Commerce Cart UI & Event Listeners
  updateCartUI();

  const navCartBtn = document.getElementById('nav-cart-btn');
  if (navCartBtn) {
    navCartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCartDrawer(true);
    });
  }

  const cartCloseBtn = document.getElementById('cart-drawer-close');
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));
  }

  const cartContinueBtn = document.getElementById('cart-continue-btn');
  if (cartContinueBtn) {
    cartContinueBtn.addEventListener('click', () => toggleCartDrawer(false));
  }

  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      toggleCartDrawer(false);
      window.location.hash = '#/checkout';
    });
  }

  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) {
        toggleCartDrawer(false);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleCartDrawer(false);
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
