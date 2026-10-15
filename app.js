import { SpeechService } from "./services/speechService.js";
import { WebSpeechProvider } from "./services/webSpeechProvider.js";
import { ParakitProvider } from "./services/parakitProvider.js";
import { OrderParser } from "./services/orderParser.js";
import { VoiceOrderModal } from "./components/voiceOrderModal.js";
import { MenuView } from "./components/menuView.js";
import { CartView } from "./components/cartView.js";
import { StudentAuth } from "./components/studentAuth.js";

/**
 * AI Smart Canteen Application Bootstrap
 */
class SmartCanteenApp {
  constructor() {
    this.speechService = null;
    this.orderParser = null;
    this.voiceModal = null;
    this.menuView = null;
    this.cartView = null;
    this.studentAuth = null;

    this.init();
  }

  init() {
    // 1. Initialize Student Authentication & Profiles
    this.studentAuth = new StudentAuth({
      onStudentChanged: (student) => {
        if (student) {
          this.showToast(`Active Student: ${student.name} (Roll: ${student.rollNo})`, "info");
        }
      }
    });

    // 2. Initialize Speech Recognition Service (Modular Architecture)
    const webSpeech = new WebSpeechProvider();
    this.speechService = new SpeechService(webSpeech);

    // 3. Initialize Natural Language Order Parser
    this.orderParser = new OrderParser();

    // 4. Initialize Cart View
    this.cartView = new CartView({
      getStudent: () => this.studentAuth.getActiveStudent(),
      onOrderPlaced: (order) => {
        this.studentAuth.saveOrderForActiveStudent(order);
        const name = order.student?.name || "Student";
        const roll = order.student?.rollNo || "Guest";
        this.showToast(`🎉 Order #${order.token} placed for ${name} (Roll: ${roll})!`, "success");
      }
    });

    // 5. Initialize Menu View
    this.menuView = new MenuView({
      containerId: "menu-container",
      onAddToCart: (item) => {
        this.cartView.addItem(item, 1);
        this.showToast(`Added ${item.name} to tray`, "info");
      }
    });

    // 6. Initialize Voice Order Modal
    this.voiceModal = new VoiceOrderModal({
      speechService: this.speechService,
      orderParser: this.orderParser,
      getStudent: () => this.studentAuth.getActiveStudent(),
      onOrderConfirmed: (parsedOrder) => {
        this.handleVoiceOrderConfirmed(parsedOrder);
      }
    });

    // 7. Bind Global Triggers & Listeners
    this.bindGlobalTriggers();
    this.setupProviderToggle();

    console.info("AI Smart Canteen initialized with Student Authentication, Web Speech API & Modular Parakit architecture.");
  }

  bindGlobalTriggers() {
    // Navbar Voice Button
    const navMicBtn = document.getElementById("nav-mic-btn");
    if (navMicBtn) {
      navMicBtn.addEventListener("click", () => this.voiceModal.open());
    }

    // Floating Action Button (FAB)
    const floatingMicBtn = document.getElementById("floating-mic-btn");
    if (floatingMicBtn) {
      floatingMicBtn.addEventListener("click", () => this.voiceModal.open());
    }

    // Hero Smart Order Form (Typing and Voice)
    const heroForm = document.getElementById("hero-smart-order-form");
    const heroInput = document.getElementById("hero-order-input");
    const heroMicBtn = document.getElementById("hero-bar-mic-btn");

    if (heroMicBtn) {
      heroMicBtn.addEventListener("click", () => this.voiceModal.open(true));
    }

    if (heroForm) {
      heroForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = heroInput ? heroInput.value.trim() : "";
        if (text) {
          this.voiceModal.openWithType(text);
          if (heroInput) heroInput.value = "";
        } else {
          this.voiceModal.openWithType("");
        }
      });
    }

    // Hero Prompt Chips (e.g. "Order one veg sandwich and a cold coffee")
    document.querySelectorAll(".hero-prompt-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const text = chip.getAttribute("data-phrase");
        this.voiceModal.open();
        // Give modal a tiny moment to render, then simulate
        setTimeout(() => {
          this.voiceModal.simulateSpeech(text);
        }, 150);
      });
    });

    // Cart Button in Navbar
    const navCartBtn = document.getElementById("nav-cart-btn");
    if (navCartBtn) {
      navCartBtn.addEventListener("click", () => this.cartView.toggle());
    }

    // Student ID / Account Pill in Navbar
    const navStudentPill = document.getElementById("nav-student-pill");
    if (navStudentPill) {
      navStudentPill.addEventListener("click", () => this.studentAuth.open());
    }
  }

  handleVoiceOrderConfirmed(parsedOrder) {
    // Add recognized items to cart
    this.cartView.addVoiceOrder(parsedOrder);

    // Highlight recognized items on the menu
    const itemIds = parsedOrder.items.map(it => it.item.id);
    this.menuView.highlightItems(itemIds);

    // Provide friendly confirmation toast
    const count = parsedOrder.totalCount;
    this.showToast(`🎙️ Voice Order recognized: Added ${count} item${count > 1 ? "s" : ""} to your tray!`, "success");
  }

  setupProviderToggle() {
    // Developer toggle to demonstrate modularity with Parakit
    const toggleBtn = document.getElementById("provider-switch-btn");
    const label = document.getElementById("current-provider-name");

    if (toggleBtn && label) {
      toggleBtn.addEventListener("click", () => {
        if (this.speechService.getProviderName() === "WebSpeechAPI") {
          const parakit = new ParakitProvider({ model: "parakit-canteen-v1" });
          this.speechService.setProvider(parakit);
          label.textContent = "Parakit Engine (Ready)";
          label.className = "provider-pill parakit";
          this.showToast("Switched active engine to: Parakit Voice Adapter", "info");
        } else {
          const webSpeech = new WebSpeechProvider();
          this.speechService.setProvider(webSpeech);
          label.textContent = "Web Speech API (Active)";
          label.className = "provider-pill web-speech";
          this.showToast("Switched active engine to: Browser Web Speech API", "info");
        }
      });
    }
  }

  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
}

// Start application when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SmartCanteenApp();
});
