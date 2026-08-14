(function () {
  const WHATSAPP_NUMBER = '6594577622';
  const STORAGE_KEY = 'street21sg_cart';

  let cart = loadCart();

  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsEl = document.getElementById('cart-items');
  const cartCountEl = document.getElementById('cart-count');
  const cartWhatsappBtn = document.getElementById('cart-whatsapp');
  const cartClearBtn = document.getElementById('cart-clear');

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
  }

  function flashError(el) {
    el.classList.add('field-error');
    setTimeout(() => el.classList.remove('field-error'), 900);
  }

  function addToCart(card) {
    const name = card.dataset.name;
    const variant = card.dataset.variant;
    const sizeSelect = card.querySelector('.size-select');
    const colorSelect = card.querySelector('.color-select');
    const size = sizeSelect ? sizeSelect.value : '';
    const color = colorSelect ? colorSelect.value : '';

    if (sizeSelect && !size) {
      flashError(sizeSelect);
      return;
    }
    if (colorSelect && !color) {
      flashError(colorSelect);
      return;
    }

    const key = [name, variant, size, color].join('|');
    const existing = cart.find((item) => item.key === key);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ key, name, variant, size, color, qty: 1 });
    }
    saveCart();
    renderCart();
    openCart();
  }

  function changeQty(key, delta) {
    const item = cart.find((i) => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.key !== key);
    }
    saveCart();
    renderCart();
  }

  function removeItem(key) {
    cart = cart.filter((i) => i.key !== key);
    saveCart();
    renderCart();
  }

  function renderCart() {
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    cartCountEl.textContent = totalQty;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Pick a design and size to get started.</p>';
      return;
    }

    cartItemsEl.innerHTML = cart.map((item) => `
      <div class="cart-item" data-key="${escapeHtml(item.key)}">
        <div class="cart-item-info">
          <p class="cart-item-name">${escapeHtml(item.name)}</p>
          <p class="cart-item-variant">${escapeHtml(item.variant)}${item.color ? ' · ' + escapeHtml(item.color) : ''} · Size ${escapeHtml(item.size)}</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn qty-minus" aria-label="Decrease quantity">&minus;</button>
          <span>${item.qty}</span>
          <button class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-item-remove" aria-label="Remove item">&times;</button>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildWhatsAppMessage() {
    let msg = 'Hi STREET21SG, I would like to order:\n\n';
    cart.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} (${item.variant}${item.color ? ', ' + item.color : ''}) - Size ${item.size} x${item.qty}\n`;
    });
    msg += '\nPlease confirm price and availability. Thank you!';
    return msg;
  }

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      addToCart(card);
    });
  });

  cartItemsEl.addEventListener('click', (e) => {
    const itemEl = e.target.closest('.cart-item');
    if (!itemEl) return;
    const key = itemEl.dataset.key;
    if (e.target.classList.contains('qty-plus')) changeQty(key, 1);
    if (e.target.classList.contains('qty-minus')) changeQty(key, -1);
    if (e.target.classList.contains('cart-item-remove')) removeItem(key);
  });

  cartClearBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
  });

  cartWhatsappBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      openCart();
      return;
    }
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });

  renderCart();
})();
