// Sackhe Technologies - SPA Router & App Logic

// HTML Entity Sanitizer (XSS Mitigation)
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Dispatch Confirmation Modal for Direct Requisition Transmission
function openDispatchModal({ badge, title, desc, draft, mailtoUrl }) {
  const modal = document.getElementById('dispatch-confirm-modal');
  if (!modal) return;
  if (badge) {
    const b = document.getElementById('dispatch-modal-badge');
    if (b) b.textContent = badge;
  }
  if (title) {
    const t = document.getElementById('dispatch-modal-title');
    if (t) t.textContent = title;
  }
  if (desc) {
    const d = document.getElementById('dispatch-modal-desc');
    if (d) d.innerHTML = desc;
  }
  const preview = document.getElementById('dispatch-modal-preview');
  if (preview) preview.textContent = draft || '';
  const mailtoLink = document.getElementById('dispatch-mailto-link');
  if (mailtoLink && mailtoUrl) {
    mailtoLink.href = mailtoUrl;
  }
  const copyBtn = document.getElementById('dispatch-copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(draft || '').then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Text'; }, 2000);
      }).catch(() => {
        showToast('Unable to copy to clipboard', 'error');
      });
    };
  }
  modal.style.display = 'flex';
}

function closeDispatchModal() {
  const modal = document.getElementById('dispatch-confirm-modal');
  if (modal) modal.style.display = 'none';
}
window.closeDispatchModal = closeDispatchModal;
window.openDispatchModal = openDispatchModal;

// Real Orders & Leads Data Stores (Initialized Empty to eliminate fabricated business data)
const INITIAL_ORDERS = [];
const INITIAL_LEADS = [];

