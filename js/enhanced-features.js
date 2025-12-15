/**
 * Naval Letter Generator - Enhanced Features
 * Spell check, character count, and auto-format references
 */

// ============================================================
// SPELL CHECK
// ============================================================

// Common military abbreviations to ignore
const MILITARY_TERMS = new Set([
  'USMC', 'USN', 'HQMC', 'MCO', 'SECNAV', 'CMC', 'TECOM', 'MCCDC', 'MEF', 'MARDIV',
  'MAW', 'MLG', 'BN', 'CO', 'XO', 'SNCO', 'NCO', 'PVT', 'PFC', 'LCPL', 'CPL', 'SGT',
  'SSGT', 'GYSGT', 'MSGT', 'MGYSGT', 'SGTMAJ', '1STSGT', 'CAPT', 'MAJ', 'LTCOL', 'COL',
  'BGEN', 'MAJGEN', 'LTGEN', 'GEN', 'CWO', 'WO', 'ENS', 'LTJG', 'LT', 'LCDR', 'CDR',
  'RDML', 'RADM', 'VADM', 'ADM', 'PFT', 'CFT', 'BCP', 'PME', 'MOS', 'EDIPI', 'DOD',
  'DON', 'NMCI', 'SSIC', 'NJP', 'UA', 'TAD', 'PCS', 'EAS', 'SGLI', 'FSGLI', 'BAH',
  'BAS', 'OOD', 'SDNCO', 'DNCO', 'CDO', 'OIC', 'NCOIC', 'SOP', 'POA', 'ROE', 'OPSEC',
  'COMSEC', 'PERSEC', 'AAR', 'SITREP', 'SALUTE', 'IPB', 'COA', 'FRAGO', 'OPORD',
  'WARNO', 'LOI', 'SOM', 'MOA', 'MOU', 'LOA', 'DTG', 'DEROS', 'EAOS', 'PRD', 'PCM',
  'IAW', 'IOT', 'IRT', 'POC', 'NLT', 'NET', 'TBD', 'TBA', 'ASAP', 'COB', 'EOD',
  'MARSOC', 'SOCOM', 'CENTCOM', 'INDOPACOM', 'EUCOM', 'AFRICOM', 'SOUTHCOM', 'NORTHCOM',
  'LIMDU', 'MEDEVAC', 'CASEVAC', 'KIA', 'WIA', 'MIA', 'AWOL', 'CUI', 'FOUO'
]);

let spellCheckEnabled = false;
let spellCheckTimeout = null;

/**
 * Initialize spell check functionality
 */
function initSpellCheck() {
  const toggle = document.getElementById('spellCheckToggle');
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      spellCheckEnabled = e.target.checked;
      if (spellCheckEnabled) {
        runSpellCheckOnAll();
      } else {
        clearAllSpellCheckHighlights();
      }
    });
  }

  // Listen for paragraph changes
  document.getElementById('paraContainer')?.addEventListener('input', (e) => {
    if (spellCheckEnabled && e.target.matches('textarea')) {
      scheduleSpellCheck(e.target);
    }
  });
}

/**
 * Schedule spell check with debounce
 * @param {HTMLTextAreaElement} textarea
 */
function scheduleSpellCheck(textarea) {
  if (spellCheckTimeout) clearTimeout(spellCheckTimeout);
  spellCheckTimeout = setTimeout(() => {
    checkSpelling(textarea);
  }, 500);
}

/**
 * Check spelling for a textarea
 * @param {HTMLTextAreaElement} textarea
 */
