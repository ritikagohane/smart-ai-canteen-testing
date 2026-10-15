/**
 * CartView Component
 * Manages cart drawer, quantities, subtotal, checkout simulation, and order token issuance.
 */
export class CartView {
  constructor({ onOrderPlaced, getStudent }) {
    this.items = new Map(); // itemId -> { item, quantity, subtotal }
    this.isOpen = false;
    this.onOrderPlaced = onOrderPlaced;
    this.getStudent = getStudent || (() => ({ name: "Campus Student", id: "STU-GEN", avatar: "👤" }));
    this.tokenCounter = 101;

    this.initDOM();
    this.bindEvents();
    this.updateUI();
  }

  initDOM() {
    // Create cart drawer
    const drawer = document.createElement("div");
    drawer.id = "cart-drawer-container";
    drawer.className = "cart-drawer-backdrop hidden";
    drawer.innerHTML = `
      <div class="cart-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div class="cart-drawer-header">
          <div class="cart-header-title-wrap">
            <h3 id="cart-title">Student Order Tray</h3>
            <span id="cart-badge-count" class="cart-badge">0 items</span>
          </div>
          <button id="cart-close-btn" class="cart-close-btn" aria-label="Close Tray">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="cart-drawer-body" id="cart-drawer-items">
          <!-- Populated dynamically -->
        </div>

        <div class="cart-drawer-footer" id="cart-drawer-footer">
          <div class="cart-bill-breakdown">
            <div class="bill-row">
              <span>Item Total</span>
              <span id="bill-subtotal">₹0</span>
            </div>
            <div class="bill-row muted">
              <span>Canteen Platform & Tax</span>
              <span>₹0 (Student Subsidy)</span>
            </div>
            <div class="bill-row total-row">
              <span>To Pay</span>
              <span id="bill-total" class="bill-grand-total">₹0</span>
            </div>
          </div>

          <button id="btn-checkout" class="btn btn-primary btn-checkout">
            <span>Place Canteen Order</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);
    this.drawerEl = drawer;
  }

  bindEvents() {
    // Backdrop click
    this.drawerEl.addEventListener("click", (e) => {
      if (e.target === this.drawerEl) {
        this.close();
      }
    });

    document.getElementById("cart-close-btn").addEventListener("click", () => {
      this.close();
    });

    // Checkout click
    document.getElementById("btn-checkout").addEventListener("click", () => {
      this.checkout();
    });
  }

  open() {
    this.isOpen = true;
    this.drawerEl.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.isOpen = false;
    this.drawerEl.classList.add("hidden");
    document.body.style.overflow = "";
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  addItem(item, quantity = 1) {
    if (this.items.has(item.id)) {
      const existing = this.items.get(item.id);
      existing.quantity += quantity;
      existing.subtotal = existing.quantity * item.price;
    } else {
      this.items.set(item.id, {
        item,
        quantity,
        subtotal: item.price * quantity
      });
    }
    this.updateUI();
  }

  addVoiceOrder(parsedOrder) {
    if (!parsedOrder || !parsedOrder.items) return;
    parsedOrder.items.forEach(orderItem => {
      this.addItem(orderItem.item, orderItem.quantity);
    });
    this.updateUI();
    this.open(); // Open tray to show added items
  }

  updateQuantity(itemId, delta) {
    if (!this.items.has(itemId)) return;
    const entry = this.items.get(itemId);
    entry.quantity += delta;
    if (entry.quantity <= 0) {
      this.items.delete(itemId);
    } else {
      entry.subtotal = entry.quantity * entry.item.price;
    }
    this.updateUI();
  }

  clear() {
    this.items.clear();
    this.updateUI();
  }

  getTotalAmount() {
    let total = 0;
    this.items.forEach(val => total += val.subtotal);
    return total;
  }

  getTotalCount() {
    let count = 0;
    this.items.forEach(val => count += val.quantity);
    return count;
  }

  updateUI() {
    const listEl = document.getElementById("cart-drawer-items");
    const footerEl = document.getElementById("cart-drawer-footer");
    const countBadge = document.getElementById("cart-badge-count");
    const headerNavCount = document.getElementById("nav-cart-count");
    const subtotalEl = document.getElementById("bill-subtotal");
    const totalEl = document.getElementById("bill-total");

    const totalCount = this.getTotalCount();
    const totalAmount = this.getTotalAmount();

    if (countBadge) countBadge.textContent = `${totalCount} item${totalCount !== 1 ? "s" : ""}`;
    if (headerNavCount) {
      headerNavCount.textContent = totalCount;
      headerNavCount.classList.toggle("hidden", totalCount === 0);
    }

    if (this.items.size === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🛒</div>
          <h4>Your Tray is Empty</h4>
          <p>Order food using the 🎙️ Voice Assistant or browse the canteen menu.</p>
        </div>
      `;
      if (footerEl) footerEl.classList.add("hidden");
    } else {
      if (footerEl) footerEl.classList.remove("hidden");
      listEl.innerHTML = Array.from(this.items.values()).map(entry => `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <span class="cart-item-emoji">${entry.item.emoji}</span>
            <div class="cart-item-text">
              <div class="cart-item-name">${entry.item.name}</div>
              <div class="cart-item-rate">₹${entry.item.price} each</div>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-qty-stepper">
              <button class="qty-btn" data-action="dec" data-id="${entry.item.id}">−</button>
              <span class="qty-display">${entry.quantity}</span>
              <button class="qty-btn" data-action="inc" data-id="${entry.item.id}">+</button>
            </div>
            <div class="cart-item-subtotal">₹${entry.subtotal}</div>
          </div>
        </div>
      `).join("");

      // Bind stepper clicks
      listEl.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const action = btn.getAttribute("data-action");
          this.updateQuantity(id, action === "inc" ? 1 : -1);
        });
      });

      if (subtotalEl) subtotalEl.textContent = `₹${totalAmount}`;
      if (totalEl) totalEl.textContent = `₹${totalAmount}`;
    }
  }

  checkout() {
    if (this.items.size === 0) return;
    const orderItems = Array.from(this.items.values());
    const totalAmount = this.getTotalAmount();
    const token = `CT-${this.tokenCounter++}`;
    const student = this.getStudent();

    this.showSuccessModal(token, orderItems, totalAmount, student);
    this.clear();
    this.close();

    if (this.onOrderPlaced) {
      this.onOrderPlaced({ token, items: orderItems, totalAmount, student });
    }
  }

  showSuccessModal(token, items, totalAmount, student) {
    const successBackdrop = document.createElement("div");
    successBackdrop.className = "voice-modal-backdrop";
    successBackdrop.innerHTML = `
      <div class="voice-modal-card order-success-card" role="dialog">
        <div class="success-checkmark-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 class="success-title">Order Confirmed!</h2>
        <p class="success-subtitle">Order queued for student at Kitchen Counter</p>

        <!-- Student Roll No & Dept Banner -->
        <div class="success-student-pill">
          <span class="student-emoji">🎓</span>
          <div class="student-text-group">
            <span class="student-name">${student?.name || "Campus Student"}</span>
            <span class="student-roll">Roll No: <strong>${student?.rollNo || "Guest"}</strong></span>
            ${student?.department ? `<span class="student-meta">• ${student.department} (${student.year})</span>` : ""}
          </div>
        </div>

        <div class="token-display-box">
          <span class="token-label">PICKUP TOKEN NUMBER</span>
          <span class="token-number">#${token}</span>
          <span class="token-meta">Estimated wait time: <strong>6 - 8 mins</strong></span>
        </div>

        <div class="success-items-summary">
          ${items.map(it => `
            <div class="success-item-line">
              <span>${it.quantity}x ${it.item.name}</span>
              <span>₹${it.subtotal}</span>
            </div>
          `).join("")}
          <div class="success-total-line">
            <strong>Total Paid</strong>
            <strong>₹${totalAmount}</strong>
          </div>
        </div>

        <button id="success-dismiss-btn" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;">
          Awesome, Got It!
        </button>
      </div>
    `;

    document.body.appendChild(successBackdrop);
    const dismissBtn = successBackdrop.querySelector("#success-dismiss-btn");
    dismissBtn.addEventListener("click", () => {
      successBackdrop.remove();
    });
  }
}