function getOrders() {
  try {
    const data = localStorage.getItem('sackhe_orders');
    if (!data) {
      localStorage.setItem('sackhe_orders', JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
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
    if (!data) {
      localStorage.setItem('sackhe_leads', JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
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
    <div class="cart-item-row" data-product-id="${escapeHtml(item.id)}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="cart-item-img">
      <div class="cart-item-info">
        <div>
          <div class="cart-item-title">${escapeHtml(item.title)}</div>
          <div class="cart-item-unit-price font-mono">₹${(Number(item.price) || 0).toLocaleString('en-IN')} / unit</div>
        </div>
        <div class="cart-item-bottom-bar">
          <div class="cart-qty-inline">
            <button class="cart-qty-btn" data-cart-action="dec" data-cart-id="${escapeHtml(item.id)}" aria-label="Decrease">&minus;</button>
            <span class="cart-qty-val font-mono">${escapeHtml(item.quantity)}</span>
            <button class="cart-qty-btn" data-cart-action="inc" data-cart-id="${escapeHtml(item.id)}" aria-label="Increase">+</button>
          </div>
          <div class="cart-item-subtotal font-mono">₹${((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}</div>
          <button class="cart-item-remove-btn" data-cart-action="remove" data-cart-id="${escapeHtml(item.id)}" title="Remove item" aria-label="Remove item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (!body._cartEventsBound) {
    body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-cart-action');
      const id = btn.getAttribute('data-cart-id');
      if (!id) return;
      if (action === 'dec') updateCartItemQty(id, -1);
      else if (action === 'inc') updateCartItemQty(id, 1);
      else if (action === 'remove') removeCartItem(id);
    });
    body._cartEventsBound = true;
  }
}
window.updateCartItemQty = updateCartItemQty;
window.removeCartItem = removeCartItem;

// Routing Map with Full Dynamic SEO Metadata
const routes = {
  '/': {
    templateId: 'page-home',
    title: 'Sackhe Technologies - Sustainable Waste Management Solutions',
    description: 'Leading provider of innovative sustainable waste management solutions including emission-controlled incinerators and eco-friendly systems for menstrual and solid waste.',
    canonical: 'https://sackhe.srishanth.com/'
  },
  '/about': {
    templateId: 'page-about',
    title: 'About Us - Sackhe Technologies',
    description: 'Discover the team, mission, and environmental engineering vision powering Sackhe Technologies in zero-waste sustainability.',
    canonical: 'https://sackhe.srishanth.com/'
  },
  '/products': {
    templateId: 'page-products',
    title: 'Products & Hardware Catalog - Sackhe Technologies',
    description: 'Explore our zero-waste institutional hardware catalog: smokeless incinerators, automated sanitary dispensers, and biodegradable consumables.',
    canonical: 'https://sackhe.srishanth.com/'
  },
  '/services': {
    templateId: 'page-services',
    title: 'Services & Operations - Sackhe Technologies',
    description: 'End-to-end sustainable operations, institutional waste audits, continuous servicing agreements, and community awareness campaigns.',
    canonical: 'https://sackhe.srishanth.com/'
  },
  '/initiatives': {
    templateId: 'page-initiatives',
    title: 'Social Impact & Initiatives - Sackhe Technologies',
    description: 'Empowering communities through sustainable menstrual hygiene initiatives, rural school installations, and environmental stewardship.',
    canonical: 'https://sackhe.srishanth.com/'
  },
  '/contact': {
    templateId: 'page-contact',
    title: 'Contact Us - Sackhe Technologies',
    description: 'Connect with Sackhe Technologies environmental experts for institutional procurement, pilot deployments, and advisory.',
    canonical: 'https://sackhe.srishanth.com/'
  },
  '/checkout': {
    templateId: 'page-checkout',
    title: 'Procurement & Checkout - Sackhe Technologies',
    description: 'Complete institutional requisition and procurement orders securely with Sackhe Technologies.',
    canonical: 'https://sackhe.srishanth.com/'
  }
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

  toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// SPA Router
let initialRouteChecked = false;
let routeTransitionTimer = null;
let currentRouteToken = 0;

function router() {
  const thisRouteToken = ++currentRouteToken;
  if (routeTransitionTimer) {
    clearTimeout(routeTransitionTimer);
    routeTransitionTimer = null;
  }

  let hash = window.location.hash;
  
  if (!hash || hash === '#') {
    hash = '#/';
  }
  
  const fullHash = hash.substring(1);
  const [routePath, queryString] = fullHash.split('?');
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
    if (thisRouteToken !== currentRouteToken) return;
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
    routeTransitionTimer = setTimeout(renderNewPage, 180);
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

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('.contact-submit-button');
    const originalContent = submitBtn ? submitBtn.innerHTML : 'Send Message';
    
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const orgInput = document.getElementById('contact-org');
    
    const nameVal = nameInput?.value.trim() || '';
    const emailVal = emailInput?.value.trim() || '';
    const phoneVal = phoneInput?.value.trim() || '';
    const orgVal = orgInput?.value.trim() || '';
    const prodVal = productInput?.value.trim() || selectedProduct || 'General Inquiry';
    const msgVal = messageInput?.value.trim() || 'Inquiry regarding Sackhe waste solutions.';
    
    if (!nameVal || !emailVal || !msgVal) {
      showToast('Please fill in your name, email address, and message.', 'error');
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

    const payload = {
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      organization: orgVal || 'Direct Contact Portal',
      product: prodVal,
      message: prodVal && prodVal !== 'General Inquiry' ? `[Product: ${prodVal}]\n${msgVal}` : msgVal
    };

    let apiResult = null;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        apiResult = await response.json();
      }
    } catch (err) {
      console.warn('Direct API transmission offline/fallback:', err);
    }

    const inquiryId = apiResult?.inquiryId || `INQ-${Date.now().toString().slice(-6)}`;
    const formattedDraft = apiResult?.formattedDraft || [
      'Sackhe Technologies - Contact & Inquiry Requisition',
      '====================================================',
      `Reference ID : ${inquiryId}`,
      `Timestamp    : ${new Date().toISOString()}`,
      `Contact Name : ${nameVal}`,
      `Email        : ${emailVal}`,
      `Phone        : ${phoneVal || 'Not provided'}`,
      `Organization : ${orgVal || 'Not provided'}`,
      `Interest     : ${prodVal || 'General Inquiry'}`,
      '',
      'Message:',
      payload.message,
      '===================================================='
    ].join('\n');

    const mailtoUrl = apiResult?.mailtoUrl || `mailto:info@sackhetechnologies.com?subject=${encodeURIComponent(`[Inquiry ${inquiryId}] ${prodVal || 'Inquiry'} - ${nameVal}`)}&body=${encodeURIComponent(formattedDraft)}`;

    openDispatchModal({
      badge: 'Inquiry Draft Prepared',
      title: 'Inquiry Ready for Direct Dispatch',
      desc: `Your inquiry has been formatted with Reference ID <strong>${escapeHtml(inquiryId)}</strong>. Click below to send directly to <strong>info@sackhetechnologies.com</strong>.`,
      draft: formattedDraft,
      mailtoUrl: mailtoUrl
    });

    showToast(`Inquiry ${inquiryId} prepared! Please send email or copy details.`, 'info');
    contactForm.reset();
    if (productInput && selectedProduct) {
      productInput.value = selectedProduct;
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }
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
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="checkout-item-thumb">
        <div class="checkout-item-details">
          <div class="checkout-item-name">${escapeHtml(item.title)}</div>
          <div class="checkout-item-qty font-mono">Qty: ${escapeHtml(item.quantity)} × ₹${(Number(item.price) || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="checkout-item-price font-mono">₹${((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}</div>
      </div>
    `).join('');
  }

  // Wire Payment Tabs
  let activePaymentTab = 'po';
  const paymentTabButtons = document.querySelectorAll('.payment-tab-btn');
  paymentTabButtons.forEach(btn => {
    btn.onclick = () => {
      paymentTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePaymentTab = btn.getAttribute('data-payment-tab') || 'po';

      const poPanel = document.getElementById('payment-content-po');
      const bankPanel = document.getElementById('payment-content-bank');
      const upiPanel = document.getElementById('payment-content-upi');

      if (poPanel) poPanel.style.display = activePaymentTab === 'po' ? 'block' : 'none';
      if (bankPanel) bankPanel.style.display = activePaymentTab === 'bank' ? 'block' : 'none';
      if (upiPanel) upiPanel.style.display = activePaymentTab === 'upi' ? 'block' : 'none';
    };
  });

  // Handle Order Placement
  if (placeOrderBtn) {
    placeOrderBtn.disabled = false;
    placeOrderBtn.style.opacity = '1';

    placeOrderBtn.onclick = async () => {
      const name = document.getElementById('checkout-name')?.value.trim();
      const org = document.getElementById('checkout-org')?.value.trim();
      const email = document.getElementById('checkout-email')?.value.trim();
      const phone = document.getElementById('checkout-phone')?.value.trim();
      const address = document.getElementById('checkout-address')?.value.trim();
      const city = document.getElementById('checkout-city')?.value.trim();
      const pincode = document.getElementById('checkout-pincode')?.value.trim();
      const notes = document.getElementById('checkout-notes')?.value.trim();

      if (!name || !org || !email || !phone || !address || !city || !pincode) {
        showToast('Please fill in all required institutional contact and delivery fields.', 'default');
        return;
      }

      let paymentRef = '';
      if (activePaymentTab === 'po') {
        const poNum = document.getElementById('checkout-po-number')?.value.trim();
        paymentRef = poNum ? `PO: ${poNum}` : 'Indent/PO Request';
      } else if (activePaymentTab === 'bank') {
        const remitter = document.getElementById('checkout-remitter-bank')?.value.trim();
        const utr = document.getElementById('checkout-bank-utr')?.value.trim();
        paymentRef = remitter || utr ? `${remitter || 'RTGS'} / Ref: ${utr || 'Direct'}` : 'Proforma Request';
      } else if (activePaymentTab === 'upi') {
        const upiRef = document.getElementById('checkout-upi-utr')?.value.trim();
        paymentRef = upiRef ? `Verification: ${upiRef}` : 'Corporate Desk';
      }

      const originalBtnHtml = placeOrderBtn.innerHTML;
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
        </svg>
        <span>Transmitting Requisition...</span>
      `;

      const orderPayload = {
        name,
        organization: org,
        email,
        phone,
        address,
        city,
        pincode,
        notes,
        payment_method: activePaymentTab.toUpperCase(),
        paymentRef,
        items: cart.map(i => ({
          productId: i.id,
          title: i.title,
          quantity: i.quantity,
          price: i.price
        }))
      };

      let apiResult = null;
      try {
        const res = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        if (res.ok) {
          apiResult = await res.json();
        }
      } catch (err) {
        console.warn('Direct order API transmission offline/fallback:', err);
      }

      const orderId = apiResult?.orderId || `ORD-${Date.now().toString().slice(-6)}`;
      const totalAmount = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
      const formattedTotal = totalAmount > 0 ? `₹${totalAmount.toLocaleString('en-IN')}` : 'Custom Engineering Quote';
      const itemsSummary = cart.map(it => `- ${it.title} x ${it.quantity} (₹${((it.price || 0) * it.quantity).toLocaleString('en-IN')})`).join('\n');

      const formattedDraft = apiResult?.formattedDraft || [
        'Sackhe Technologies - Institutional Procurement Requisition',
        '============================================================',
        `Requisition ID : ${orderId}`,
        `Timestamp      : ${new Date().toISOString()}`,
        `Organization   : ${org || 'Individual / Enterprise'}`,
        `Primary Contact: ${name}`,
        `Contact Email  : ${email}`,
        `Contact Phone  : ${phone}`,
        `Delivery Site  : ${address ? `${address}, ${city} - ${pincode}` : 'To be coordinated'}`,
        `Billing Method : ${orderPayload.payment_method}`,
        '',
        'Requisition Items:',
        itemsSummary,
        `Estimated Total: ${formattedTotal}`,
        '',
        'Procurement Notes:',
        notes || 'None provided',
        '============================================================',
        'Notice: This document constitutes a formal procurement inquiry and RFQ commitment.',
        'An official proforma invoice and technical schedule will be issued upon desk review.'
      ].join('\n');

      const mailtoUrl = apiResult?.mailtoUrl || `mailto:info@sackhetechnologies.com?subject=${encodeURIComponent(`[Procurement Requisition ${orderId}] ${org || name} - ${formattedTotal}`)}&body=${encodeURIComponent(formattedDraft)}`;

      clearCart();
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = originalBtnHtml;

      openDispatchModal({
        badge: 'Procurement Requisition Prepared',
        title: 'Requisition Ready for Direct Dispatch',
        desc: `Your institutional procurement order <strong>${escapeHtml(orderId)}</strong> has been prepared. Click below to send your formal commitment directly to <strong>info@sackhetechnologies.com</strong>.`,
        draft: formattedDraft,
        mailtoUrl: mailtoUrl
      });

      showToast(`Procurement requisition ${orderId} prepared! Please send email or copy details.`, 'info');
    };
  }
}

// Global Event Listeners
window.addEventListener('DOMContentLoaded', () => {
  // Route matching
  router();
  window.addEventListener('hashchange', router);

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
