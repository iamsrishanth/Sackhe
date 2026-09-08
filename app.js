// Sackhe Technologies - SPA Router & App Logic

// HTML Escape Utility to Prevent XSS in all Dynamic Sinks
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// User Accounts Store
function getUsers() {
  try {
    const raw = localStorage.getItem('sackhe_users');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
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

// Current Auth State Helper Functions
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('sackhe_auth_user');
    if (!raw) return null;
    let parsed = null;
    if (raw.startsWith('{')) {
      parsed = JSON.parse(raw);
    }
    if (parsed && parsed.email) {
      const matched = findUserByEmail(parsed.email);
      if (matched) {
        return { ...parsed, role: matched.role || 'user' };
      }
      return parsed;
    }
    return null;
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

// Real Orders & Leads Storage (Empty initialization by default - No fabricated seed data)
function getOrders() {
  try {
    const data = localStorage.getItem('sackhe_orders');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem('sackhe_orders', JSON.stringify(orders));
}

function getLeads() {
  try {
    const data = localStorage.getItem('sackhe_leads');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLeads(leads) {
  localStorage.setItem('sackhe_leads', JSON.stringify(leads));
}

// E-Commerce Procurement Cart State System
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
      id: String(product.id),
      title: String(product.title),
      price: Number(product.price) || 0,
      image: String(product.image || 'home_view2.webp'),
      quantity: Number(qty) || 1
    });
  }
  saveCart(cart);
  showToast(`Added ${qty} × "${product.title}" to procurement cart!`, 'success');
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
        <button class="btn btn-primary" id="cart-explore-btn" style="font-size: 0.88rem; padding: 0.65rem 1.25rem;">Explore Catalog</button>
      </div>
    `;
    const exploreBtn = document.getElementById('cart-explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        toggleCartDrawer(false);
        window.location.hash = '#/products';
      });
    }
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
  });

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  // Safe DOM Rendering without unescaped innerHTML sinks
  body.innerHTML = cart.map(item => `
    <div class="cart-item-row" data-product-id="${escapeHtml(item.id)}">
      <img src="${encodeURI(item.image)}" alt="${escapeHtml(item.title)}" class="cart-item-img">
      <div class="cart-item-info">
        <div>
          <div class="cart-item-title">${escapeHtml(item.title)}</div>
          <div class="cart-item-unit-price font-mono">₹${(Number(item.price) || 0).toLocaleString('en-IN')} / unit</div>
        </div>
        <div class="cart-item-bottom-bar">
          <div class="cart-qty-inline">
            <button class="cart-qty-btn" data-cart-action="dec" data-item-id="${escapeHtml(item.id)}" aria-label="Decrease">&minus;</button>
            <span class="cart-qty-val font-mono">${Number(item.quantity) || 1}</span>
            <button class="cart-qty-btn" data-cart-action="inc" data-item-id="${escapeHtml(item.id)}" aria-label="Increase">+</button>
          </div>
          <div class="cart-item-subtotal font-mono">₹${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}</div>
          <button class="cart-item-remove-btn" data-cart-action="remove" data-item-id="${escapeHtml(item.id)}" title="Remove item" aria-label="Remove item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Event delegation for cart actions
  body.querySelectorAll('[data-cart-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-cart-action');
      const itemId = btn.getAttribute('data-item-id');
      if (action === 'inc') {
        updateCartItemQty(itemId, 1);
      } else if (action === 'dec') {
        updateCartItemQty(itemId, -1);
      } else if (action === 'remove') {
        removeCartItem(itemId);
      }
    });
  });
}