function checkSpelling(textarea) {
  const text = textarea.value;
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  const misspelled = [];

  words.forEach(word => {
    // Skip military terms, short words, and all caps
    if (MILITARY_TERMS.has(word.toUpperCase())) return;
    if (word.length < 3) return;
    if (word === word.toUpperCase() && word.length <= 6) return;

    // Use browser's spellcheck if available
    if (!isWordValid(word)) {
      misspelled.push(word);
    }
  });

  // Update UI to show misspelled words
  const paraItem = textarea.closest('.para-item');
  let indicator = paraItem.querySelector('.spell-indicator');

  if (misspelled.length > 0) {
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'spell-indicator';
      indicator.style.cssText = 'color: var(--danger); font-size: 0.75rem; margin-left: 8px;';
      paraItem.querySelector('.para-main').appendChild(indicator);
    }
    indicator.textContent = `${misspelled.length} spelling issue${misspelled.length > 1 ? 's' : ''}`;
    indicator.title = 'Possible misspellings: ' + misspelled.slice(0, 5).join(', ');
    textarea.style.borderColor = 'var(--warning)';
  } else {
    if (indicator) indicator.remove();
    textarea.style.borderColor = '';
  }
}

/**
 * Simple word validation (checks against common patterns)
 * Note: This is a simplified check; real spell check would use a dictionary
 * @param {string} word
 * @returns {boolean}
 */
function isWordValid(word) {
  // Very basic check - real implementation would use dictionary API
  // For now, we'll rely on the browser's built-in spellcheck attribute
  // and flag obvious issues like repeated letters, no vowels, etc.

  const lower = word.toLowerCase();

  // Check for vowels (unless very short or abbreviation-like)
  if (word.length > 3 && !/[aeiou]/i.test(word)) {
    return false;
  }

  // Check for excessive repeated characters
  if (/(.)\1{3,}/.test(lower)) {
    return false;
  }

  // Check for obviously invalid patterns
  if (/[^a-z]/i.test(word)) {
    return false;
  }

  return true;
}

/**
 * Run spell check on all paragraphs
 */
function runSpellCheckOnAll() {
  document.querySelectorAll('#paraContainer textarea').forEach(textarea => {
    checkSpelling(textarea);
  });
}

/**
 * Clear all spell check highlights
 */
function clearAllSpellCheckHighlights() {
  document.querySelectorAll('.spell-indicator').forEach(el => el.remove());
  document.querySelectorAll('#paraContainer textarea').forEach(textarea => {
    textarea.style.borderColor = '';
  });
}

// ============================================================
// CHARACTER COUNT
// ============================================================

let charCountEnabled = false;

/**
 * Initialize character count functionality
 */
function initCharacterCount() {
  const toggle = document.getElementById('charCountToggle');
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      charCountEnabled = e.target.checked;
      if (charCountEnabled) {
        showCharacterCounts();
      } else {
        hideCharacterCounts();
      }
    });
  }

  // Listen for paragraph changes
  document.getElementById('paraContainer')?.addEventListener('input', (e) => {
    if (charCountEnabled && e.target.matches('textarea')) {
      updateCharacterCount(e.target);
    }
  });

  // Also update when paragraphs are added
  document.addEventListener('paragraphsChanged', () => {
    if (charCountEnabled) {
      showCharacterCounts();
    }
  });
}

/**
 * Update character count for a textarea
 * @param {HTMLTextAreaElement} textarea
 */
function updateCharacterCount(textarea) {
  const paraItem = textarea.closest('.para-item');
  let counter = paraItem.querySelector('.char-counter');

  const charCount = textarea.value.length;
  const wordCount = (textarea.value.match(/\b\w+\b/g) || []).length;

  if (!counter) {
    counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.style.cssText = 'color: var(--gray-500); font-size: 0.7rem; position: absolute; bottom: 4px; right: 8px; background: var(--white); padding: 2px 6px; border-radius: 3px;';
    const textareaWrapper = textarea.parentElement;
    textareaWrapper.style.position = 'relative';
    textareaWrapper.appendChild(counter);
  }

  counter.textContent = `${charCount} chars · ${wordCount} words`;

  // Warning colors for long paragraphs
  if (charCount > 500) {
    counter.style.color = 'var(--warning)';
  } else if (charCount > 300) {
    counter.style.color = 'var(--gray-600)';
  } else {
    counter.style.color = 'var(--gray-500)';
  }
}

