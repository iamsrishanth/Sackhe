// Sackhe Technologies - SPA Router & App Logic

// Initial Auth State
let currentUser = localStorage.getItem('sackhe_auth_user') || null;

// Routing Map
const routes = {
  '/': { templateId: 'page-home', title: 'Home - Sackhe Technologies' },
  '/about': { templateId: 'page-about', title: 'About Us - Sackhe Technologies' },
  '/products': { templateId: 'page-products', title: 'Products - Sackhe Technologies' },
  '/services': { templateId: 'page-services', title: 'Services - Sackhe Technologies' },
  '/initiatives': { templateId: 'page-initiatives', title: 'Initiatives - Sackhe Technologies' },
  '/contact': { templateId: 'page-contact', title: 'Contact Us - Sackhe Technologies' }
};

// Toast notification system
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  
  // Icon based on type
  const icon = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.style.animation = 'toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
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

// Update Auth UI elements
function updateAuthUI() {
  const userButton = document.getElementById('user-auth-btn');
  if (!userButton) return;

  if (currentUser) {
    userButton.innerHTML = `
      <div class="user-profile-nav" style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 0.88rem; font-weight: 600; color: #111827;">${currentUser}</span>
        <button id="signout-trigger" class="btn-signout" title="Sign Out">Sign Out</button>
      </div>
    `;
    
    // Bind sign out click
    const signOutBtn = document.getElementById('signout-trigger');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentUser = null;
        localStorage.removeItem('sackhe_auth_user');
        updateAuthUI();
        showToast('Successfully signed out.', 'default');
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
    currentUser = 'Google User';
    localStorage.setItem('sackhe_auth_user', currentUser);
    
    updateAuthUI();
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
  }, 1000);
}
window.handleGoogleSignIn = handleGoogleSignIn;

// SPA Router
function router() {
  let hash = window.location.hash;
  
  // Normalize empty or landing routes
  if (!hash || hash === '#') {
    hash = '#/';
  }
  
  const routePath = hash.substring(1); // removes '#'
  const route = routes[routePath] || routes['/']; // fallback to home
  
  const template = document.getElementById(route.templateId);
  const container = document.getElementById('app-view');
  
  if (!template || !container) {
    console.error('Template or target container not found');
    return;
  }
  
  // Set title
  document.title = route.title;
  
  // Update header active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    }
  });
  
  // Close mobile drawer on route change
  const navMenu = document.getElementById('nav-menu');
  const menuToggle = document.getElementById('menu-toggle');
  if (navMenu && menuToggle) {
    navMenu.classList.remove('open');
    menuToggle.classList.remove('open');
  }

  // Render transition orchestrator
  const renderNewPage = () => {
    container.innerHTML = '';
    const clone = template.content.cloneNode(true);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'view-enter';
    wrapper.appendChild(clone);
    container.appendChild(wrapper);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Trigger page-specific logic
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
    }
  };

  const currentView = container.firstElementChild;
  if (currentView) {
    // Fade out / exit animation first
    currentView.className = 'view-exit';
    setTimeout(renderNewPage, 300); // Wait for 300ms exit transition
  } else {
    // Immediate render on initial load
    renderNewPage();
  }
}

// Page Specific Handlers
function setupHomePage() {
  // Add quick specification click bindings if needed
}

function setupAboutPage() {
  // Timeline animations on scroll (IntersectionObserver)
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
  // Add animation details or support triggers
}

function setupInitiativesPage() {
  // Dynamic stats counting effect
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    const text = stat.textContent;
    const target = parseInt(text.replace(/[^0-9]/g, ''), 10);
    const hasPlus = text.includes('+');
    
    let current = 0;
    const duration = 1500; // ms
    const stepTime = 30; // ms
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
      showToast('Thank you! Your message has been sent successfully. Our team will get in touch with you shortly.', 'success');
      contactForm.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
      }
    }, 1000);
  });
}

// Theme toggle logic (Force Light Mode)
function initTheme() {
  document.documentElement.classList.remove('dark-mode');
  localStorage.removeItem('sackhe_theme');
}

// Global Event Listeners
window.addEventListener('DOMContentLoaded', () => {
  // Theme init
  initTheme();

  // Route matching
  router();
  window.addEventListener('hashchange', router);
  
  // Auth system init
  updateAuthUI();
  
  // Mobile nav toggler
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });

    // Close on clicking any nav link inside drawer
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
