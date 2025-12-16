/**
 * Naval Letter Generator - Utilities
 * Common helper functions
 */

// Letter sequence for references and subparagraphs
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Get letter for index (supports >26 with double letters: aa, ab, etc.)
 * @param {number} index - Zero-based index
 * @returns {string} - Letter(s) for that index
 */
function getLetter(index) {
  if (index < 26) {
    return LETTERS[index];
  }
  // For 26+, use double letters: aa, ab, ac... ba, bb, bc...
  const first = Math.floor(index / 26) - 1;
  const second = index % 26;
  return LETTERS[first] + LETTERS[second];
}

/**
 * Escape special LaTeX characters
 * @param {string} str - Input string
 * @returns {string} - LaTeX-safe string
 */
function escapeLatex(str) {
  if (!str) return '';
  // Use placeholder for backslash to prevent double-escaping of {} in \textbackslash{}
  const BACKSLASH_PLACEHOLDER = '\x00BACKSLASH\x00';
  return str
    .replace(/\\/g, BACKSLASH_PLACEHOLDER)
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(new RegExp(BACKSLASH_PLACEHOLDER, 'g'), '\\textbackslash{}');
}

/**
 * Ensure double spaces after periods (military correspondence standard)
 * @param {string} str - Input string
 * @returns {string} - String with double spaces after periods
 */
function ensureDoubleSpaces(str) {
  if (!str) return '';
  // Replace period + single space (not at end) with period + double space
  // Also handles multiple periods (e.g., "sentence. Another. Third.")
  return str.replace(/\.(\s)(?=\S)/g, '.  ');
}

/**
 * Format date to naval standard (DD Mon YY)
 * @param {string} value - Input date string
 * @returns {string|null} - Formatted date or null if invalid
 */
function formatDateValue(value) {
  if (!value) return null;

  value = value.trim().toLowerCase();
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthsFull = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  let date = null;

  // Handle special keywords
  if (value === 'today' || value === 'now') {
    date = new Date();
  } else {
    // MM/DD/YYYY or MM-DD-YYYY
    let match = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (match) {
      const year = match[3].length === 2 ? '20' + match[3] : match[3];
      date = new Date(year, parseInt(match[1]) - 1, parseInt(match[2]));
    }

    // YYYY-MM-DD
    if (!date) {
      match = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
      if (match) {
        date = new Date(match[1], parseInt(match[2]) - 1, parseInt(match[3]));
      }
    }

    // Mon DD YYYY or DD Mon YYYY
    // Require separators between parts to prevent "2024" being split as day "20" + year "24"
    if (!date) {
      for (let i = 0; i < months.length; i++) {
        const patterns = [
          // Mon DD, YYYY or Mon DD YYYY (require space after month, separator before year)
          new RegExp(`(${months[i]}|${monthsFull[i]})\\s+(\\d{1,2})[,\\s]+(\\d{2,4})`, 'i'),
          // DD Mon YYYY (require space around month, separator before year)
          new RegExp(`(\\d{1,2})\\s+(${months[i]}|${monthsFull[i]})[,\\s]+(\\d{2,4})`, 'i')
        ];
        for (const pattern of patterns) {
          match = value.match(pattern);
          if (match) {
            const day = match[1].length <= 2 ? match[1] : match[2];
            const yr = match[3].length === 2 ? '20' + match[3] : match[3];
            date = new Date(yr, i, parseInt(day));
            break;
          }
        }
        if (date) break;
      }
    }
  }

  if (date && !isNaN(date)) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()].charAt(0).toUpperCase() + months[date.getMonth()].slice(1);
    const year = String(date.getFullYear()).slice(-2);
    return `${day} ${month} ${year}`;
  }

  return null;
}

/**
 * Get today's date in naval format
 * @returns {string} - Formatted date (DD Mon YY)
 */
function getTodayFormatted() {
  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(today.getDate()).padStart(2, '0')} ${months[today.getMonth()]} ${String(today.getFullYear()).slice(-2)}`;
}

/**
 * Show status message to user
 * @param {string} type - 'success', 'error', or 'loading'
 * @param {string} msg - Message to display
 */
function showStatus(type, msg) {
  const s = document.getElementById('status');
  s.className = `status show ${type}`;
  s.textContent = msg;
  if (type !== 'loading') {
    setTimeout(() => s.classList.remove('show'), 5000);
  }
}

/**
 * Get jsPDF font name from font family value
 * @param {string} fontFamily - Font family value (times, arial, courier, georgia)
 * @returns {string} - jsPDF font name
 */
function getJsPDFFont(fontFamily) {
  const fontMap = {
    'times': 'times',
    'arial': 'helvetica',  // jsPDF uses helvetica for sans-serif
    'courier': 'courier',
    'georgia': 'times'     // Georgia not in jsPDF, fallback to times
  };
  return fontMap[fontFamily] || 'times';
}

/**
 * Calculate line height based on font size
 * @param {number} fontSize - Font size in points
 * @returns {number} - Line height in points
 */
function getLineHeight(fontSize) {
  // Standard line height is approximately 1.15-1.2x font size for body text
  return Math.round(fontSize * 1.17);
}

/**
 * Generate filename from subject
 * @param {string} subject - Subject line
 * @param {string} extension - File extension
 * @returns {string} - Sanitized filename
 */
function generateFilename(subject, extension) {
  if (subject) {
    // Sanitize: lowercase, replace non-alphanumeric with underscore, trim underscores
    const sanitized = subject
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')  // Trim leading/trailing underscores
      .substring(0, 30);

    // Return sanitized name if valid, otherwise default
    if (sanitized && sanitized.length > 0) {
      return sanitized + '.' + extension;
    }
  }
  return 'naval_letter.' + extension;
}

// Export for module usage (when bundled)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LETTERS,
    escapeLatex,
    ensureDoubleSpaces,
    formatDateValue,
    getTodayFormatted,
    showStatus,
    getJsPDFFont,
    getLineHeight,
    generateFilename
  };
}
