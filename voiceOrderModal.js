/**
 * VoiceOrderModal Component
 * Handles the voice ordering modal popup, microphone listening animation,
 * speech-to-text transcript rendering, order preview, confirmation & error alerts.
 */
export class VoiceOrderModal {
  constructor({ speechService, orderParser, onOrderConfirmed, getStudent }) {
    this.speechService = speechService;
    this.orderParser = orderParser;
    this.onOrderConfirmed = onOrderConfirmed;
    this.getStudent = getStudent || (() => ({ name: "Campus Student", id: "STU-GEN", avatar: "👤" }));

    this.isOpen = false;
    this.state = "idle"; // "idle" | "listening" | "processing" | "confirming" | "error" | "confirmed"
    this.currentTranscript = "";
    this.parsedOrder = null;
    this.currentError = null;

    this.modalEl = null;
    this.initDOM();
    this.bindEvents();
    this.bindSpeechEvents();
  }

  initDOM() {
    // Create modal container
    const container = document.createElement("div");
    container.id = "voice-modal-backdrop";
    container.className = "voice-modal-backdrop hidden";
    container.innerHTML = `
      <div class="voice-modal-card" role="dialog" aria-modal="true" aria-labelledby="voice-modal-title">
        <!-- Close Button -->
        <button class="voice-modal-close-btn" id="voice-modal-close" aria-label="Close Voice Order">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Header -->
        <div class="voice-modal-header">
          <div class="voice-header-badges">
            <div class="voice-badge">
              <span class="voice-badge-dot"></span>
              <span id="voice-provider-badge">Web Speech API</span>
            </div>
            <div class="voice-student-tag" id="voice-student-tag">
              <span id="voice-student-avatar">👤</span>
              <span id="voice-student-text">Student Details</span>
            </div>
          </div>
          <h2 id="voice-modal-title" class="voice-modal-title">AI Smart Canteen Assistant</h2>
          <p class="voice-modal-subtitle">Speak or type your order naturally, e.g. <em>"Order one veg sandwich and a cold coffee"</em></p>
        </div>

        <!-- Mode Switcher Tabs (Speak vs Type) -->
        <div class="order-mode-tabs">
          <button type="button" class="order-mode-tab active" id="tab-mode-voice" data-mode="voice">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span>Speak Order</span>
          </button>
          <button type="button" class="order-mode-tab" id="tab-mode-type" data-mode="type">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
              <line x1="6" y1="8" x2="6.01" y2="8"></line>
              <line x1="10" y1="8" x2="10.01" y2="8"></line>
              <line x1="14" y1="8" x2="14.01" y2="8"></line>
              <line x1="18" y1="8" x2="18.01" y2="8"></line>
              <line x1="8" y1="12" x2="8.01" y2="12"></line>
              <line x1="12" y1="12" x2="12.01" y2="12"></line>
              <line x1="16" y1="12" x2="16.01" y2="12"></line>
              <line x1="7" y1="16" x2="17" y2="16"></line>
            </svg>
            <span>Type Order</span>
          </button>
        </div>

        <!-- Mode 1: Voice Input Section -->
        <div id="modal-voice-section" class="modal-input-section">
          <!-- Central Animated Microphone Section -->
          <div class="voice-interactive-zone">
            <div class="voice-mic-outer-wrap">
              <div class="pulse-ring ring-1"></div>
              <div class="pulse-ring ring-2"></div>
              <div class="pulse-ring ring-3"></div>
              <button id="voice-modal-mic-btn" class="voice-mic-main-btn" aria-label="Toggle Microphone">
                <svg class="mic-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
            </div>

            <!-- Dynamic Audio Equalizer Bars (animated during listening) -->
            <div id="voice-equalizer" class="voice-equalizer hidden">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </div>

            <!-- Status Indicator Label -->
            <div id="voice-status-text" class="voice-status-text">Click microphone to speak</div>
          </div>

          <!-- Real-time Speech Transcript Area -->
          <div id="voice-transcript-box" class="voice-transcript-box">
            <div class="transcript-label">Recognized Speech:</div>
            <div id="voice-transcript-content" class="voice-transcript-content empty">
              Your spoken words will appear here...
            </div>
          </div>
        </div>

        <!-- Mode 2: Typing Input Section -->
        <div id="modal-type-section" class="modal-input-section hidden">
          <div class="type-input-card">
            <label for="modal-type-input" class="type-input-label">Type your food order naturally:</label>
            <div class="type-input-control-row">
              <input 
                type="text" 
                id="modal-type-input" 
                class="modal-type-field" 
                placeholder="e.g. Order one veg sandwich and a cold coffee..." 
                autocomplete="off"
              />
              <button type="button" id="modal-type-parse-btn" class="btn btn-primary btn-type-detect">
                <span>Detect</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
            <p class="type-input-hint">Tip: Press <strong>Enter</strong> or click Detect to find items on the canteen menu.</p>
          </div>
        </div>

        <!-- Structured Recognized Order Preview Card -->
        <div id="voice-order-preview" class="voice-order-preview hidden">
          <div class="preview-header">
            <span class="preview-title">Detected Order Items</span>
            <span id="preview-item-count" class="preview-badge">0 items</span>
          </div>
          <div id="preview-items-list" class="preview-items-list">
            <!-- Dynamically populated -->
          </div>
          <div class="preview-total-row">
            <span>Estimated Total:</span>
            <span id="preview-total-price" class="preview-total-price">₹0</span>
          </div>
        </div>

        <!-- Error Notification Banner -->
        <div id="voice-error-banner" class="voice-error-banner hidden">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <div id="error-title" class="error-title">Microphone Error</div>
            <div id="error-message" class="error-message">Could not access microphone.</div>
          </div>
        </div>

        <!-- Action Buttons: Confirm & Cancel -->
        <div class="voice-modal-actions">
          <button id="voice-cancel-btn" class="btn btn-secondary voice-action-btn">
            Cancel
          </button>
          <button id="voice-confirm-btn" class="btn btn-primary voice-action-btn" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Confirm Order
          </button>
        </div>

        <!-- Quick Demo Prompt Chips (For immediate frontend demonstration) -->
        <div class="voice-demo-hints">
          <span class="demo-hints-title">💡 Try asking or click to simulate:</span>
          <div class="demo-chips-container">
            <button class="demo-chip" data-phrase="Order one veg sandwich and a cold coffee">
              "Order one veg sandwich and a cold coffee"
            </button>
            <button class="demo-chip" data-phrase="One crispy masala dosa and a mango lassi">
              "One crispy masala dosa and a mango lassi"
            </button>
            <button class="demo-chip" data-phrase="Two chole bhature and one cold coffee">
              "Two chole bhature and one cold coffee"
            </button>
            <button class="demo-chip" data-phrase="One margherita pizza and one oreo milkshake">
              "One margherita pizza and one oreo milkshake"
            </button>
            <button class="demo-chip" data-phrase="Two samosas and two masala chai">
              "Two samosas and two masala chai"
            </button>
            <button class="demo-chip" data-phrase="One paneer tikka wrap and one peri peri fries">
              "One paneer tikka wrap and one peri peri fries"
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.modalEl = container;
  }

  bindEvents() {
    // Backdrop click close
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // Close button
    document.getElementById("voice-modal-close").addEventListener("click", () => {
      this.close();
    });

    // Mic toggle button inside modal
    document.getElementById("voice-modal-mic-btn").addEventListener("click", () => {
      this.toggleListening();
    });

    // Confirm button
    document.getElementById("voice-confirm-btn").addEventListener("click", () => {
      this.handleConfirm();
    });

    // Cancel button
    document.getElementById("voice-cancel-btn").addEventListener("click", () => {
      this.handleCancel();
    });

    // Quick demo phrase chips
    this.modalEl.querySelectorAll(".demo-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const phrase = chip.getAttribute("data-phrase");
        this.simulateSpeech(phrase);
      });
    });

    // Mode tabs (Speak vs Type)
    const tabVoice = document.getElementById("tab-mode-voice");
    const tabType = document.getElementById("tab-mode-type");
    if (tabVoice) tabVoice.addEventListener("click", () => this.switchMode("voice"));
    if (tabType) tabType.addEventListener("click", () => this.switchMode("type"));

    // Typing submit button & Enter key
    const typeInput = document.getElementById("modal-type-input");
    const typeParseBtn = document.getElementById("modal-type-parse-btn");
    const handleTypeSubmit = () => {
      const text = typeInput.value.trim();
      if (!text) return;
      this.processFinalTranscript(text);
    };

    if (typeParseBtn) {
      typeParseBtn.addEventListener("click", handleTypeSubmit);
    }
    if (typeInput) {
      typeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleTypeSubmit();
        }
      });
    }

    // Keyboard ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  bindSpeechEvents() {
    this.speechService.on("start", () => {
      this.setState("listening");
      this.setStatusText("Listening... Speak your order clearly");
      this.clearError();
    });

    this.speechService.on("interim", (interimText) => {
      this.updateTranscript(interimText, false);
      this.setStatusText("Processing speech...");
    });

    this.speechService.on("result", (finalText) => {
      this.updateTranscript(finalText, true);
      this.processFinalTranscript(finalText);
    });

    this.speechService.on("error", (err) => {
      this.showError(err);
      this.setState("error");
    });

    this.speechService.on("end", () => {
      if (this.state === "listening") {
        if (!this.parsedOrder || !this.parsedOrder.isValidOrder) {
          this.setState("idle");
          this.setStatusText("Click microphone to try again");
        } else {
          this.setState("confirming");
        }
      }
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    const tabVoice = document.getElementById("tab-mode-voice");
    const tabType = document.getElementById("tab-mode-type");
    const secVoice = document.getElementById("modal-voice-section");
    const secType = document.getElementById("modal-type-section");
    const typeInput = document.getElementById("modal-type-input");

    if (mode === "voice") {
      tabVoice?.classList.add("active");
      tabType?.classList.remove("active");
      secVoice?.classList.remove("hidden");
      secType?.classList.add("hidden");
      this.clearError();
      if (!this.parsedOrder) {
        this.startListening();
      }
    } else {
      tabVoice?.classList.remove("active");
      tabType?.classList.add("active");
      secVoice?.classList.add("hidden");
      secType?.classList.remove("hidden");
      this.speechService.abort();
      this.setState("idle");
      this.clearError();
      if (typeInput) {
        setTimeout(() => typeInput.focus(), 100);
      }
    }
  }

  open(autoStartVoice = true) {
    this.isOpen = true;
    this.modalEl.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent page scrolling
    this.resetState();

    // Update active student indicator
    const student = this.getStudent();
    const avatarEl = document.getElementById("voice-student-avatar");
    const textEl = document.getElementById("voice-student-text");
    if (student) {
      if (avatarEl) avatarEl.textContent = "🎓";
      if (textEl) textEl.textContent = `${student.name.split(" ")[0]} (Roll: ${student.rollNo})`;
    } else {
      if (avatarEl) avatarEl.textContent = "👤";
      if (textEl) textEl.textContent = "Guest Student";
    }

    if (autoStartVoice) {
      this.switchMode("voice");
      // Check if browser supports Web Speech API
      if (!this.speechService.isSupported()) {
        this.showError({
          title: "Browser Speech API Unsupported",
          message: "Web Speech is not supported in this browser. You can type your order using the 'Type Order' tab above or click the demo chips!"
        });
        return;
      }
      this.startListening();
    }
  }

  openWithType(text = "") {
    this.open(false);
    this.switchMode("type");
    const typeInput = document.getElementById("modal-type-input");
    if (typeInput) {
      typeInput.value = text;
    }
    if (text) {
      this.processFinalTranscript(text);
    }
  }

  close() {
    this.speechService.abort();
    this.isOpen = false;
    this.modalEl.classList.add("hidden");
    document.body.style.overflow = "";
    this.resetState();
  }

  toggleListening() {
    if (this.state === "listening") {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    this.clearError();
    this.currentTranscript = "";
    this.parsedOrder = null;
    this.updateTranscript("", false);
    this.hideOrderPreview();
    document.getElementById("voice-confirm-btn").disabled = true;

    this.speechService.start();
  }

  stopListening() {
    this.speechService.stop();
    this.setState("idle");
  }

  handleCancel() {
    this.speechService.abort();
    this.close();
  }

  handleConfirm() {
    if (this.parsedOrder && this.parsedOrder.isValidOrder) {
      this.speechService.abort();
      if (typeof this.onOrderConfirmed === "function") {
        this.onOrderConfirmed(this.parsedOrder);
      }
      this.close();
    }
  }

  /**
   * Simulates speech recognition for quick testing or fallback
   */
  simulateSpeech(phrase) {
    this.clearError();
    this.speechService.abort();
    this.setState("listening");
    this.setStatusText("Simulating voice input...");

    let current = "";
    const words = phrase.split(" ");
    let i = 0;

    const interval = setInterval(() => {
      if (i < words.length) {
        current += (i === 0 ? "" : " ") + words[i];
        this.updateTranscript(current, false);
        i++;
      } else {
        clearInterval(interval);
        this.updateTranscript(phrase, true);
        this.processFinalTranscript(phrase);
      }
    }, 180);
  }

  processFinalTranscript(text) {
    this.currentTranscript = text;
    const parsed = this.orderParser.parse(text);
    this.parsedOrder = parsed;

    if (parsed.isValidOrder) {
      this.setState("confirming");
      this.setStatusText("Order detected! Please review and confirm below.");
      this.renderOrderPreview(parsed);
      document.getElementById("voice-confirm-btn").disabled = false;
    } else {
      this.setState("idle");
      this.setStatusText("Could not match items on our canteen menu. Try again!");
      this.showError({
        title: "Item Not Recognized",
        message: `We heard "${text}", but couldn't find those items on our menu. Try saying "Order one veg sandwich and a cold coffee".`
      });
      document.getElementById("voice-confirm-btn").disabled = true;
    }
  }

  updateTranscript(text, isFinal = false) {
    const el = document.getElementById("voice-transcript-content");
    if (!text) {
      el.className = "voice-transcript-content empty";
      el.textContent = "Listening for your order...";
    } else {
      el.className = `voice-transcript-content ${isFinal ? "final" : "interim"}`;
      el.textContent = `“${text}”`;
    }
  }

  renderOrderPreview(parsed) {
    const previewContainer = document.getElementById("voice-order-preview");
    const countBadge = document.getElementById("preview-item-count");
    const listEl = document.getElementById("preview-items-list");
    const totalEl = document.getElementById("preview-total-price");

    countBadge.textContent = `${parsed.totalCount} item${parsed.totalCount > 1 ? "s" : ""}`;
    totalEl.textContent = `₹${parsed.totalAmount}`;

    listEl.innerHTML = parsed.items.map(orderItem => `
      <div class="preview-item-row">
        <div class="preview-item-left">
          <span class="preview-item-emoji">${orderItem.item.emoji}</span>
          <div>
            <div class="preview-item-name">${orderItem.item.name}</div>
            <div class="preview-item-meta">₹${orderItem.unitPrice} each</div>
          </div>
        </div>
        <div class="preview-item-right">
          <span class="preview-item-qty">Qty: <strong>${orderItem.quantity}</strong></span>
          <span class="preview-item-subtotal">₹${orderItem.subtotal}</span>
        </div>
      </div>
    `).join("");

    previewContainer.classList.remove("hidden");
  }

  hideOrderPreview() {
    const previewContainer = document.getElementById("voice-order-preview");
    previewContainer.classList.add("hidden");
  }

  showError(err) {
    const banner = document.getElementById("voice-error-banner");
    const titleEl = document.getElementById("error-title");
    const msgEl = document.getElementById("error-message");

    titleEl.textContent = err.title || "Voice Error";
    msgEl.textContent = err.message || "An issue occurred while processing voice input.";
    banner.classList.remove("hidden");

    this.setStatusText("Voice recognition stopped");
    document.getElementById("voice-confirm-btn").disabled = true;
  }

  clearError() {
    const banner = document.getElementById("voice-error-banner");
    banner.classList.add("hidden");
  }

  setStatusText(text) {
    document.getElementById("voice-status-text").textContent = text;
  }

  setState(state) {
    this.state = state;
    const micBtn = document.getElementById("voice-modal-mic-btn");
    const rings = this.modalEl.querySelectorAll(".pulse-ring");
    const equalizer = document.getElementById("voice-equalizer");

    if (state === "listening") {
      micBtn.classList.add("active-listening");
      rings.forEach(r => r.classList.add("active"));
      equalizer.classList.remove("hidden");
    } else {
      micBtn.classList.remove("active-listening");
      rings.forEach(r => r.classList.remove("active"));
      equalizer.classList.add("hidden");
    }
  }

  resetState() {
    this.setState("idle");
    this.setStatusText("Click microphone to speak");
    this.clearError();
    this.hideOrderPreview();
    this.updateTranscript("", false);
    document.getElementById("voice-confirm-btn").disabled = true;
    this.parsedOrder = null;
    this.currentTranscript = "";
    const typeInput = document.getElementById("modal-type-input");
    if (typeInput) typeInput.value = "";
  }
}
