/**
 * Naval Letter Generator - Smart Validation
 * Real-time validation and warnings for form fields
 */

// Validation rules
const VALIDATION_RULES = {
  subjectMaxLength: 100,
  minParagraphs: 1,
  refPatterns: [
    { regex: /^MCO\s+\d+\.\d+[A-Z]?$/i, name: 'MCO' },
    { regex: /^SECNAVINST\s+\d+\.\d+[A-Z]?$/i, name: 'SECNAVINST' },
    { regex: /^SECNAV M[\s-]\d+\.\d+$/i, name: 'SECNAV M' },
    { regex: /^DoD\s+\d+\.\d+-R$/i, name: 'DoD Directive' },
    { regex: /^MARADMIN\s+\d+\/\d+$/i, name: 'MARADMIN' },
    { regex: /^ALMAR\s+\d+\/\d+$/i, name: 'ALMAR' },
    { regex: /^Article\s+\d+/i, name: 'Article' },
    { regex: /^(UCMJ|MCM|JTR)$/i, name: 'Manual' }
  ]
};

// Validation state
let validationWarnings = [];

/**
 * Validate subject line length
 * @param {string} subject - Subject text
 * @returns {Object|null} Warning object or null
 */
function validateSubjectLength(subject) {
  if (!subject) return null;

  if (subject.length > VALIDATION_RULES.subjectMaxLength) {
    return {
      field: 'subject',
      type: 'warning',
      message: `Subject is ${subject.length} characters (recommended max: ${VALIDATION_RULES.subjectMaxLength})`
    };
  }
  return null;
}

/**
 * Validate required fields before download
 * @returns {Array} Array of validation errors
 */
function validateRequiredFields() {
  const errors = [];

  // Check From field
  const from = document.getElementById('from')?.value?.trim();
  if (!from) {
    errors.push({
      field: 'from',
      type: 'error',
      message: 'From field is required'
    });
  }

  // Check To field
  const to = document.getElementById('to')?.value?.trim();
  if (!to) {
    errors.push({
      field: 'to',
      type: 'error',
      message: 'To field is required'
    });
  }

  // Check Subject field
  const subj = document.getElementById('subj')?.value?.trim();
  if (!subj) {
    errors.push({
      field: 'subj',
      type: 'error',
      message: 'Subject is required'
    });
  }

  // Check for at least one paragraph
  const paras = document.querySelectorAll('#paraContainer .para-item');
  if (paras.length === 0) {
    errors.push({
      field: 'paragraphs',
      type: 'error',
      message: 'At least one paragraph is required'
    });
  } else {
    // Check if any paragraph has content
    let hasContent = false;
    paras.forEach(p => {
      const editor = p.querySelector('.para-editor');
      const text = editor ? editor.innerText : '';
      if (text.trim()) {
        hasContent = true;
      }
    });
    if (!hasContent) {
      errors.push({
        field: 'paragraphs',
        type: 'warning',
        message: 'No paragraph has content'
      });
    }
  }

  // Check signature
  const sigName = document.getElementById('sigName')?.value?.trim();
  if (!sigName) {
    errors.push({
      field: 'sigName',
      type: 'warning',
      message: 'Signature name is empty'
    });
  }

  return errors;
}

/**
 * Validate reference format
 * @param {string} ref - Reference text
 * @returns {Object|null} Warning object or null
 */
function validateReferenceFormat(ref) {
  if (!ref || ref.trim().length < 3) return null;

  ref = ref.trim();

  // Check if it matches any known pattern
  for (const pattern of VALIDATION_RULES.refPatterns) {
    if (pattern.regex.test(ref)) {
      return null; // Valid format
    }
  }

  // Check for common issues
  if (/^mco/i.test(ref) && !/MCO\s+\d/i.test(ref)) {
    return {
      field: 'reference',
      type: 'hint',
      message: `Tip: MCO format is "MCO 1234.56A" (e.g., MCO 1050.3J)`
    };
  }

  if (/^secnav/i.test(ref) && !/SECNAVINST\s+\d/i.test(ref)) {
    return {
      field: 'reference',
      type: 'hint',
      message: `Tip: SECNAVINST format is "SECNAVINST 1234.56H"`
    };
  }

  return null;
}

/**
 * Show validation indicator on a field
 * @param {HTMLElement} field - Input field
 * @param {string} type - 'error', 'warning', or 'hint'
 * @param {string} message - Message to show
 */
