/**
 * Shoinik Paper & Stationeries - Shopping Cart
 * Handles: Add/Remove/Update items, localStorage persistence, UI rendering
 */

'use strict';

const Cart = (() => {
  const STORAGE_KEY = 'shoinik-cart';

  /* ---- State ---- */
  let items = [];

  /* ---- Load from localStorage ---- */
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      items = saved ? JSON.parse(saved) : [];
    } catch {
      items = [];
    }
  }

  /* ---- Save to localStorage ---- */
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  /* ---- Get all items ---- */
  function getItems() {
    return [...items];
  }

  /* ---- Get item by id ---- */
  function getItem(id) {
    return items.find(i => i.id === id);
  }

  /* ---- Add item ---- */
  function add(product, qty = 1) {
    const existing = getItem(product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 99);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        qty: Math.min(qty, 99)
      });
    }
    save();
    render();
    updateBadge();
    if (typeof Toast !== 'undefined') {
      Toast.show(`"${truncate(product.name, 30)}" added to cart!`, 'success');
    }
    // Animate cart badge
    const badge = document.querySelector('.cart-count');
    if (badge) {
      badge.classList.remove('animate');
      void badge.offsetWidth; // reflow
      badge.classList.add('animate');
    }
  }

  /* ---- Remove item ---- */
  function remove(id) {
    items = items.filter(i => i.id !== id);
    save();
    render();
    updateBadge();
  }

  /* ---- Update quantity ---- */
  function updateQty(id, qty) {
    const item = getItem(id);
    if (!item) return;
    if (qty < 1) {
      remove(id);
    } else {
      item.qty = Math.min(qty, 99);
      save();
      render();
      updateBadge();
    }
  }

  /* ---- Clear cart ---- */
  function clear() {
    items = [];
    save();
    render();
    updateBadge();
  }

  /* ---- Get total item count ---- */
  function getCount() {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  /* ---- Get subtotal ---- */
  function getSubtotal() {
    return items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  }

  /* ---- Update nav badge ---- */
  function updateBadge() {
    const count = getCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count > 99 ? '99+' : count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ---- Render cart sidebar ---- */
  function render() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('cart-empty');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '';
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (totalEl) totalEl.textContent = formatCurrency(0);
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="${sanitizeHTML(item.image)}" alt="${sanitizeHTML(item.name)}"
               onerror="this.src='assets/images/products/placeholder.svg'"
               width="44" height="44">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name" title="${sanitizeHTML(item.name)}">${sanitizeHTML(truncate(item.name, 28))}</div>
          <div class="cart-item-price">${formatCurrency(item.price * item.qty)}</div>
          <div class="qty-control mt-1">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease">
              <i class="bi bi-dash"></i>
            </button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase">
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
        <button class="btn btn-sm btn-link text-danger p-1 ms-auto" 
                data-action="remove" data-id="${item.id}" aria-label="Remove item">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = formatCurrency(getSubtotal());

    // Bind qty/remove buttons
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const action = btn.dataset.action;
        const item = getItem(id);
        if (!item) return;

        if (action === 'inc') updateQty(id, item.qty + 1);
        else if (action === 'dec') updateQty(id, item.qty - 1);
        else if (action === 'remove') remove(id);
      });
    });
  }

  /* ---- Open/close sidebar ---- */
  function openSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    render();
  }

  function closeSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  /* ---- Build formatted order text for WhatsApp ---- */
  function buildOrderText(customerInfo = {}) {
    const { name = 'N/A', phone = 'N/A', address = 'N/A', area = 'N/A', notes = '', payment = 'Cash on Delivery' } = customerInfo;
    const itemLines = items.map(i => `  • ${i.name} × ${i.qty} = ${formatCurrency(i.price * i.qty)}`).join('\n');
    const subtotal = getSubtotal();
    const delivery = 50;
    const total = subtotal + delivery;

    return `🛍️ *New Order - Shoinik Paper & Stationeries*

👤 *Customer:* ${name}
📞 *Phone:* ${phone}
📍 *Address:* ${address}
🏘️ *Area:* ${area}
💳 *Payment:* ${payment}

📦 *Order Items:*
${itemLines}

💰 *Subtotal:* ${formatCurrency(subtotal)}
🚚 *Delivery:* ${formatCurrency(delivery)}
✅ *Total:* ${formatCurrency(total)}

${notes ? `📝 *Notes:* ${notes}` : ''}

Thank you for ordering from Shoinik Paper & Stationeries! 🙏`;
  }

  /* ---- Init ---- */
  function init() {
    load();
    updateBadge();
    render();

    // Bind cart toggle buttons
    document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
      btn.addEventListener('click', openSidebar);
    });

    // Close button
    document.querySelectorAll('[data-action="close-cart"]').forEach(btn => {
      btn.addEventListener('click', closeSidebar);
    });

    // Overlay click to close
    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Checkout button in sidebar → go to order page
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        closeSidebar();
        window.location.href = 'order.html';
      });
    }

    // Add to cart buttons (product cards)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="add-to-cart"]');
      if (!btn) return;
      const productId = parseInt(btn.dataset.productId, 10);
      // Find product data from window.Products if available
      if (window.Products) {
        const product = window.Products.getById(productId);
        if (product) add(product);
      }
    });
  }

  return {
    init,
    add,
    remove,
    updateQty,
    clear,
    getItems,
    getCount,
    getSubtotal,
    openSidebar,
    closeSidebar,
    buildOrderText,
    updateBadge
  };
})();

document.addEventListener('DOMContentLoaded', () => Cart.init());
window.Cart = Cart;
