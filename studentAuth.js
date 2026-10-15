/**
 * StudentAuth Component
 * Manages student sign-in strictly by:
 * - Full Name
 * - Roll Number (Roll No)
 * - Year
 * - Department
 * 
 * No hardcoded existing student IDs. Allows any student to enter their own details.
 */

export class StudentAuth {
  constructor({ onStudentChanged }) {
    this.onStudentChanged = onStudentChanged;
    this.activeStudent = this.loadActiveStudent();
    this.isOpen = false;
    this.isEditing = !this.activeStudent; // If no active student, start in edit mode

    this.initDOM();
    this.bindEvents();
    this.updateNavbarPill();
  }

  loadActiveStudent() {
    try {
      const stored = localStorage.getItem("smart_canteen_active_student");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load stored student", e);
    }
    return null; // No default fake IDs
  }

  saveActiveStudent(student) {
    this.activeStudent = student;
    if (student) {
      localStorage.setItem("smart_canteen_active_student", JSON.stringify(student));
      // Also maintain a history of students who have logged into this device
      this.rememberStudent(student);
    } else {
      localStorage.removeItem("smart_canteen_active_student");
    }
    this.updateNavbarPill();
    if (this.onStudentChanged) {
      this.onStudentChanged(this.activeStudent);
    }
  }

  rememberStudent(student) {
    try {
      const list = JSON.parse(localStorage.getItem("smart_canteen_saved_students") || "[]");
      const filtered = list.filter(s => s.rollNo.toLowerCase() !== student.rollNo.toLowerCase());
      filtered.unshift(student);
      localStorage.setItem("smart_canteen_saved_students", JSON.stringify(filtered.slice(0, 5)));
    } catch (e) {}
  }

  getSavedStudents() {
    try {
      return JSON.parse(localStorage.getItem("smart_canteen_saved_students") || "[]");
    } catch (e) {
      return [];
    }
  }

  getActiveStudent() {
    return this.activeStudent;
  }

  hasActiveStudent() {
    return !!this.activeStudent;
  }

