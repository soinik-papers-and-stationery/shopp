/**
 * Shoinik Paper & Stationeries - Live Search
 * Handles: Navbar search dropdown, live filtering, keyboard navigation
 */

'use strict';

const Search = (() => {
  let searchInput, dropdown, products = [];
  let activeIndex = -1;

  /* ---- Wait for products to be loaded ---- */
  async function ensureProducts() {
    if (window.Products) {
      // Trigger load if not already loaded
      if (!window.Products.getAll().length) {
        await window.Products.loadData();
      }
      products = window.Products.getAll();
    }
  }

  /* ---- Render dropdown results ---- */
  function renderResults(query) {
    if (!dropdown) return;

    if (!query) {
      dropdown.classList.remove('visible');
      dropdown.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const matches = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.nameBn && p.nameBn.includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.includes(q)))
    ).slice(0, 8);

    if (!matches.length) {
      dropdown.innerHTML = `
        <div class="search-result-item" style="cursor:default;">
          <i class="bi bi-emoji-frown text-muted-custom"></i>
          <span class="text-muted-custom">No products found for "${sanitizeHTML(query)}"</span>
        </div>
      `;
      dropdown.classList.add('visible');
      return;
    }

    dropdown.innerHTML = matches.map((p, i) => `
      <a href="products.html?id=${p.id}" class="search-result-item" data-index="${i}">
        <img src="${p.image}" alt="" class="search-result-img" 
             onerror="this.src='assets/images/products/placeholder.svg'">
        <div class="flex-grow-1">
          <div style="font-size:0.88rem;font-weight:600;">${sanitizeHTML(p.name)}</div>
          <div style="font-size:0.78rem;color:var(--primary);font-weight:700;">${formatCurrency(p.price)}</div>
        </div>
      </a>
    `).join('') + `
      <a href="products.html?q=${encodeURIComponent(query)}" class="search-result-item" style="border-top:1px solid var(--border);font-weight:600;color:var(--primary);">
        <i class="bi bi-search"></i> View all results for "${sanitizeHTML(query)}"
      </a>
    `;

    dropdown.classList.add('visible');
    activeIndex = -1;
  }

  /* ---- Keyboard navigation ---- */
  function handleKeydown(e) {
    const items = dropdown.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      highlightItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightItem(items);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        items[activeIndex].click();
      } else {
        // Go to products page with search query
        window.location.href = `products.html?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('visible');
      searchInput.blur();
    }
  }

  function highlightItem(items) {
    items.forEach((item, i) => {
      item.style.background = i === activeIndex ? 'var(--bg-section)' : '';
    });
    if (items[activeIndex]) {
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  /* ---- Init ---- */
  async function init() {
    searchInput = document.getElementById('navbar-search');
    dropdown = document.getElementById('search-results-dropdown');

    if (!searchInput || !dropdown) return;

    await ensureProducts();

    searchInput.addEventListener('input', debounce((e) => {
      renderResults(e.target.value.trim());
    }, 250));

    searchInput.addEventListener('keydown', handleKeydown);

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) renderResults(searchInput.value.trim());
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('visible');
      }
    });

    // Search form submit
    const searchForm = document.getElementById('navbar-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) window.location.href = `products.html?q=${encodeURIComponent(q)}`;
      });
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Search.init());
window.Search = Search;
