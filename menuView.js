import { MENU_ITEMS, CATEGORIES } from "../config/menuData.js";

/**
 * MenuView Component
 * Renders category filters, menu cards, and individual food details.
 */
export class MenuView {
  constructor({ containerId, onAddToCart, onVoiceItemClick }) {
    this.container = document.getElementById(containerId);
    this.onAddToCart = onAddToCart;
    this.onVoiceItemClick = onVoiceItemClick;
    this.activeCategory = "All";
    this.render();
  }

  setCategory(category) {
    this.activeCategory = category;
    this.renderMenuGrid();
  }

  render() {
    this.container.innerHTML = `
      <section class="menu-section">
        <!-- Categories Pill Filter -->
        <div class="category-filters-wrapper">
          <div class="category-filters" id="category-filters">
            ${CATEGORIES.map(cat => `
              <button class="category-pill ${cat === this.activeCategory ? "active" : ""}" data-category="${cat}">
                ${cat}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Food Items Grid -->
        <div class="menu-grid" id="menu-items-grid">
          <!-- Dynamically filled -->
        </div>
      </section>
    `;

    this.bindCategoryEvents();
    this.renderMenuGrid();
  }

  bindCategoryEvents() {
    const filtersContainer = document.getElementById("category-filters");
    filtersContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".category-pill");
      if (!pill) return;

      filtersContainer.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      this.activeCategory = pill.getAttribute("data-category");
      this.renderMenuGrid();
    });
  }

  renderMenuGrid() {
    const grid = document.getElementById("menu-items-grid");
    const items = this.activeCategory === "All"
      ? MENU_ITEMS
      : MENU_ITEMS.filter(item => item.category === this.activeCategory);

    grid.innerHTML = items.map(item => `
      <article class="food-card" data-item-id="${item.id}">
        <div class="food-card-top">
          <div class="food-card-emoji-wrap">
            <span class="food-card-emoji">${item.emoji}</span>
          </div>
          ${item.badge ? `<span class="food-card-badge">${item.badge}</span>` : ""}
        </div>

        <div class="food-card-body">
          <div class="food-card-category">${item.category}</div>
          <h3 class="food-card-name">${item.name}</h3>
          <p class="food-card-desc">${item.description}</p>
          
          <div class="food-card-meta">
            <span class="calorie-tag">⚡ ${item.calories}</span>
            <span class="voice-hint" title="Can be ordered via voice">🎙️ Voice Enabled</span>
          </div>
        </div>

        <div class="food-card-footer">
          <div class="food-card-price">
            <span class="currency">₹</span><span class="amount">${item.price}</span>
          </div>
          <button class="btn btn-add-cart" data-action="add-cart" data-item-id="${item.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
          </button>
        </div>
      </article>
    `).join("");

    // Attach Add to Cart event listeners
    grid.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const itemId = btn.getAttribute("data-item-id");
        const item = MENU_ITEMS.find(m => m.id === itemId);
        if (item && this.onAddToCart) {
          this.onAddToCart(item);
          this.animateButton(btn);
        }
      });
    });
  }

  animateButton(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `✓ Added`;
    btn.classList.add("btn-added");
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove("btn-added");
    }, 1200);
  }

  /**
   * Visually highlights cards when recognized via voice
   */
  highlightItems(itemIds) {
    itemIds.forEach(id => {
      const card = this.container.querySelector(`[data-item-id="${id}"]`);
      if (card) {
        card.classList.add("voice-highlight-pulse");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          card.classList.remove("voice-highlight-pulse");
        }, 2500);
      }
    });
  }
}