  initDOM() {
    const backdrop = document.createElement("div");
    backdrop.id = "student-auth-backdrop";
    backdrop.className = "voice-modal-backdrop hidden";
    backdrop.innerHTML = `
      <div class="voice-modal-card student-modal-card" role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
        <!-- Close Button -->
        <button class="voice-modal-close-btn" id="student-modal-close" aria-label="Close Student Dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Header -->
        <div class="voice-modal-header" style="margin-bottom: 1.25rem;">
          <div class="voice-badge">
            <span class="voice-badge-dot"></span>
            <span>Student Verification</span>
          </div>
          <h2 id="student-modal-title" class="voice-modal-title">Student Details</h2>
          <p class="voice-modal-subtitle">Enter your name and roll number so the canteen can announce your token.</p>
        </div>

        <!-- View 1: Active Student Card (Shown when a student is already signed in) -->
        <div id="student-profile-view" class="student-profile-view ${this.activeStudent ? "" : "hidden"}">
          <div class="current-student-card">
            <div class="student-avatar-big">🎓</div>
            <div class="current-student-meta">
              <span class="active-badge">Logged In Student</span>
              <h3 id="display-student-name">${this.activeStudent?.name || ""}</h3>
              <div class="student-details-line">
                <span>Roll No: <strong id="display-student-roll">${this.activeStudent?.rollNo || ""}</strong></span>
              </div>
              <div class="student-details-line" style="margin-top: 4px;">
                <span id="display-student-dept-year">${this.activeStudent?.department || ""} • ${this.activeStudent?.year || ""}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button id="btn-edit-student" class="btn btn-primary" style="flex: 1; padding: 0.75rem;">
              Change Student / Switch Roll No
            </button>
            <button id="btn-done-student" class="btn btn-secondary" style="padding: 0.75rem 1.25rem;">
              Done
            </button>
          </div>

          <!-- Past Orders Section for This Student -->
          <div style="margin-top: 1.5rem;">
            <div class="section-label">Your Recent Canteen Orders:</div>
            <div id="student-recent-orders-list" class="student-past-orders-list">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>

        <!-- View 2: Form to Enter / Sign-Up Student Details -->
        <div id="student-form-view" class="student-form-view ${this.activeStudent ? "hidden" : ""}">
          <form id="student-entry-form" class="student-form">
            <div class="form-group">
              <label for="input-student-name">Student Full Name *</label>
              <input 
                type="text" 
                id="input-student-name" 
                placeholder="Enter your full name" 
                required 
                autocomplete="name"
              />
            </div>

            <div class="form-group">
              <label for="input-student-roll">Roll Number (Roll No.) *</label>
              <input 
                type="text" 
                id="input-student-roll" 
                placeholder="e.g. 21BCSE104 or CS-42" 
                required 
                autocomplete="off"
              />
              <small class="form-hint">Your food pickup token will be announced against this Roll Number.</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="input-student-year">Year *</label>
                <select id="input-student-year" required>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year" selected>2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                </select>
              </div>

              <div class="form-group">
                <label for="input-student-dept">Department *</label>
                <select id="input-student-dept" required>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Computer Science">Electronics and Computer Science</option>
                  <option value="Biomedical Engineering">Biomedical Engineering</option>
                  <option value="Electronics and Telecommunication">Electronics and Telecommunication</option>
                </select>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
              <button type="submit" class="btn btn-primary" style="flex: 1; padding: 0.85rem;">
                Save Details & Continue
              </button>
              ${this.activeStudent ? `
                <button type="button" id="btn-cancel-edit" class="btn btn-secondary" style="padding: 0.85rem 1rem;">
                  Cancel
                </button>
              ` : ""}
            </div>
          </form>

          <!-- Quick switch if other students previously logged in on this browser -->
          <div id="saved-students-container" class="hidden" style="margin-top: 1.5rem; border-top: 1px dashed var(--border-color); padding-top: 1rem;">
            <div class="section-label">Previously Logged In on this Device:</div>
            <div id="saved-students-list" class="student-profile-list"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;
  }

  bindEvents() {
    // Backdrop click
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // Close button
    document.getElementById("student-modal-close").addEventListener("click", () => {
      this.close();
    });

    // Form submit
    const form = document.getElementById("student-entry-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Edit button (from Profile view)
    const editBtn = document.getElementById("btn-edit-student");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.showFormView();
      });
    }

    // Done button (from Profile view)
    const doneBtn = document.getElementById("btn-done-student");
    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        this.close();
      });
    }

    // Cancel edit button
    const cancelEditBtn = document.getElementById("btn-cancel-edit");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => {
        this.showProfileView();
      });
    }
  }

  handleFormSubmit() {
    const nameInput = document.getElementById("input-student-name");
    const rollInput = document.getElementById("input-student-roll");
    const yearSelect = document.getElementById("input-student-year");
    const deptSelect = document.getElementById("input-student-dept");

    const name = nameInput.value.trim();
    const rollNo = rollInput.value.trim().toUpperCase();
    const year = yearSelect.value;
    const department = deptSelect.value;

    if (!name || !rollNo) {
      alert("Please enter both your Full Name and Roll Number.");
      return;
    }

    const student = {
      name,
      rollNo,
      year,
      department
    };

    this.saveActiveStudent(student);
    this.updateProfileDisplay();
    this.showProfileView();
    this.close();
  }

  open(forceEdit = false) {
    this.isOpen = true;
    this.modalEl.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    if (!this.activeStudent || forceEdit) {
      this.showFormView();
    } else {
      this.updateProfileDisplay();
      this.renderRecentOrders();
      this.showProfileView();
    }

    this.renderSavedStudentsList();
  }

  close() {
    this.isOpen = false;
    this.modalEl.classList.add("hidden");
    document.body.style.overflow = "";
  }

  showFormView() {
    document.getElementById("student-profile-view").classList.add("hidden");
    document.getElementById("student-form-view").classList.remove("hidden");

    // Pre-fill existing data if editing
    if (this.activeStudent) {
      document.getElementById("input-student-name").value = this.activeStudent.name || "";
      document.getElementById("input-student-roll").value = this.activeStudent.rollNo || "";
      document.getElementById("input-student-year").value = this.activeStudent.year || "2nd Year";
      document.getElementById("input-student-dept").value = this.activeStudent.department || "Computer Engineering";
    }
  }

  showProfileView() {
    if (!this.activeStudent) {
      this.showFormView();
      return;
    }
    document.getElementById("student-form-view").classList.add("hidden");
    document.getElementById("student-profile-view").classList.remove("hidden");
    this.updateProfileDisplay();
    this.renderRecentOrders();
  }

  updateProfileDisplay() {
    if (!this.activeStudent) return;
    const nameEl = document.getElementById("display-student-name");
    const rollEl = document.getElementById("display-student-roll");
    const deptYearEl = document.getElementById("display-student-dept-year");

    if (nameEl) nameEl.textContent = this.activeStudent.name;
    if (rollEl) rollEl.textContent = this.activeStudent.rollNo;
    if (deptYearEl) deptYearEl.textContent = `${this.activeStudent.department} • ${this.activeStudent.year}`;
  }

  updateNavbarPill() {
    const pill = document.getElementById("nav-student-pill");
    if (!pill) return;

    if (!this.activeStudent) {
      pill.innerHTML = `
        <span class="nav-student-avatar">👤</span>
        <div class="nav-student-text">
          <span class="nav-student-name">Enter Details</span>
          <span class="nav-student-id">Name & Roll No</span>
        </div>
        <span class="nav-student-dropdown-icon">▾</span>
      `;
    } else {
      pill.innerHTML = `
        <span class="nav-student-avatar">🎓</span>
        <div class="nav-student-text">
          <span class="nav-student-name">${this.activeStudent.name}</span>
          <span class="nav-student-id">Roll: ${this.activeStudent.rollNo}</span>
        </div>
        <span class="nav-student-dropdown-icon">▾</span>
      `;
    }
  }

  renderSavedStudentsList() {
    const container = document.getElementById("saved-students-container");
    const listEl = document.getElementById("saved-students-list");
    const saved = this.getSavedStudents();

    if (!saved || saved.length === 0) {
      if (container) container.classList.add("hidden");
      return;
    }

    if (container) container.classList.remove("hidden");
    listEl.innerHTML = saved.map(s => {
      const isCurrent = this.activeStudent && this.activeStudent.rollNo === s.rollNo;
      return `
        <div class="student-select-card ${isCurrent ? "selected" : ""}" data-roll="${s.rollNo}">
          <div class="student-avatar-mini">🎓</div>
          <div class="student-meta-mini">
            <div class="student-name-mini">${s.name} ${isCurrent ? `<span class="current-tag">ACTIVE</span>` : ""}</div>
            <div class="student-id-mini">Roll: ${s.rollNo} • ${s.department} (${s.year})</div>
          </div>
          ${!isCurrent ? `<button class="btn btn-secondary btn-switch-id">Select</button>` : `<span class="active-check">✓</span>`}
        </div>
      `;
    }).join("");

    listEl.querySelectorAll(".student-select-card").forEach(card => {
      card.addEventListener("click", () => {
        const roll = card.getAttribute("data-roll");
        const found = saved.find(s => s.rollNo === roll);
        if (found) {
          this.saveActiveStudent(found);
          this.showProfileView();
          this.close();
        }
      });
    });
  }

  saveOrderForActiveStudent(order) {
    if (!this.activeStudent) return;
    try {
      const key = `smart_canteen_orders_${this.activeStudent.rollNo}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const record = {
        ...order,
        studentName: this.activeStudent.name,
        rollNo: this.activeStudent.rollNo,
        year: this.activeStudent.year,
        department: this.activeStudent.department,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      };
      existing.unshift(record);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not save order for student", e);
    }
  }

  renderRecentOrders() {
    const container = document.getElementById("student-recent-orders-list");
    if (!container || !this.activeStudent) return;

    const key = `smart_canteen_orders_${this.activeStudent.rollNo}`;
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {}

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state" style="padding: 1.5rem 1rem;">
          <div class="cart-empty-icon" style="font-size: 2rem;">🧾</div>
          <h4 style="font-size: 0.95rem;">No Orders Yet</h4>
          <p style="font-size: 0.8rem;">Orders placed under Roll No <strong>${this.activeStudent.rollNo}</strong> will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(ord => `
      <div class="past-order-card">
        <div class="past-order-header">
          <div>
            <span class="past-order-token">Token #${ord.token}</span>
            <span class="past-order-time">${ord.date} at ${ord.timestamp}</span>
          </div>
          <span class="past-order-status">Preparing 👨‍🍳</span>
        </div>
        <div class="past-order-items">
          ${ord.items.map(it => `
            <div class="past-order-item-line">
              <span>${it.quantity}x ${it.item.name}</span>
              <span>₹${it.subtotal}</span>
            </div>
          `).join("")}
        </div>
        <div class="past-order-total">
          <span>Total Paid</span>
          <strong>₹${ord.totalAmount}</strong>
        </div>
      </div>
    `).join("");
  }
}
