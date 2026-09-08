// Sackhe Technologies - SPA Router & Application Logic

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
  try {
    localStorage.setItem('sackhe_orders', JSON.stringify(orders));
  } catch (e) {}
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
  try {
    localStorage.setItem('sackhe_leads', JSON.stringify(leads));
  } catch (e) {}
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
  try {
    localStorage.setItem('sackhe_cart', JSON.stringify(cart));
  } catch (e) {}
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
        navigateTo('/products');
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
  '/admin': {
    templateId: 'page-admin',
    title: 'Admin Operations Console - Sackhe Technologies',
    description: 'Oversee hardware procurements, process institutional orders, and review customer contact inquiries.',
    canonical: 'https://sackhetechnologies.com/admin'
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
  }, 3500);
}

// Dedicated Transmission Confirmation & Direct Dispatch Modal
function showDispatchModal(title, subtitle, bodyText, mailtoUrl) {
  const overlay = document.getElementById('dispatch-modal-overlay');
  const titleEl = document.getElementById('dispatch-modal-title');
  const subEl = document.getElementById('dispatch-modal-subtitle');
  const bodyEl = document.getElementById('dispatch-modal-body');
  const mailtoBtn = document.getElementById('dispatch-mailto-btn');
  const copyBtn = document.getElementById('dispatch-copy-btn');
  const copyBtnText = document.getElementById('dispatch-copy-btn-text');
  const copyFeedback = document.getElementById('dispatch-copy-feedback');
  const closeBtn = document.getElementById('close-dispatch-modal');

  if (!overlay) return;

  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (bodyEl) bodyEl.value = bodyText;
  if (mailtoBtn) mailtoBtn.href = mailtoUrl;

  const close = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };

  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(bodyText);
        } else {
          if (bodyEl) {
            bodyEl.select();
            document.execCommand('copy');
          }
        }
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        if (copyFeedback) copyFeedback.style.display = 'inline';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Body';
          if (copyFeedback) copyFeedback.style.display = 'none';
        }, 2500);
      } catch (err) {
        if (bodyEl) {
          bodyEl.select();
          document.execCommand('copy');
          if (copyBtnText) copyBtnText.textContent = 'Copied!';
          setTimeout(() => {
            if (copyBtnText) copyBtnText.textContent = 'Copy Body';
          }, 2500);
        }
      }
    };
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function navigateTo(path) {
  if (window.location.hash) {
    window.location.hash = `#${path.startsWith('/') ? path : '/' + path}`;
  } else {
    window.location.hash = `#${path.startsWith('/') ? path : '/' + path}`;
  }
}

// Dual Router (Supports both Path Routing and Hash Routing seamlessly)
let initialRouteChecked = false;
let routerTransitionTimer = null;

function router() {
  if (routerTransitionTimer) {
    clearTimeout(routerTransitionTimer);
    routerTransitionTimer = null;
  }

  // Dual resolution: Check hash first, then pathname
  let routePath = '/';
  let queryString = '';

  const hash = window.location.hash;
  const pathname = window.location.pathname;

  if (hash && hash.length > 1) {
    const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
    const [hPath, hQuery] = cleanHash.split('?');
    routePath = hPath.startsWith('/') ? hPath : `/${hPath}`;
    queryString = hQuery || '';
  } else if (pathname && pathname !== '/' && pathname !== '/index.html') {
    routePath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    queryString = window.location.search ? window.location.search.substring(1) : '';
  }

  const route = routes[routePath] || routes['/'];
  const queryParams = new URLSearchParams(queryString || '');

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
    if (linkHref === `#/` && routePath === '/') {
      link.classList.add('active');
    } else if (linkHref === `#${routePath}` || linkHref === routePath) {
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
      navigateTo('/checkout');
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

// Contact Page Handler with Transmission Confirmation & Direct Dispatch
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
        <span>Preparing Inquiry...</span>
      `;
    }

    setTimeout(() => {
      // Store lead for administrative tracking and interactive evaluation
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

      // Drafted formatted text
      const rawBody = 
`Dear Sackhe Technologies Team,

I would like to submit an inquiry regarding: ${prodVal}

Client Contact Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Organization: ${org}

Requirement / Notes:
${msgVal}

Best regards,
${name}`;

      const mailtoSubject = encodeURIComponent(`[Website Inquiry] ${prodVal} - ${name} (${org})`);
      const mailtoUrl = `mailto:info@sackhetechnologies.com?subject=${mailtoSubject}&body=${encodeURIComponent(rawBody)}`;

      // Present dedicated transmission dialog
      showDispatchModal('Inquiry Draft Ready', `Addressed to info@sackhetechnologies.com`, rawBody, mailtoUrl);
      showToast('Inquiry draft prepared. Please send via your email client or copy details.', 'success');

      contactForm.reset();
      if (productInput && selectedProduct) {
        productInput.value = selectedProduct;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
      }
    }, 400);
  });
}

// Checkout & Institutional Procurement Page Handler
function setupCheckoutPage() {
  const cart = getCart();
  const checkoutItemsContainer = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal-val');
  const totalEl = document.getElementById('checkout-total-val');
  const placeOrderBtn = document.getElementById('checkout-place-order-btn');

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

      // Itemized requisition text
      const itemizedList = newOrder.items.map(i => `• ${i.quantity}× ${i.title} (₹${(i.unitPrice * i.quantity).toLocaleString('en-IN')})`).join('\n');
      const rawBody = 
`Dear Sackhe Technologies Procurement Desk,

A formal procurement requisition has been submitted:

Requisition Reference: ${orderRef}
Organization: ${org}
Contact Person: ${name}
Email: ${email}
Phone: ${phone}
Delivery Address: ${address}, ${city} - ${pincode}

Procurement Items:
${itemizedList}

Total Estimated Requisition Value: ₹${subtotal.toLocaleString('en-IN')}
Payment / Requisition Mode: ${activePaymentTab.toUpperCase()}
Reference / Sanction Note: ${paymentRef}
${notes ? `Special Instructions: ${notes}\n` : ''}
Please issue a formal Proforma Invoice and dispatch timeline.

Best regards,
${name}`;

      const mailtoSubject = encodeURIComponent(`[Procurement Order ${orderRef}] ${org} - ${name}`);
      const mailtoUrl = `mailto:info@sackhetechnologies.com?subject=${mailtoSubject}&body=${encodeURIComponent(rawBody)}`;

      // Present dedicated transmission modal
      showDispatchModal('Procurement Requisition Drafted', `Requisition Ref: ${orderRef}`, rawBody, mailtoUrl);
      showToast(`Requisition ${orderRef} draft prepared. Please dispatch via email or copy details.`, 'success');
      
      // Re-render empty cart view
      setupCheckoutPage();
    };
  }
}

// Admin Page Handler (Interactive Demo Mode Preview)
function setupAdminPage() {
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
  // Route matching with hashchange and popstate support
  router();
  window.addEventListener('hashchange', router);
  window.addEventListener('popstate', router);

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
      navigateTo('/checkout');
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
      const dispatchOverlay = document.getElementById('dispatch-modal-overlay');
      if (dispatchOverlay && dispatchOverlay.classList.contains('active')) {
        dispatchOverlay.classList.remove('active');
        document.body.style.overflow = '';
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
