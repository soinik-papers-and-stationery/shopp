/**
 * Shoinik Paper & Stationeries - Main JavaScript
 * Handles: Navbar, Scroll effects, Reveal animations, Loading, Utils
 */

'use strict';

/* ============================================================
   PAGE LOADER
   ============================================================ */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 600);
  }
});

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initProgressBar() {
  const bar = document.getElementById('page-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
}

/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SCROLL REVEAL ANIMATIONS
   ============================================================ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const startVal = 0;

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target);
        if (suffix) {
          setTimeout(() => { el.textContent += suffix; }, 1850);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================================
   LAZY IMAGE LOADING
   ============================================================ */
function initLazyImages() {
  const images = document.querySelectorAll('img.lazy, img[loading="lazy"]');
  if (!images.length) return;

  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.addEventListener('load', () => img.classList.add('loaded'));
          img.addEventListener('error', () => img.classList.add('loaded')); // hide blur even on error
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    images.forEach(img => imgObserver.observe(img));
  } else {
    // Fallback: load all immediately
    images.forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }
}

/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
const Toast = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 3500) {
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      info: 'bi-info-circle-fill',
      warning: 'bi-exclamation-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div class="toast-icon"><i class="bi ${icons[type] || icons.info}"></i></div>
      <span class="toast-message">${sanitizeHTML(message)}</span>
      <button class="btn-close btn-close-sm ms-auto" aria-label="Close"></button>
    `;

    const closeBtn = toast.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    getContainer().appendChild(toast);

    const timer = setTimeout(() => removeToast(toast), duration);
    toast._timer = timer;

    return toast;
  }

  function removeToast(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  return { show };
})();

window.Toast = Toast;

/* ============================================================
   SANITIZE HTML (security)
   ============================================================ */
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.sanitizeHTML = sanitizeHTML;

/* ============================================================
   RIPPLE EFFECT ON BUTTONS
   ============================================================ */
function initRipple() {
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ============================================================
   ACTIVE NAV LINK HIGHLIGHTING
   ============================================================ */
function initActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ============================================================
   STAGGER CHILDREN ANIMATION
   ============================================================ */
function initStaggerChildren() {
  const containers = document.querySelectorAll('.stagger-children');
  if (!containers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  containers.forEach(c => observer.observe(c));
}

/* ============================================================
   SMOOTH ANCHOR SCROLL
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   CLOSE MOBILE NAV ON LINK CLICK
   ============================================================ */
function initMobileNavClose() {
  const toggler = document.querySelector('.navbar-toggler');
  const collapse = document.querySelector('.navbar-collapse');
  if (!toggler || !collapse) return;

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992 && collapse.classList.contains('show')) {
        toggler.click();
      }
    });
  });
}

/* ============================================================
   BRANDS CAROUSEL CLONE (infinite scroll)
   ============================================================ */
function initBrandsCarousel() {
  const inner = document.querySelector('.brands-inner');
  if (!inner) return;
  // Clone items for seamless looping
  const items = inner.innerHTML;
  inner.innerHTML = items + items;
}

/* ============================================================
   UTILITY: Format currency
   ============================================================ */
function formatCurrency(amount) {
  return '৳' + Number(amount).toLocaleString('en-BD');
}

window.formatCurrency = formatCurrency;

/* ============================================================
   UTILITY: Debounce
   ============================================================ */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

window.debounce = debounce;

/* ============================================================
   UTILITY: Truncate text
   ============================================================ */
function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

window.truncate = truncate;

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
function initLightbox() {
  const overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;

  const img = overlay.querySelector('.lightbox-img');
  const closeBtn = overlay.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item[data-full]').forEach(item => {
    item.addEventListener('click', () => {
      img.src = item.dataset.full;
      img.alt = item.dataset.caption || '';
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; }, 300);
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ============================================================
   CONTACT FORM HANDLER
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name = form.querySelector('[name="name"]')?.value?.trim();
    const phone = form.querySelector('[name="phone"]')?.value?.trim();
    const message = form.querySelector('[name="message"]')?.value?.trim();

    if (!name || !phone || !message) {
      Toast.show('Please fill all required fields.', 'error');
      return;
    }

    if (!/^[0-9+\s\-]{10,15}$/.test(phone)) {
      Toast.show('Please enter a valid phone number.', 'error');
      return;
    }

    // Since no backend, send via WhatsApp
    const text = `Hello Shoinik Paper & Stationeries!\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Message:* ${message}`;
    const url = `https://wa.me/8801724389919?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    Toast.show('Opening WhatsApp with your message!', 'success');
    form.reset();
  });
}

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initNavbar();
  initBackToTop();
  initScrollReveal();
  initCounters();
  initLazyImages();
  initRipple();
  initActiveNavLink();
  initStaggerChildren();
  initSmoothScroll();
  initMobileNavClose();
  initBrandsCarousel();
  initLightbox();
  initContactForm();
});
