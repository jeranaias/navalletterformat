/**
 * Naval Letter Generator - Enhancements
 * DTG format, serial numbers, character counts, PII warnings, and more
 */

// ============================================================
// DTG (Date-Time Group) FORMAT
// ============================================================

let dtgMode = false;
let serialMode = false;

/**
 * Toggle header options panel visibility
 */
function toggleHeaderOptions() {
  const panel = document.getElementById('headerOptionsPanel');
  const btn = document.querySelector('.header-options-toggle');
  const text = document.getElementById('headerOptionsText');

  if (panel && btn) {
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'flex';
    btn.classList.toggle('expanded', !isVisible);
    if (text) {
      text.textContent = isVisible ? 'More options' : 'Hide options';
    }
  }
}

/**
 * Toggle DTG format mode
 */
function toggleDTGMode() {
  const checkbox = document.getElementById('useDTGFormat');
  dtgMode = checkbox ? checkbox.checked : !dtgMode;
  const dateInput = document.getElementById('date');

  if (dtgMode && dateInput) {
    // Convert current date to DTG format
    const now = new Date();
    dateInput.value = formatAsDTG(now);
    dateInput.placeholder = '141200ZDEC25';
  } else if (dateInput) {
    dateInput.placeholder = 'Auto-formats';
  }

  showStatus('info', dtgMode ? 'DTG format enabled' : 'Standard date format');
}

/**
 * Toggle serial number mode
 */
function toggleSerialNumber() {
  const checkbox = document.getElementById('useSerialNumber');
  serialMode = checkbox ? checkbox.checked : !serialMode;

  if (serialMode) {
    insertSerialNumber();
  } else {
    // Clear to just the office code portion
    const officeCodeField = document.getElementById('officeCode');
    if (officeCodeField) {
      const value = officeCodeField.value;
      // Remove /NNNN suffix if present
      officeCodeField.value = value.replace(/\/\d{4}$/, '');
    }
    showStatus('info', 'Serial number format disabled');
  }
}

/**
 * Format date as DTG (Date-Time Group)
 * Format: DDHHMM[Z]MONYY (e.g., 141200ZDEC25)
 * @param {Date} date - Date to format
 * @returns {string} DTG formatted string
 */
function formatAsDTG(date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const mins = String(date.getUTCMinutes()).padStart(2, '0');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getUTCMonth()];
  const year = String(date.getUTCFullYear()).slice(-2);

  return `${day}${hours}${mins}Z${month}${year}`;
}

/**
 * Check if current date field value is in DTG format
 */
function isDTGFormat(value) {
  return /^\d{6}Z[A-Z]{3}\d{2}$/.test(value);
}

// ============================================================
// SERIAL NUMBER GENERATOR
// ============================================================

let serialCounter = parseInt(sessionStorage.getItem('serialCounter') || '1');

/**
 * Generate next serial number
 * Format: OFFICE-CODE/NNNN (e.g., S-1/0045)
 */
function generateSerialNumber() {
  const officeCode = document.getElementById('officeCode')?.value?.trim() || 'S-1';
  const serialNum = String(serialCounter).padStart(4, '0');
  const serial = `${officeCode}/${serialNum}`;

  // Increment counter for next use
  serialCounter++;
  sessionStorage.setItem('serialCounter', serialCounter.toString());

  return serial;
}

/**
 * Insert serial number into office code field
 */
function insertSerialNumber() {
  const officeCodeField = document.getElementById('officeCode');
  if (!officeCodeField) return;

  const serial = generateSerialNumber();
  officeCodeField.value = serial;

  showStatus('success', `Serial number: ${serial}`);

  if (typeof updatePreview === 'function') {
    updatePreview();
  }
}

/**
 * Reset serial counter
 */
function resetSerialCounter() {
  if (confirm('Reset serial number counter to 1?')) {
    serialCounter = 1;
    sessionStorage.setItem('serialCounter', '1');
    showStatus('info', 'Serial counter reset to 0001');
  }
}

// ============================================================
// CHARACTER COUNT FOR SUBJECT LINE
// ============================================================

