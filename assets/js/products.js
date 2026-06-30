/**
 * Shoinik Paper & Stationeries - Products Manager
 * Handles: Loading product data, rendering cards, filtering, sorting
 */

'use strict';

const Products = (() => {
  let allProducts = [];
  let allCategories = [];
  let filtered = [];

  /* ---- Load JSON data ---- */
  async function loadData() {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('assets/data/products.json'),
        fetch('assets/data/categories.json')
      ]);
      allProducts = await prodRes.json();
      allCategories = await catRes.json();
      filtered = [...allProducts];
    } catch (err) {
      console.error('Failed to load product data:', err);
      allProducts = [];
      allCategories = [];
      filtered = [];
    }
  }

  /* ---- Get product by id ---- */
  function getById(id) {
    return allProducts.find(p => p.id === id) || null;
  }

  /* ---- Get all products ---- */
  function getAll() { return [...allProducts]; }

  /* ---- Get featured products ---- */
  function getFeatured(limit = 6) {
    return allProducts.filter(p => p.isFeatured).slice(0, limit);
  }

  /* ---- Get new arrivals ---- */
  function getNew(limit = 4) {
    return allProducts.filter(p => p.isNew).slice(0, limit);
  }

  /* ---- Get on offer ---- */
  function getOffer(limit = 8) {
    return allProducts.filter(p => p.isOffer).slice(0, limit);
  }

  /* ---- Filter and sort ---- */
  function filter({ category, search, minPrice, maxPrice, sort } = {}) {
    filtered = allProducts.filter(p => {
      if (category && category !== 'all' && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = p.name.toLowerCase().includes(q) ||
          (p.nameBn && p.nameBn.includes(q)) ||
          (p.tags && p.tags.some(t => t.includes(q))) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (minPrice !== undefined && p.price < minPrice) return false;
      if (maxPrice !== undefined && p.price > maxPrice) return false;
      return true;
    });

    // Sort
    switch (sort) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'newest': filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'popular': filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
      case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break; // default order
    }

    return [...filtered];
  }

  /* ---- Generate star rating HTML ---- */
  function starsHTML(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '<i class="bi bi-star-fill"></i>'.repeat(full) +
      (half ? '<i class="bi bi-star-half"></i>' : '') +
      '<i class="bi bi-star"></i>'.repeat(empty)
    );
  }

  /* ---- Calculate discount % ---- */
  function discountPct(price, original) {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  }

  /* ---- Render product card HTML ---- */
  function renderCard(product) {
    const disc = discountPct(product.price, product.originalPrice);
    const badges = [];
    if (product.isNew) badges.push('<span class="product-badge badge-new">New</span>');
    if (disc > 0) badges.push(`<span class="product-badge badge-sale">-${disc}%</span>`);

    return `
      <div class="product-card reveal" role="article">
        <div class="product-card-img-wrapper">
          ${badges.join('')}
          <img src="${product.image}"
               alt="${sanitizeHTML(product.name)}"
               class="lazy"
               loading="lazy"
               onerror="this.src='assets/images/products/placeholder.svg'"
               width="130" height="130">
          <div class="product-card-overlay">
            <button class="product-card-overlay-btn" 
                    data-action="add-to-cart" 
                    data-product-id="${product.id}"
                    title="Add to Cart" aria-label="Add to cart">
              <i class="bi bi-cart-plus"></i>
            </button>
            <a href="products.html?id=${product.id}" 
               class="product-card-overlay-btn" 
               title="View Details" aria-label="View product details">
              <i class="bi bi-eye"></i>
            </a>
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-card-category">${sanitizeHTML(product.category)}</div>
          <h3 class="product-card-name">${sanitizeHTML(product.name)}</h3>
          <div class="product-card-rating" aria-label="Rating: ${product.rating} out of 5">
            <span class="stars">${starsHTML(product.rating)}</span>
            <span class="rating-count">(${product.reviews || 0})</span>
          </div>
          <div class="product-card-price">
            <span class="price-current" aria-label="Price: ${formatCurrency(product.price)}">${formatCurrency(product.price)}</span>
            ${disc > 0 ? `
              <span class="price-original" aria-label="Original price: ${formatCurrency(product.originalPrice)}">${formatCurrency(product.originalPrice)}</span>
              <span class="price-discount">${disc}% off</span>
            ` : ''}
          </div>
          <button class="btn-add-cart btn-ripple"
                  data-action="add-to-cart"
                  data-product-id="${product.id}"
                  aria-label="Add ${sanitizeHTML(product.name)} to cart">
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  }

  /* ---- Render skeleton cards ---- */
  function renderSkeletons(container, count = 6) {
    if (!container) return;
    container.innerHTML = Array(count).fill('').map(() => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
    `).join('');
  }

  /* ---- Render into a container ---- */
  function renderToContainer(container, products) {
    if (!container) return;
    if (!products.length) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-search" style="font-size:3rem;color:var(--text-muted)"></i>
          <p class="mt-3 text-muted-custom">No products found. Try a different filter.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = products.map(p => `<div class="col">${renderCard(p)}</div>`).join('');

    // Re-init lazy loading for new images
    if (window.initLazyImages) window.initLazyImages();
  }

  /* ---- Render category grid ---- */
  async function renderCategories(container) {
    if (!container || !allCategories.length) return;
    container.innerHTML = allCategories.map(cat => `
      <div class="col">
        <a href="products.html?category=${cat.id}" 
           class="category-card reveal"
           aria-label="Browse ${cat.name} products">
          <div class="category-icon-wrap" style="background:${cat.color}">
            <i class="bi ${cat.icon}"></i>
          </div>
          <div class="category-name">${sanitizeHTML(cat.name)}</div>
          <div class="category-desc">${sanitizeHTML(cat.description)}</div>
        </a>
      </div>
    `).join('');
  }

  /* ---- Init home page featured products ---- */
  async function initHomeFeatured() {
    const container = document.getElementById('featured-products-grid');
    if (!container) return;

    renderSkeletons(container, 6);
    await loadData();
    const featured = getFeatured(6);
    renderToContainer(container, featured);

    // Re-init scroll reveal
    if (window.initScrollReveal) setTimeout(window.initScrollReveal, 100);
  }

  /* ---- Init home categories ---- */
  async function initHomeCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    await loadData();
    await renderCategories(container);
    if (window.initScrollReveal) setTimeout(window.initScrollReveal, 100);
  }

  /* ---- Init products page ---- */
  async function initProductsPage() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    renderSkeletons(container, 8);
    await loadData();

    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const initCategory = params.get('category') || 'all';
    const initSearch = params.get('q') || '';
    const initSort = params.get('sort') || 'popular';

    // Set initial filter values
    const catSelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('filter-sort');
    const searchInput = document.getElementById('products-search');

    if (catSelect) catSelect.value = initCategory;
    if (sortSelect) sortSelect.value = initSort;
    if (searchInput) searchInput.value = initSearch;

    // Populate category options
    if (catSelect) {
      const existing = catSelect.innerHTML;
      const options = allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      catSelect.innerHTML = existing + options;
      catSelect.value = initCategory;
    }

    // Populate category filter checkboxes
    const catFilterContainer = document.getElementById('category-filters');
    if (catFilterContainer) {
      catFilterContainer.innerHTML = allCategories.map(c => `
        <label class="filter-option">
          <input type="checkbox" value="${c.id}" 
                 ${initCategory === c.id ? 'checked' : ''}
                 onchange="handleCategoryFilter(this)">
          ${sanitizeHTML(c.name)}
        </label>
      `).join('');
    }

    // Expose global filter handler
    window.handleCategoryFilter = function(checkbox) {
      if (checkbox.checked) {
        // Uncheck others (single select behavior)
        document.querySelectorAll('#category-filters input').forEach(cb => {
          if (cb !== checkbox) cb.checked = false;
        });
        applyFilters({ category: checkbox.value });
      } else {
        applyFilters({ category: 'all' });
      }
    };

    // Apply initial filters
    applyFilters({ category: initCategory, search: initSearch, sort: initSort });

    // Bind filter events
    if (sortSelect) {
      sortSelect.addEventListener('change', () => applyFilters());
    }

    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => applyFilters(), 300));
    }

    // Price range
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice) minPrice.addEventListener('change', () => applyFilters());
    if (maxPrice) maxPrice.addEventListener('change', () => applyFilters());
  }

  /* ---- Collect current filter values and apply ---- */
  function applyFilters(overrides = {}) {
    const catSelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('filter-sort');
    const searchInput = document.getElementById('products-search');
    const minPriceEl = document.getElementById('min-price');
    const maxPriceEl = document.getElementById('max-price');
    const resultCount = document.getElementById('result-count');
    const container = document.getElementById('products-grid');

    const options = {
      category: overrides.category ?? (catSelect?.value || 'all'),
      search: overrides.search ?? (searchInput?.value?.trim() || ''),
      sort: overrides.sort ?? (sortSelect?.value || 'popular'),
      minPrice: minPriceEl ? (parseInt(minPriceEl.value) || undefined) : undefined,
      maxPrice: maxPriceEl ? (parseInt(maxPriceEl.value) || undefined) : undefined,
    };

    const results = filter(options);

    if (resultCount) {
      resultCount.textContent = `${results.length} product${results.length !== 1 ? 's' : ''} found`;
    }

    renderToContainer(container, results);
    if (window.initScrollReveal) setTimeout(() => initScrollReveal(), 100);
  }

  window.applyFilters = applyFilters;

  /* ---- Init offers page ---- */
  async function initOffersPage() {
    const container = document.getElementById('offer-products-grid');
    if (!container) return;

    renderSkeletons(container, 4);
    await loadData();
    const offerProducts = getOffer(8);
    renderToContainer(container, offerProducts);
  }

  return {
    loadData,
    getAll,
    getById,
    getFeatured,
    getNew,
    getOffer,
    filter,
    renderCard,
    renderToContainer,
    renderSkeletons,
    initHomeFeatured,
    initHomeCategories,
    initProductsPage,
    initOffersPage
  };
})();

window.Products = Products;

/* ---- Auto-init based on current page ---- */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '') {
    Products.initHomeFeatured();
    Products.initHomeCategories();
  } else if (page === 'products.html') {
    Products.initProductsPage();
  } else if (page === 'offers.html') {
    Products.initOffersPage();
  } else if (page === 'order.html') {
    Products.loadData(); // preload for order page
  }
});