/**
 * Show character counts on all paragraphs
 */
function showCharacterCounts() {
  document.querySelectorAll('#paraContainer textarea').forEach(textarea => {
    updateCharacterCount(textarea);
  });
}

/**
 * Hide all character counters
 */
function hideCharacterCounts() {
  document.querySelectorAll('.char-counter').forEach(el => el.remove());
}

// ============================================================
// AUTO-FORMAT REFERENCES
// ============================================================

/**
 * Initialize auto-format for references
 */
function initAutoFormatReferences() {
  const refList = document.getElementById('refList');
  if (!refList) return;

  // Listen for paste events on reference inputs
  refList.addEventListener('paste', (e) => {
    if (e.target.matches('input[name="ref[]"]')) {
      setTimeout(() => {
        autoFormatReference(e.target);
      }, 0);
    }
  });

  // Listen for blur to format
  refList.addEventListener('blur', (e) => {
    if (e.target.matches('input[name="ref[]"]')) {
      autoFormatReference(e.target);
    }
  }, true);
}

/**
 * Auto-format a reference input
 * @param {HTMLInputElement} input
 */
function autoFormatReference(input) {
  let value = input.value.trim();
  if (!value) return;

  // Remove any existing letter prefix like "(a)" or "a."
  value = value.replace(/^\s*\(?[a-z]\)?\.?\s*/i, '');

  // Common reference patterns and their formatted versions
  const patterns = [
    // MCO format: MCO 1234.56A
    {
      pattern: /^MCO\s*(\d{4})\.?(\d+)([A-Z])?$/i,
      format: (m) => `MCO ${m[1]}.${m[2]}${m[3] || ''}`
    },
    // SECNAV format
    {
      pattern: /^SECNAV\s*(?:M-?)?(\d{4})\.?(\d+)?$/i,
      format: (m) => `SECNAV M-${m[1]}${m[2] ? '.' + m[2] : ''}`
    },
    // MARADMIN format
    {
      pattern: /^MARADMIN\s*(\d+)\/(\d+)$/i,
      format: (m) => `MARADMIN ${m[1]}/${m[2]}`
    },
    // ALMAR format
    {
      pattern: /^ALMAR\s*(\d+)\/(\d+)$/i,
      format: (m) => `ALMAR ${m[1]}/${m[2]}`
    },
    // Letter reference: Unit ltr SSIC dtd DATE
    {
      pattern: /^(.+?)\s+(?:ltr|letter)\s+(\d{4,5})\s+(?:\w+-?\d*\s+)?(?:dtd|dated)\s+(.+)$/i,
      format: (m) => `${m[1]} ltr ${m[2]} dtd ${formatRefDate(m[3])}`
    },
    // Generic dated reference
    {
      pattern: /^(.+?)\s+(?:dtd|dated)\s+(.+)$/i,
      format: (m) => `${m[1]} dtd ${formatRefDate(m[2])}`
    }
  ];

  for (const { pattern, format } of patterns) {
    const match = value.match(pattern);
    if (match) {
      input.value = format(match);
      return;
    }
  }

  // If no pattern matched, just clean up spacing
  input.value = value.replace(/\s+/g, ' ');
}

/**
 * Format a date string for references (DD Mon YY)
 * @param {string} dateStr
 * @returns {string}
 */
function formatRefDate(dateStr) {
  // Try to parse the date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  }

  // If can't parse, return cleaned up version
  return dateStr.trim();
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize all enhanced features
 */
function initEnhancedFeatures() {
  initSpellCheck();
  initCharacterCount();
  initAutoFormatReferences();
}

// Export for module usage
if (typeof window !== 'undefined') {
  window.initEnhancedFeatures = initEnhancedFeatures;
  window.checkSpelling = checkSpelling;
  window.runSpellCheckOnAll = runSpellCheckOnAll;
  window.updateCharacterCount = updateCharacterCount;
  window.showCharacterCounts = showCharacterCounts;
  window.autoFormatReference = autoFormatReference;
}