const SUBJECT_RECOMMENDED_MAX = 100;

/**
 * Update subject character count display
 */
function updateSubjectCharCount() {
  const subjField = document.getElementById('subj');
  const counter = document.getElementById('subjCharCount');

  if (!subjField || !counter) return;

  const len = subjField.value.length;
  counter.textContent = `${len}/${SUBJECT_RECOMMENDED_MAX}`;

  // Update styling based on length
  counter.classList.remove('count-warning', 'count-danger');
  if (len > SUBJECT_RECOMMENDED_MAX) {
    counter.classList.add('count-danger');
  } else if (len > SUBJECT_RECOMMENDED_MAX * 0.8) {
    counter.classList.add('count-warning');
  }
}

// ============================================================
// PII/PHI WARNING SYSTEM
// ============================================================

const PII_PATTERNS = [
  {
    name: 'Social Security Number',
    // Matches SSN formats: 123-45-6789, 123 45 6789, 123456789
    pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    severity: 'critical',
    message: 'Possible SSN detected. SSNs should never be included in correspondence.'
  },
  {
    name: 'DoD ID / EDIPI',
    // 10-digit EDIPI
    pattern: /\b\d{10}\b/g,
    severity: 'warning',
    message: 'Possible DoD ID (EDIPI) detected. Verify this is appropriate to include.'
  },
  {
    name: 'Date of Birth',
    // DOB formats: 01/15/1990, 01-15-1990, Jan 15 1990, etc.
    pattern: /\b(DOB|D\.O\.B\.|Date of Birth|Born)[:\s]+[\d\/\-\w\s,]+\d{4}\b/gi,
    severity: 'warning',
    message: 'Date of Birth detected. Ensure this is necessary for the correspondence.'
  },
  {
    name: 'Phone Number',
    // Phone formats: (555) 123-4567, 555-123-4567, 5551234567
    pattern: /\b(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    severity: 'info',
    message: 'Phone number detected. Verify this is appropriate for the classification level.'
  },
  {
    name: 'Email Address',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    severity: 'info',
    message: 'Email address detected.'
  },
  {
    name: 'Medical Information',
    // Common PHI terms
    pattern: /\b(diagnosis|prognosis|medical condition|treatment|medication|prescription|HIV|AIDS|mental health|psychiatric|disability rating|PTSD|TBI)\b/gi,
    severity: 'warning',
    message: 'Possible Protected Health Information (PHI) detected. Ensure proper handling.'
  },
  {
    name: 'Financial Account',
    // Bank account, credit card patterns
    pattern: /\b(account\s*#?:?\s*\d{4,}|routing\s*#?:?\s*\d{9}|\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/gi,
    severity: 'critical',
    message: 'Possible financial account number detected. This should not be in correspondence.'
  },
  {
    name: 'Home Address',
    // Street address patterns
    pattern: /\b\d+\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Boulevard|Blvd|Way|Circle|Cir)\b/gi,
    severity: 'info',
    message: 'Street address detected. Verify this is appropriate to include.'
  },
  {
    name: 'Passport Number',
    pattern: /\b(passport\s*#?:?\s*[A-Z0-9]{6,9})\b/gi,
    severity: 'critical',
    message: 'Possible passport number detected. This is sensitive PII.'
  }
];

// Track dismissed warnings per session
let dismissedPIIWarnings = new Set();

/**
 * Scan text for PII patterns
 * @param {string} text - Text to scan
 * @returns {Array} Array of detected PII items
 */
function scanForPII(text) {
  if (!text) return [];

  const findings = [];

  PII_PATTERNS.forEach(piiType => {
    const matches = text.match(piiType.pattern);
    if (matches) {
      matches.forEach(match => {
        // Create unique key for this finding
        const key = `${piiType.name}:${match}`;
        if (!dismissedPIIWarnings.has(key)) {
          findings.push({
            type: piiType.name,
            match: match,
            severity: piiType.severity,
            message: piiType.message,
            key: key
          });
        }
      });
    }
  });

  return findings;
}

/**
 * Scan entire form for PII
 * @returns {Array} Array of detected PII items
 */
function scanFormForPII() {
  const fieldsToScan = [
    'from', 'to', 'via', 'subj',
    'sigName', 'sigTitle',
    'unitAddress'
  ];

  let allText = '';

  // Scan standard fields
  fieldsToScan.forEach(id => {
    const field = document.getElementById(id);
    if (field?.value) {
      allText += ' ' + field.value;
    }
  });

  // Scan dynamic lists
  document.querySelectorAll('input[name="ref[]"], input[name="encl[]"], input[name="copy[]"]').forEach(input => {
    if (input.value) allText += ' ' + input.value;
  });

  // Scan paragraphs
  document.querySelectorAll('#paraContainer textarea').forEach(textarea => {
    if (textarea.value) allText += ' ' + textarea.value;
  });

  return scanForPII(allText);
}

/**
 * Show PII warning modal
 * @param {Array} findings - PII findings
 * @param {Function} onProceed - Callback if user proceeds
 */
function showPIIWarning(findings, onProceed) {
  // Group by severity
  const critical = findings.filter(f => f.severity === 'critical');
  const warnings = findings.filter(f => f.severity === 'warning');
  const info = findings.filter(f => f.severity === 'info');

  let html = `
    <div class="pii-warning-modal">
      <div class="pii-warning-header ${critical.length > 0 ? 'critical' : 'warning'}">
        <span class="pii-icon">${critical.length > 0 ? '⛔' : '⚠️'}</span>
        <h3>Potential PII/PHI Detected</h3>
      </div>
      <div class="pii-warning-body">
        <p>The following sensitive information was detected in your letter:</p>
  `;

  if (critical.length > 0) {
    html += `<div class="pii-section critical">
      <h4>Critical - Should Not Be Included</h4>
      <ul>${critical.map(f => `<li><strong>${f.type}:</strong> "${maskPII(f.match)}" - ${f.message}</li>`).join('')}</ul>
    </div>`;
  }

  if (warnings.length > 0) {
    html += `<div class="pii-section warning">
      <h4>Warning - Verify Necessity</h4>
      <ul>${warnings.map(f => `<li><strong>${f.type}:</strong> "${maskPII(f.match)}" - ${f.message}</li>`).join('')}</ul>
    </div>`;
  }

  if (info.length > 0) {
    html += `<div class="pii-section info">
      <h4>Information</h4>
      <ul>${info.map(f => `<li><strong>${f.type}:</strong> ${f.message}</li>`).join('')}</ul>
    </div>`;
  }

  html += `
        <p class="pii-reminder">Per MCO 5211.2B, PII must be protected and only included when operationally necessary.</p>
      </div>
      <div class="pii-warning-actions">
        <button type="button" class="btn btn-secondary" onclick="closePIIWarning()">Go Back & Edit</button>
        <button type="button" class="btn btn-warning" onclick="dismissPIIWarnings();closePIIWarning();window._piiProceedCallback && window._piiProceedCallback()">I Understand, Proceed</button>
      </div>
    </div>
  `;

  // Store callback
  window._piiProceedCallback = onProceed;
  window._currentPIIFindings = findings;

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'piiWarningModal';
  modal.className = 'modal show';
  modal.innerHTML = `<div class="modal-content pii-modal">${html}</div>`;
  document.body.appendChild(modal);
}

/**
 * Mask PII for display (show partial)
 */
function maskPII(text) {
  if (text.length <= 4) return '****';
  return text.slice(0, 2) + '*'.repeat(text.length - 4) + text.slice(-2);
}

/**
 * Close PII warning modal
 */
function closePIIWarning() {
  const modal = document.getElementById('piiWarningModal');
  if (modal) modal.remove();
  window._piiProceedCallback = null;
}

/**
 * Dismiss current PII warnings for this session
 */
function dismissPIIWarnings() {
  if (window._currentPIIFindings) {
    window._currentPIIFindings.forEach(f => {
      dismissedPIIWarnings.add(f.key);
    });
  }
}

// ============================================================
// CUI CLASSIFICATION REMINDER
// ============================================================

/**
 * Check if CUI classification is selected and show reminder
 * @returns {Promise<boolean>} True if should proceed
 */
function checkCUIClassification() {
  return new Promise((resolve) => {
    const classField = document.getElementById('classification');
    const classification = classField?.value || '';

    if (classification === 'CUI' || classification === 'FOUO') {
      showCUIReminder(classification, resolve);
    } else {
      resolve(true);
    }
  });
}

/**
 * Show CUI reminder modal
 */
function showCUIReminder(classification, callback) {
  const html = `
    <div class="cui-reminder-modal">
      <div class="cui-reminder-header">
        <span class="cui-icon">🔒</span>
        <h3>${classification} Document</h3>
      </div>
      <div class="cui-reminder-body">
        <p>You are about to generate a <strong>${classification}</strong> document.</p>
        <ul>
          <li>Ensure all content is appropriate for ${classification} classification</li>
          <li>Verify portion markings are correct on each paragraph</li>
          <li>Handle, store, and transmit per DoD 5200.48 and DoDM 5200.01</li>
          ${classification === 'CUI' ? '<li>CUI must be marked with CUI banner and designation indicator</li>' : ''}
        </ul>
        <p class="cui-question">Are you ready to generate this ${classification} document?</p>
      </div>
      <div class="cui-reminder-actions">
        <button type="button" class="btn btn-secondary" onclick="closeCUIReminder(false)">Cancel</button>
        <button type="button" class="btn btn-success" onclick="closeCUIReminder(true)">Yes, Generate</button>
      </div>
    </div>
  `;

  window._cuiCallback = callback;

  const modal = document.createElement('div');
  modal.id = 'cuiReminderModal';
  modal.className = 'modal show';
  modal.innerHTML = `<div class="modal-content cui-modal">${html}</div>`;
  document.body.appendChild(modal);
}

/**
 * Close CUI reminder modal
 */
function closeCUIReminder(proceed) {
  const modal = document.getElementById('cuiReminderModal');
  if (modal) modal.remove();

  if (window._cuiCallback) {
    window._cuiCallback(proceed);
    window._cuiCallback = null;
  }
}

// ============================================================
// DUPLICATE LETTER
// ============================================================

/**
 * Duplicate current letter to start a new one
 */
function duplicateLetter() {
  // Save current form data
  const formData = typeof getFormData === 'function' ? getFormData() : null;

  if (!formData) {
    showStatus('error', 'Could not read form data');
    return;
  }

  // Clear date and subject for new letter
  formData.date = '';
  formData.subj = '';

  // Store in session for immediate reload
  sessionStorage.setItem('duplicatedLetter', JSON.stringify(formData));

  // Reload to fresh form with data
  if (confirm('This will create a copy of the current letter with date and subject cleared. Continue?')) {
    // Apply duplicated data
    setTimeout(() => {
      const duplicated = sessionStorage.getItem('duplicatedLetter');
      if (duplicated) {
        const data = JSON.parse(duplicated);
        if (typeof loadFormData === 'function') {
          loadFormData(data);
        }
        sessionStorage.removeItem('duplicatedLetter');
        showStatus('success', 'Letter duplicated. Update subject and date for new letter.');
      }
    }, 100);
  }
}

// ============================================================
// RECENT DRAFTS (SESSION-ONLY)
// ============================================================

const MAX_RECENT_DRAFTS = 5;

/**
 * Save current form to recent drafts
 */
function saveToRecentDrafts() {
  const formData = typeof getFormData === 'function' ? getFormData() : null;
  if (!formData) return;

  // Create draft entry
  const draft = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    subject: formData.subj || 'Untitled',
    to: formData.to || 'Unknown',
    data: formData
  };

  // Get existing drafts
  let recentDrafts = JSON.parse(sessionStorage.getItem('recentDrafts') || '[]');

  // Add new draft at beginning
  recentDrafts.unshift(draft);

  // Limit to max
  recentDrafts = recentDrafts.slice(0, MAX_RECENT_DRAFTS);

  // Save back
  sessionStorage.setItem('recentDrafts', JSON.stringify(recentDrafts));

  updateRecentDraftsUI();
}

/**
 * Get recent drafts
 */
function getRecentDrafts() {
  return JSON.parse(sessionStorage.getItem('recentDrafts') || '[]');
}

/**
 * Load a recent draft
 */
function loadRecentDraft(draftId) {
  const drafts = getRecentDrafts();
  const draft = drafts.find(d => d.id === draftId);

  if (draft && draft.data) {
    if (typeof loadFormData === 'function') {
      loadFormData(draft.data);
      showStatus('success', `Loaded: ${draft.subject}`);
    }
  }
}

/**
 * Clear recent drafts
 */
function clearRecentDrafts() {
  if (confirm('Clear all recent drafts from this session?')) {
    sessionStorage.removeItem('recentDrafts');
    updateRecentDraftsUI();
    showStatus('info', 'Recent drafts cleared');
  }
}

/**
 * Update recent drafts UI
 */
function updateRecentDraftsUI() {
  const container = document.getElementById('recentDraftsContainer');
  if (!container) return;

  const drafts = getRecentDrafts();

  if (drafts.length === 0) {
    container.innerHTML = '<p class="recent-drafts-empty">No recent drafts in this session</p>';
    return;
  }

  let html = '<div class="recent-drafts-list">';
  drafts.forEach(draft => {
    const time = new Date(draft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    html += `
      <div class="recent-draft-item" onclick="loadRecentDraft(${draft.id})">
        <div class="draft-info">
          <span class="draft-subject">${escapeHtml(draft.subject.substring(0, 40))}${draft.subject.length > 40 ? '...' : ''}</span>
          <span class="draft-meta">To: ${escapeHtml(draft.to.substring(0, 25))} · ${time}</span>
        </div>
        <button type="button" class="draft-load-btn" title="Load this draft">Load</button>
      </div>
    `;
  });
  html += '</div>';
  html += '<button type="button" class="btn btn-sm btn-secondary" onclick="clearRecentDrafts()" style="margin-top: 8px;">Clear All</button>';

  container.innerHTML = html;
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// INITIALIZATION & INTEGRATION
// ============================================================

/**
 * Initialize all enhancements
 */
function initializeEnhancements() {
  // Subject character count
  const subjField = document.getElementById('subj');
  if (subjField) {
    subjField.addEventListener('input', updateSubjectCharCount);
    // Initial count
    updateSubjectCharCount();
  }

  // Auto-save to recent drafts on significant changes (debounced)
  let saveTimeout;
  document.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('change', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const subj = document.getElementById('subj')?.value;
        if (subj && subj.length > 5) {
          saveToRecentDrafts();
        }
      }, 2000);
    });
  });

  // Initialize recent drafts UI
  updateRecentDraftsUI();

  // Check for duplicated letter data
  const duplicated = sessionStorage.getItem('duplicatedLetter');
  if (duplicated) {
    setTimeout(() => {
      const data = JSON.parse(duplicated);
      if (typeof loadFormData === 'function') {
        loadFormData(data);
      }
      sessionStorage.removeItem('duplicatedLetter');
      showStatus('success', 'Letter duplicated. Update subject and date.');
    }, 500);
  }
}

/**
 * Safe PDF generation with PII check and CUI reminder
 * This is the main entry point - call this instead of direct generatePDF
 */
async function generatePDFSafe() {
  // Check for PII
  const piiFindings = scanFormForPII();

  if (piiFindings.length > 0) {
    showPIIWarning(piiFindings, async () => {
      // After PII acknowledged, check CUI
      const proceed = await checkCUIClassification();
      if (proceed && typeof generatePDF === 'function') {
        generatePDF();
      }
    });
    return;
  }

  // No PII found, check CUI
  const proceed = await checkCUIClassification();
  if (proceed && typeof generatePDF === 'function') {
    generatePDF();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancements);
} else {
  initializeEnhancements();
}