function showFieldValidation(field, type, message) {
  if (!field) return;

  // Remove existing indicator
  clearFieldValidation(field);

  // Add validation class
  field.classList.add(`validation-${type}`);

  // Create indicator element
  const indicator = document.createElement('span');
  indicator.className = `validation-indicator validation-${type}`;
  indicator.textContent = type === 'error' ? '⚠' : type === 'warning' ? '⚡' : '💡';
  indicator.title = message;

  // Insert after field
  field.parentNode.insertBefore(indicator, field.nextSibling);

  // Add tooltip on hover
  indicator.addEventListener('mouseenter', () => {
    showValidationTooltip(indicator, message, type);
  });
  indicator.addEventListener('mouseleave', hideValidationTooltip);
}

/**
 * Clear validation indicator from a field
 * @param {HTMLElement} field - Input field
 */
function clearFieldValidation(field) {
  if (!field) return;

  field.classList.remove('validation-error', 'validation-warning', 'validation-hint');

  const indicator = field.parentNode.querySelector('.validation-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Show validation tooltip
 */
function showValidationTooltip(anchor, message, type) {
  hideValidationTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = `validation-tooltip validation-tooltip-${type}`;
  tooltip.textContent = message;
  tooltip.id = 'validationTooltip';

  document.body.appendChild(tooltip);

  // Position tooltip
  const rect = anchor.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + 8}px`;
  tooltip.style.left = `${rect.left}px`;
}

/**
 * Hide validation tooltip
 */
function hideValidationTooltip() {
  const tooltip = document.getElementById('validationTooltip');
  if (tooltip) tooltip.remove();
}

/**
 * Run validation before PDF generation
 * @returns {boolean} True if validation passes (or user confirms warnings)
 */
function validateBeforeDownload() {
  const errors = validateRequiredFields();

  const criticalErrors = errors.filter(e => e.type === 'error');
  const warnings = errors.filter(e => e.type === 'warning');

  // Check subject length
  const subj = document.getElementById('subj')?.value?.trim();
  const subjWarning = validateSubjectLength(subj);
  if (subjWarning) warnings.push(subjWarning);

  // Show critical errors
  if (criticalErrors.length > 0) {
    const errorMessages = criticalErrors.map(e => `• ${e.message}`).join('\n');
    showStatus('error', `Cannot generate: ${criticalErrors[0].message}`);

    // Highlight first error field
    const firstError = criticalErrors[0];
    const field = document.getElementById(firstError.field);
    if (field) {
      field.focus();
      showFieldValidation(field, 'error', firstError.message);
    }

    return false;
  }

  // Show warnings (but allow proceed)
  if (warnings.length > 0) {
    const warningMessages = warnings.map(w => `• ${w.message}`).join('\n');

    // For single minor warning, just show status
    if (warnings.length === 1 && warnings[0].type === 'warning') {
      // Allow proceed with just a status message
      showStatus('loading', 'Generating...');
      return true;
    }

    // For multiple warnings, could prompt user (optional)
    return true;
  }

  return true;
}

/**
 * Set up real-time validation on subject field
 */
function setupSubjectValidation() {
  const subjField = document.getElementById('subj');
  if (!subjField) return;

  subjField.addEventListener('input', () => {
    const value = subjField.value;
    const warning = validateSubjectLength(value);

    if (warning) {
      showFieldValidation(subjField, 'warning', warning.message);
    } else {
      clearFieldValidation(subjField);
    }
  });
}

/**
 * Set up validation on reference inputs
 */
function setupReferenceValidation() {
  // Use event delegation for dynamic reference inputs
  const refList = document.getElementById('refList');
  if (!refList) return;

  refList.addEventListener('blur', (e) => {
    if (e.target.name === 'ref[]') {
      const warning = validateReferenceFormat(e.target.value);
      if (warning) {
        showFieldValidation(e.target, 'hint', warning.message);
      } else {
        clearFieldValidation(e.target);
      }
    }
  }, true);
}

/**
 * Initialize validation system
 */
function initializeValidation() {
  setupSubjectValidation();
  setupReferenceValidation();

  // Add CSS for validation indicators
  if (!document.getElementById('validationStyles')) {
    const style = document.createElement('style');
    style.id = 'validationStyles';
    style.textContent = `
      .validation-indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-left: 6px;
        font-size: 12px;
        cursor: help;
        vertical-align: middle;
      }

      .validation-error { border-color: var(--danger) !important; }
      .validation-warning { border-color: var(--warning) !important; }
      .validation-hint { border-color: var(--navy) !important; }

      .validation-tooltip {
        position: fixed;
        padding: 8px 12px;
        background: var(--gray-800);
        color: white;
        border-radius: var(--radius);
        font-size: 0.85rem;
        max-width: 300px;
        z-index: 10000;
        box-shadow: var(--shadow-lg);
      }

      .validation-tooltip-error { background: var(--danger); }
      .validation-tooltip-warning { background: #856404; }
      .validation-tooltip-hint { background: var(--navy); }
    `;
    document.head.appendChild(style);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeValidation);
} else {
  initializeValidation();
}
