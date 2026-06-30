/**
 * Shoinik Paper & Stationeries - Order System
 * Handles: Order form, cart summary on order page, WhatsApp order submission
 */

'use strict';

const OrderSystem = (() => {
  const WHATSAPP_NUMBER = '8801724389919'; // international format, no + or spaces
  const DELIVERY_FEE = 50;

  /* ---- Render order summary from cart ---- */
  function renderOrderSummary() {
    const container = document.getElementById('order-cart-summary');
    const totalEl = document.getElementById('order-total');
    const subtotalEl = document.getElementById('order-subtotal');
    const deliveryEl = document.getElementById('order-delivery');
    const submitBtn = document.getElementById('order-submit-btn');

    if (!container || !window.Cart) return;

    const items = Cart.getItems();

    if (!items.length) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="bi bi-cart-x"></i>
          <p>Your cart is empty.</p>
          <a href="products.html" class="btn-primary-custom mt-2">
            <i class="bi bi-shop"></i> Browse Products
          </a>
        </div>
      `;
      if (submitBtn) submitBtn.disabled = true;
      if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
      if (deliveryEl) deliveryEl.textContent = formatCurrency(0);
      if (totalEl) totalEl.textContent = formatCurrency(0);
      return;
    }

    if (submitBtn) submitBtn.disabled = false;

    container.innerHTML = items.map(item => `
      <div class="order-cart-item">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${sanitizeHTML(item.name)}" width="44" height="44"
               onerror="this.src='assets/images/products/placeholder.svg'">
        </div>
        <div class="flex-grow-1">
          <div style="font-weight:600;">${sanitizeHTML(item.name)}</div>
          <div class="text-muted-custom" style="font-size:0.8rem;">
            ${formatCurrency(item.price)} × ${item.qty}
          </div>
        </div>
        <div style="font-weight:700;color:var(--primary);">
          ${formatCurrency(item.price * item.qty)}
        </div>
        <div class="qty-control">
          <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">
            <i class="bi bi-dash"></i>
          </button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">
            <i class="bi bi-plus"></i>
          </button>
        </div>
      </div>
    `).join('');

    const subtotal = Cart.getSubtotal();
    const total = subtotal + DELIVERY_FEE;

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (deliveryEl) deliveryEl.textContent = formatCurrency(DELIVERY_FEE);
    if (totalEl) totalEl.textContent = formatCurrency(total);

    // Bind quantity buttons
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const action = btn.dataset.action;
        const item = Cart.getItems().find(i => i.id === id);
        if (!item) return;
        if (action === 'inc') Cart.updateQty(id, item.qty + 1);
        else if (action === 'dec') Cart.updateQty(id, item.qty - 1);
        renderOrderSummary();
      });
    });
  }

  /* ---- Validate form fields ---- */
  function validateForm(formData) {
    const errors = [];

    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Please enter your full name.');
    }

    if (!formData.phone || !/^(\+?880|0)1[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.push('Please enter a valid Bangladeshi phone number (e.g., 01724389919).');
    }

    if (!formData.address || formData.address.trim().length < 5) {
      errors.push('Please enter a complete delivery address.');
    }

    if (!formData.area || formData.area.trim().length < 2) {
      errors.push('Please enter your area/district.');
    }

    if (!Cart.getItems().length) {
      errors.push('Your cart is empty. Please add products before ordering.');
    }

    return errors;
  }

  /* ---- Sanitize input to prevent injection ---- */
  function sanitizeInput(str) {
    return str.replace(/[<>]/g, '').trim();
  }

  /* ---- Handle order form submission ---- */
  function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = {
      name: sanitizeInput(form.querySelector('[name="customerName"]')?.value || ''),
      phone: sanitizeInput(form.querySelector('[name="customerPhone"]')?.value || ''),
      address: sanitizeInput(form.querySelector('[name="customerAddress"]')?.value || ''),
      area: sanitizeInput(form.querySelector('[name="customerArea"]')?.value || ''),
      notes: sanitizeInput(form.querySelector('[name="orderNotes"]')?.value || ''),
      payment: form.querySelector('[name="paymentMethod"]:checked')?.value || 'Cash on Delivery'
    };

    const errors = validateForm(formData);

    if (errors.length) {
      Toast.show(errors[0], 'error');
      return;
    }

    // Build WhatsApp message
    const orderText = Cart.buildOrderText(formData);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText)}`;

    Toast.show('Opening WhatsApp to complete your order!', 'success');

    setTimeout(() => {
      window.open(url, '_blank');
    }, 600);
  }

  /* ---- Payment method selector UI ---- */
  function initPaymentSelector() {
    const options = document.querySelectorAll('.payment-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  }

  /* ---- Init order page ---- */
  function init() {
    const form = document.getElementById('order-form');
    if (!form) return;

    renderOrderSummary();
    initPaymentSelector();

    form.addEventListener('submit', handleSubmit);

    // Re-render summary if cart changes (e.g., from another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'shoinik-cart') {
        renderOrderSummary();
      }
    });
  }

  return { init, renderOrderSummary };
})();

document.addEventListener('DOMContentLoaded', () => OrderSystem.init());
window.OrderSystem = OrderSystem;
