/**
 * Naval Letter Generator - First-Time User Welcome
 * Shows tips and feature highlights for new users
 */

// ============================================================
// FIRST-TIME USER DETECTION
// ============================================================

const WELCOME_KEY = 'nlg_has_seen_welcome';
const WELCOME_VERSION = '3.1'; // Bump this to show welcome again after major updates

/**
 * Check if user has seen the welcome modal
 * @returns {boolean}
 */
function hasSeenWelcome() {
  const seen = localStorage.getItem(WELCOME_KEY);
  return seen === WELCOME_VERSION;
}

/**
 * Mark welcome as seen
 */
function markWelcomeSeen() {
  localStorage.setItem(WELCOME_KEY, WELCOME_VERSION);
}

/**
 * Reset welcome (for testing or "show tips again")
 */
function resetWelcome() {
  localStorage.removeItem(WELCOME_KEY);
}

// ============================================================
// WELCOME MODAL
// ============================================================

/**
 * Show the welcome modal
 */
function showWelcomeModal() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('welcomeModal');
  if (!modal) {
    modal = createWelcomeModal();
    document.body.appendChild(modal);
  }

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the welcome modal
 */
function closeWelcomeModal() {
  const modal = document.getElementById('welcomeModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
  markWelcomeSeen();
}

/**
 * Create the welcome modal HTML
 * @returns {HTMLElement}
 */
function createWelcomeModal() {
  const modal = document.createElement('div');
  modal.id = 'welcomeModal';
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modal-content welcome-modal">
      <div class="welcome-header">
        <h2>Welcome to Naval Letter Generator</h2>
        <p>Free tool for Marines to create professional correspondence</p>
      </div>

      <div class="welcome-features">
        <div class="feature-card">
          <span class="feature-icon">&#128196;</span>
          <h3>Templates</h3>
          <p>20+ pre-built templates for common letter types - leave requests, awards, counseling, and more.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">&#128218;</span>
          <h3>Reference Library</h3>
          <p>100+ searchable MCOs, SECNAVINSTs, and regulations. One-click to add to your letter.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">&#128203;</span>
          <h3>Batch Generation</h3>
          <p>Generate multiple letters at once - perfect for platoon leave requests or awards packages.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">&#128274;</span>
          <h3>Security First</h3>
          <p>PII warning system detects sensitive data. Session-only storage - nothing saved on shared computers.</p>
        </div>
      </div>

      <div class="welcome-tips">
        <h3>Quick Tips</h3>
        <ul>
          <li><strong>Live Preview</strong> - Toggle the preview to see your letter as you type</li>
          <li><strong>Keyboard Shortcuts</strong> - Ctrl+S saves draft, Ctrl+Z undoes, Ctrl+P prints</li>
          <li><strong>User Profile</strong> - Save your info (name, unit, office code) for quick form filling</li>
          <li><strong>Dark Mode</strong> - Click the sun/moon icon in the header</li>
        </ul>
      </div>

      <div class="welcome-footer">
        <button type="button" class="btn btn-primary btn-lg" onclick="closeWelcomeModal()">Get Started</button>
        <label class="dont-show-again">
          <input type="checkbox" id="dontShowAgain" checked>
          <span>Don't show this again</span>
        </label>
      </div>
    </div>
  `;

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeWelcomeModal();
    }
  });

  return modal;
}

// ============================================================
// FEATURE TOOLTIPS
// ============================================================

/**
 * Add tooltip to an element
 * @param {string} selector - CSS selector
 * @param {string} text - Tooltip text
 * @param {string} position - Tooltip position (top, bottom, left, right)
 */
function addTooltip(selector, text, position = 'top') {
  const el = document.querySelector(selector);
  if (!el) return;

  el.setAttribute('data-tooltip', text);
  el.setAttribute('data-tooltip-pos', position);
  el.classList.add('has-tooltip');
}

/**
 * Initialize tooltips for key features
 */
function initFeatureTooltips() {
  // Only add tooltips if user hasn't dismissed them
  if (hasSeenWelcome()) return;

  addTooltip('#templatesBtn', 'Browse 20+ letter templates', 'bottom');
  addTooltip('#livePreviewToggle', 'See your letter as you type', 'bottom');
  addTooltip('#profileBtn', 'Save your info for quick filling', 'bottom');
}

// ============================================================
// HELP BUTTON
// ============================================================

/**
 * Show tips again (called from help menu or button)
 */
function showTipsAgain() {
  resetWelcome();
  showWelcomeModal();
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize welcome system
 */
function initWelcome() {
  // Show welcome modal for first-time users after a short delay
  if (!hasSeenWelcome()) {
    setTimeout(() => {
      showWelcomeModal();
    }, 500);
  }

  // Initialize tooltips
  initFeatureTooltips();
}

// Export for window
if (typeof window !== 'undefined') {
  window.showWelcomeModal = showWelcomeModal;
  window.closeWelcomeModal = closeWelcomeModal;
  window.showTipsAgain = showTipsAgain;
  window.initWelcome = initWelcome;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWelcome);
} else {
  initWelcome();
}