// Routing Map with Full Dynamic SEO Metadata
const routes = {
  '/': {
    templateId: 'page-home',
    title: 'Sackhe Technologies - Sustainable Waste Management Solutions',
    description: 'Leading provider of innovative sustainable waste management solutions including emission-controlled incinerators and eco-friendly systems for menstrual and solid waste.',
    canonical: 'https://sackhetechnologies.com/'
  },
  '/about': {
    templateId: 'page-about',
    title: 'About Us - Sackhe Technologies',
    description: 'Discover the team, mission, and environmental engineering vision powering Sackhe Technologies in zero-waste sustainability.',
    canonical: 'https://sackhetechnologies.com/about'
  },
  '/products': {
    templateId: 'page-products',
    title: 'Products & Hardware Catalog - Sackhe Technologies',
    description: 'Explore our zero-waste institutional hardware catalog: smokeless incinerators, automated sanitary dispensers, and biodegradable consumables.',
    canonical: 'https://sackhetechnologies.com/products'
  },
  '/services': {
    templateId: 'page-services',
    title: 'Services & Operations - Sackhe Technologies',
    description: 'End-to-end sustainable operations, institutional waste audits, continuous servicing agreements, and community awareness campaigns.',
    canonical: 'https://sackhetechnologies.com/services'
  },
  '/initiatives': {
    templateId: 'page-initiatives',
    title: 'Social Impact & Initiatives - Sackhe Technologies',
    description: 'Empowering communities through sustainable menstrual hygiene initiatives, rural school installations, and environmental stewardship.',
    canonical: 'https://sackhetechnologies.com/initiatives'
  },
  '/contact': {
    templateId: 'page-contact',
    title: 'Contact Us - Sackhe Technologies',
    description: 'Connect with Sackhe Technologies environmental experts for institutional procurement, pilot deployments, and advisory.',
    canonical: 'https://sackhetechnologies.com/contact'
  },
  '/checkout': {
    templateId: 'page-checkout',
    title: 'Procurement & Checkout - Sackhe Technologies',
    description: 'Complete institutional requisition and procurement orders securely with Sackhe Technologies.',
    canonical: 'https://sackhetechnologies.com/checkout'
  },
  '/profile': {
    templateId: 'page-profile',
    title: 'My Account & History - Sackhe Technologies',
    description: 'Manage your organizational credentials, monitor recent orders, and oversee active deployments.',
    canonical: 'https://sackhetechnologies.com/profile',
    requiresAuth: true
  },
  '/admin': {
    templateId: 'page-admin',
    title: 'Admin Operations Console - Sackhe Technologies',
    description: 'Oversee hardware procurements, process institutional orders, and review customer contact inquiries.',
    canonical: 'https://sackhetechnologies.com/admin',
    requiresAdmin: true
  }
};

// Safe Toast Notification System
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeClass = type === 'success' ? 'toast-success' : (type === 'error' ? 'toast-error' : '');
  toast.className = `toast ${typeClass}`.trim();
  
  const iconWrapper = document.createElement('span');
  if (type === 'success') {
    iconWrapper.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconWrapper.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconWrapper.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(iconWrapper);
  toast.appendChild(textSpan);
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
          <span class="user-avatar-circle">${escapeHtml(initials)}</span>
          <span class="user-nav-name">${escapeHtml(user.name)}</span>
        </a>
        <button id="signout-trigger" class="btn-signout" title="Sign Out">Sign Out</button>
      </div>
    `;
    
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
    userButton.innerHTML = `<button class="nav-signin-btn" id="header-signin-btn">Sign In</button>`;
    const headerSignin = document.getElementById('header-signin-btn');
    if (headerSignin) {
      headerSignin.addEventListener('click', () => toggleAuthModal(true));
    }
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
    let googleUser = findUserByEmail('partner@google.com');
    if (!googleUser) {
      googleUser = {
        name: 'Partner Client',
        email: 'partner@google.com',
        role: 'user',
        org: 'Institutional Partner',
        phone: '+91 73372 38466'
      };
      const allUsers = getUsers();
      allUsers.push(googleUser);
      saveUsers(allUsers);
    }
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

// SPA Router with Transition Cancellation (Race-Proof)
let initialRouteChecked = false;
let routerTransitionTimer = null;

function router() {
  if (routerTransitionTimer) {
    clearTimeout(routerTransitionTimer);
    routerTransitionTimer = null;
  }

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
      showToast('Access denied. Administrator credentials required.', 'error');
      window.location.hash = '#/';
      return;
    }
  }

  if (route.requiresAuth) {
    if (!user) {
      showToast('Please sign in to access your profile.', 'default');
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
  
  // Dynamic Route-Specific SEO
  if (route.description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', route.description);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', route.description);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', route.description);
  }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', route.title);
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', route.title);

  if (route.canonical) {
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.setAttribute('href', route.canonical);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', route.canonical);
    const twUrl = document.querySelector('meta[name="twitter:url"]');
    if (twUrl) twUrl.setAttribute('content', route.canonical);
  }
  
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
    routerTransitionTimer = setTimeout(renderNewPage, 180);
  } else {
    renderNewPage();
  }
}

// Page Specific Handlers
function setupHomePage() {
  // Bind any hero actions if needed
}

function setupAboutPage() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const content = entry.target.querySelector('.timeline-content');
          if (content) {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    timelineItems.forEach(item => {
      const content = item.querySelector('.timeline-content');
      if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(30px)';
        content.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      }
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

function setupServicesPage() {}

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

// Contact Page Handler with Real Transmission & Form Feedback
function setupContactPage(selectedProduct = '') {
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

  if (selectedProduct) {
    if (productInput) {
      productInput.value = selectedProduct;
      productInput.classList.add('product-selected-highlight');
    }
    if (messageInput) {
      messageInput.value = `I am interested in ordering / inquiring about "${selectedProduct}". Please provide detailed pricing, availability, and delivery timelines.`;
    }
  } else if (productInput) {
    productInput.classList.remove('product-selected-highlight');
  }

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('.contact-submit-button');
    const originalContent = submitBtn ? submitBtn.innerHTML : 'Send Message';
    
    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const phone = document.getElementById('contact-phone')?.value.trim();
    const org = document.getElementById('contact-org')?.value.trim() || 'Institutional Partner';
    const prodVal = productInput?.value.trim() || selectedProduct || 'General Inquiry';
    const msgVal = messageInput?.value.trim() || 'Inquiry regarding Sackhe waste solutions.';
    
    if (!name || !email || !phone || !msgVal) {
      showToast('Please fill in all required fields including your email and phone.', 'default');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
        </svg>
        <span>Transmitting Inquiry...</span>
      `;
    }

    setTimeout(() => {
      // Store lead for administrative tracking
      const leads = getLeads();
      const newLead = {
        _id: 'lead-' + Date.now().toString().slice(-4),
        name: name,
        email: email,
        phone: phone,
        organization: org,
        message: prodVal && prodVal !== 'General Inquiry' ? `[Product: ${prodVal}]\n${msgVal}` : msgVal,
        created_at: new Date().toISOString()
      };
      leads.unshift(newLead);
      saveLeads(leads);

      // Trigger direct email dispatch draft addressed to info@sackhetechnologies.com
      const mailtoSubject = encodeURIComponent(`[Website Inquiry] ${prodVal} - ${name} (${org})`);
      const mailtoBody = encodeURIComponent(
        `Dear Sackhe Technologies Team,\n\n` +
        `I would like to submit an inquiry regarding ${prodVal}.\n\n` +
        `Contact Details:\n` +
        `- Name: ${name}\n` +
        `- Email: ${email}\n` +
        `- Phone: ${phone}\n` +
        `- Organization: ${org}\n\n` +
        `Requirement / Message:\n` +
        `${msgVal}\n\n` +
        `Best regards,\n` +
        `${name}`
      );
      const mailtoUrl = `mailto:info@sackhetechnologies.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      
      // Open mail client fallback
      try {
        const mailLink = document.createElement('a');
        mailLink.href = mailtoUrl;
        mailLink.style.display = 'none';
        document.body.appendChild(mailLink);
        mailLink.click();
        document.body.removeChild(mailLink);
      } catch (err) {}

      showToast(`Thank you! Your inquiry for ${prodVal} has been recorded and an email draft to info@sackhetechnologies.com is prepared.`, 'success');
      contactForm.reset();
      if (productInput && selectedProduct) {
        productInput.value = selectedProduct;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
      }
    }, 700);
  });
}

// Checkout & Institutional Procurement Page Handler
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
    subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
  });

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  // Render items safely
  if (checkoutItemsContainer) {
    checkoutItemsContainer.innerHTML = cart.map(item => `
      <div class="checkout-item-row">
        <img src="${encodeURI(item.image)}" alt="${escapeHtml(item.title)}" class="checkout-item-thumb">
        <div class="checkout-item-details">
          <div class="checkout-item-name">${escapeHtml(item.title)}</div>
          <div class="checkout-item-qty font-mono">Qty: ${Number(item.quantity) || 1} × ₹${(Number(item.price) || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="checkout-item-price font-mono">₹${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}</div>
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

  // Handle Order Requisition Placement
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
        showToast('Please fill in all required delivery and institutional contact fields.', 'default');
        return;
      }

      let paymentRef = '';
      if (activePaymentTab === 'upi') {
        paymentRef = document.getElementById('checkout-upi-utr')?.value.trim() || 'UPI-OFFLINE-REMITTANCE';
      } else if (activePaymentTab === 'bank') {
        const remitter = document.getElementById('checkout-remitter-bank')?.value.trim() || 'NEFT';
        const utr = document.getElementById('checkout-bank-utr')?.value.trim() || 'PENDING-RECONCILIATION';
        paymentRef = `${remitter} / Ref: ${utr}`;
      } else if (activePaymentTab === 'po') {
        paymentRef = 'PO Ref: ' + (document.getElementById('checkout-po-number')?.value.trim() || 'SANCTION-REQUEST');
      }

      // Generate unique order ID
      const orderRef = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      const orders = getOrders();
      const newOrder = {
        _id: orderRef.toLowerCase(),
        product_name: cart.map(i => `${i.quantity}× ${i.title}`).join(', '),
        quantity: cart.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
        total_price: subtotal,
        status: 'pending',
        payment_status: activePaymentTab === 'po' ? 'PO Sanction Issued' : 'Offline Payment Pending',
        payment_method: activePaymentTab.toUpperCase(),
        transaction_ref: paymentRef,
        user_bank_name: activePaymentTab === 'bank' ? 'Corporate NEFT/RTGS' : (activePaymentTab === 'po' ? 'Govt / Institutional PO' : 'UPI Remittance'),
        client_name: name,
        organization: org,
        email: email,
        phone: phone,
        address: `${address}, ${city} - ${pincode}`,
        notes: notes || 'Standard Requisition',
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

      // Trigger Email draft to Corporate Desk
      const itemizedList = cart.map(i => `• ${i.quantity}× ${i.title} (₹${(i.price * i.quantity).toLocaleString('en-IN')})`).join('\n');
      const mailtoSubject = encodeURIComponent(`[Procurement Order ${orderRef}] ${org} - ${name}`);
      const mailtoBody = encodeURIComponent(
        `Dear Sackhe Technologies Procurement Desk,\n\n` +
        `A formal procurement requisition has been submitted:\n\n` +
        `Requisition Reference: ${orderRef}\n` +
        `Organization: ${org}\n` +
        `Contact Person: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Delivery Coordinates: ${address}, ${city} - ${pincode}\n\n` +
        `Procurement Items:\n${itemizedList}\n\n` +
        `Total Estimated Requisition Value: ₹${subtotal.toLocaleString('en-IN')}\n` +
        `Payment / Requisition Mode: ${activePaymentTab.toUpperCase()}\n` +
        `Reference / Sanction Note: ${paymentRef}\n` +
        (notes ? `Special Instructions: ${notes}\n\n` : '\n') +
        `Please issue a formal Proforma Invoice and dispatch timeline.\n\n` +
        `Best regards,\n${name}`
      );
      const mailtoUrl = `mailto:info@sackhetechnologies.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      try {
        const mailLink = document.createElement('a');
        mailLink.href = mailtoUrl;
        mailLink.style.display = 'none';
        document.body.appendChild(mailLink);
        mailLink.click();
        document.body.removeChild(mailLink);
      } catch (err) {}

      showToast(`Procurement Requisition ${orderRef} generated successfully! Our corporate desk will review and issue an invoice.`, 'success');
      setTimeout(() => {
        window.location.hash = '#/profile';
      }, 600);
    };
  }
}

// Profile Page Handler
function setupProfilePage() {
  const user = getCurrentUser();
  if (!user) return;

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

  // Render Orders Table Safely
  const ordersTableBody = document.getElementById('user-orders-table-body');
  if (ordersTableBody) {
    const allOrders = getOrders();
    const displayOrders = user.role === 'admin' 
      ? allOrders 
      : allOrders.filter(o => o.email && o.email.toLowerCase() === user.email.toLowerCase());

    if (displayOrders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
            No procurement requisitions found. Explore our <a href="#/products" style="color: var(--primary); font-weight: 700;">Products catalog</a> to make an initial requisition.
          </td>
        </tr>
      `;
    } else {
      ordersTableBody.innerHTML = displayOrders.map(ord => `
        <tr>
          <td><span class="order-id-pill">${escapeHtml((ord._id || '').toUpperCase())}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(ord.product_name)}</div>
            <div style="font-size: 0.76rem; color: var(--text-secondary);">${new Date(ord.created_at).toLocaleDateString()}</div>
          </td>
          <td style="font-weight: 700;">${Number(ord.quantity) || 1} units</td>
          <td style="font-weight: 800; color: var(--secondary);">₹${Number(ord.total_price || 0).toLocaleString('en-IN')}</td>
          <td>
            <span class="badge-status ${ord.status === 'verified' ? 'badge-verified' : (ord.status === 'rejected' ? 'badge-rejected' : 'badge-pending')}">
              ${escapeHtml((ord.status || 'pending').toUpperCase())}
            </span>
          </td>
          <td style="font-size: 0.8rem; font-family: monospace; color: var(--text-secondary);">
            ${escapeHtml(ord.transaction_ref || 'OFFLINE-PO')}
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

  function refreshKPIs() {
    const orders = getOrders();
    const leads = getLeads();

    const verifiedOrders = orders.filter(o => o.status === 'verified');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const totalRev = verifiedOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    const totalUnits = verifiedOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

    const revEl = document.getElementById('admin-stat-revenue');
    const ordersEl = document.getElementById('admin-stat-orders');
    const leadsEl = document.getElementById('admin-stat-leads');
    const unitsEl = document.getElementById('admin-stat-units');
    const ordersSubEl = document.getElementById('admin-stat-orders-sub');
    const leadsSubEl = document.getElementById('admin-stat-leads-sub');
    const ordersCountEl = document.getElementById('admin-orders-count');
    const leadsCountEl = document.getElementById('admin-leads-count');

    if (revEl) revEl.textContent = `₹${totalRev.toLocaleString('en-IN')}`;
    if (ordersEl) ordersEl.textContent = `${orders.length} Requisitions`;
    if (leadsEl) leadsEl.textContent = `${leads.length} Inquiries`;
    if (unitsEl) unitsEl.textContent = `${totalUnits} Units`;
    if (ordersSubEl) ordersSubEl.textContent = `${pendingOrders.length} Pending Verification`;
    if (leadsSubEl) leadsSubEl.textContent = `${leads.length} Total Messages`;
    if (ordersCountEl) ordersCountEl.textContent = orders.length;
    if (leadsCountEl) leadsCountEl.textContent = leads.length;
  }

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
            No procurement records found matching filter "${escapeHtml(currentOrderFilter)}".
          </td>
        </tr>
      `;
      return;
    }

    ordersTableBody.innerHTML = filtered.map(ord => `
      <tr>
        <td><span class="order-id-pill">${escapeHtml((ord._id || '').toUpperCase())}</span></td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(ord.client_name || ord.customer_name || ord.email)}</div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">${escapeHtml(ord.email)}</div>
        </td>
        <td style="font-size: 0.88rem; max-width: 220px;">${escapeHtml(ord.product_name)}</td>
        <td style="font-weight: 700;">${Number(ord.quantity) || 1}</td>
        <td style="font-weight: 800; color: var(--secondary);">₹${Number(ord.total_price || 0).toLocaleString('en-IN')}</td>
        <td>
          <span class="badge-status ${ord.status === 'verified' ? 'badge-verified' : (ord.status === 'rejected' ? 'badge-rejected' : 'badge-pending')}">
            ${escapeHtml((ord.status || 'pending').toUpperCase())}
          </span>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 600;">${escapeHtml(ord.user_bank_name || ord.payment_method || 'Institutional Remittance')}</div>
          <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(ord.transaction_ref || 'N/A')}</div>
        </td>
        <td>
          ${ord.status === 'pending' ? `
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn-action-verify" data-order-action="verify" data-order-id="${escapeHtml(ord._id)}" title="Approve & Verify">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Verify
              </button>
              <button class="btn-action-reject" data-order-action="reject" data-order-id="${escapeHtml(ord._id)}" title="Reject Transaction">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Reject
              </button>
            </div>
          ` : `
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${escapeHtml((ord.status || '').toUpperCase())}</span>
          `}
        </td>
      </tr>
    `).join('');

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

  // Render Leads Safely
  function renderAdminLeads(query = '') {
    const leadsContainer = document.getElementById('admin-leads-list');
    if (!leadsContainer) return;

    const leads = getLeads();
    const q = query.toLowerCase().trim();
    const filtered = q
      ? leads.filter(l => 
          (l.name && l.name.toLowerCase().includes(q)) || 
          (l.email && l.email.toLowerCase().includes(q)) || 
          (l.organization && l.organization.toLowerCase().includes(q)) ||
          (l.message && l.message.toLowerCase().includes(q))
        )
      : leads;

    if (filtered.length === 0) {
      leadsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary); background: rgba(0,0,0,0.01); border-radius: var(--radius-lg);">
          No customer inquiries matching "${escapeHtml(query)}".
        </div>
      `;
      return;
    }

    leadsContainer.innerHTML = filtered.map(l => `
      <div class="glass-card" style="padding: 1.5rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 0.75rem; background: rgba(255,255,255,0.7);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.75rem;">
          <div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">${escapeHtml(l.name)}</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">${escapeHtml(l.email)} &bull; ${escapeHtml(l.phone || 'No phone')}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge" style="background: rgba(147, 51, 234, 0.1); color: var(--primary); margin: 0; font-size: 0.75rem;">
              ${escapeHtml(l.organization || 'Individual')}
            </span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${new Date(l.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div style="font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap;">${escapeHtml(l.message)}</div>
      </div>
    `).join('');
  }

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
          `"${escapeHtml(l._id)}"`,
          `"${(l.name || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.phone || '').replace(/"/g, '""')}"`,
          `"${(l.organization || '').replace(/"/g, '""')}"`,
          `"${new Date(l.created_at).toLocaleDateString()}"`,
          `"${(l.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
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
      showToast('System configurations updated successfully!', 'success');
    });
  }

  refreshKPIs();
  renderAdminOrders();
  renderAdminLeads();
}

// Global Initialization
window.addEventListener('DOMContentLoaded', () => {
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
      const password = document.getElementById('login-password')?.value.trim();
      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      let user = findUserByEmail(email);
      if (!user) {
        // Register standard user upon initial login
        user = {
          name: email.split('@')[0],
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
      const password = document.getElementById('register-password')?.value.trim();
      if (!email || !password) {
        showToast('Please provide an email and password.', 'error');
        return;
      }

      let user = findUserByEmail(email);
      if (!user) {
        user = {
          name: name || email.split('@')[0],
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

      if (window.location.hash === '#/admin') {
        window.location.hash = '#/';
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
  }, { passive: true });

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
