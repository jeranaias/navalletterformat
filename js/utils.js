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

/**
 * Parse HTML content into formatted text segments for PDF rendering
 * Supports: bold, italic, underline, strikethrough
 * @param {string} html - HTML string from contenteditable
 * @returns {Array} - Array of segments: { text, bold, italic, underline, strike }
 */
function parseHtmlToSegments(html) {
  if (!html) return [{ text: '', bold: false, italic: false, underline: false, strike: false }];

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  const segments = [];

  function walkNode(node, formatting) {
    // Clone formatting state
    const fmt = { ...formatting };

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        segments.push({
          text: text,
          bold: fmt.bold,
          italic: fmt.italic,
          underline: fmt.underline,
          strike: fmt.strike
        });
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();

      // Update formatting based on tag
      if (tag === 'b' || tag === 'strong') fmt.bold = true;
      if (tag === 'i' || tag === 'em') fmt.italic = true;
      if (tag === 'u') fmt.underline = true;
      if (tag === 's' || tag === 'strike' || tag === 'del') fmt.strike = true;

      // Check for style attribute
      const style = node.style;
      if (style) {
        if (style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700) fmt.bold = true;
        if (style.fontStyle === 'italic') fmt.italic = true;
        if (style.textDecoration && style.textDecoration.includes('underline')) fmt.underline = true;
        if (style.textDecoration && style.textDecoration.includes('line-through')) fmt.strike = true;
      }

      // Handle line breaks
      if (tag === 'br') {
        segments.push({ text: '\n', bold: false, italic: false, underline: false, strike: false });
        return;
      }

      // Handle div/p as line breaks (but not the first one)
      if ((tag === 'div' || tag === 'p') && segments.length > 0) {
        const lastSeg = segments[segments.length - 1];
        if (lastSeg && !lastSeg.text.endsWith('\n')) {
          segments.push({ text: '\n', bold: false, italic: false, underline: false, strike: false });
        }
      }

      // Recursively process children
      for (const child of node.childNodes) {
        walkNode(child, fmt);
      }
    }
  }

  walkNode(temp, { bold: false, italic: false, underline: false, strike: false });

  // Merge adjacent segments with same formatting
  const merged = [];
  for (const seg of segments) {
    if (merged.length > 0) {
      const last = merged[merged.length - 1];
      if (last.bold === seg.bold && last.italic === seg.italic &&
          last.underline === seg.underline && last.strike === seg.strike) {
        last.text += seg.text;
        continue;
      }
    }
    merged.push({ ...seg });
  }

  return merged.length > 0 ? merged : [{ text: '', bold: false, italic: false, underline: false, strike: false }];
}

/**
 * Render formatted segments to PDF with line wrapping
 * Supports different X position and width for first line vs continuation lines
 * @param {jsPDF} pdf - jsPDF instance
 * @param {Array} segments - Array from parseHtmlToSegments
 * @param {Object} options - Rendering options
 * @param {number} options.firstLineX - X position for first line
 * @param {number} options.firstLineWidth - Max width for first line
 * @param {number} options.contX - X position for continuation lines
 * @param {number} options.contWidth - Max width for continuation lines
 * @param {number} options.y - Starting Y position
 * @param {number} options.lineHeight - Line height
 * @param {string} options.fontName - Base font name (times, helvetica, courier)
 * @param {number} options.fontSize - Font size
 * @param {function} options.pageBreak - Optional page break function(neededHeight)
 * @returns {number} - Final Y position after rendering
 */
function renderFormattedText(pdf, segments, options) {
  const {
    firstLineX,
    firstLineWidth,
    contX,
    contWidth,
    y: startY,
    lineHeight,
    fontName,
    fontSize,
    pageBreak
  } = options;

  let x = firstLineX;
  let currentY = startY;
  let currentLineWidth = firstLineWidth;
  let currentLineX = firstLineX;
  let isFirstLine = true;
  let justDidPageBreak = false; // Track if we just did a page break

  // Flatten segments into words with formatting
  const words = [];
  for (const seg of segments) {
    if (seg.text === '\n') {
      words.push({ text: '\n', ...seg });
      continue;
    }

    // Split by spaces but keep spaces attached to words
    const parts = seg.text.split(/(\s+)/);
    for (const part of parts) {
      if (part) {
        words.push({
          text: part,
          bold: seg.bold,
          italic: seg.italic,
          underline: seg.underline,
          strike: seg.strike
        });
      }
    }
  }

  function setFont(word) {
    let style = 'normal';
    if (word.bold && word.italic) style = 'bolditalic';
    else if (word.bold) style = 'bold';
    else if (word.italic) style = 'italic';
    pdf.setFont(fontName, style);
    pdf.setFontSize(fontSize);
  }

  function getWordWidth(word) {
    setFont(word);
    return pdf.getTextWidth(word.text);
  }

  function drawWord(word, wx, wy) {
    setFont(word);
    pdf.text(word.text, wx, wy);

    const width = pdf.getTextWidth(word.text);

    // Draw underline
    if (word.underline) {
      const underlineY = wy + 1.5;
      pdf.setLineWidth(0.5);
      pdf.line(wx, underlineY, wx + width, underlineY);
    }

    // Draw strikethrough
    if (word.strike) {
      const strikeY = wy - fontSize * 0.3;
      pdf.setLineWidth(0.5);
      pdf.line(wx, strikeY, wx + width, strikeY);
    }

    return width;
  }

  function newLine() {
    isFirstLine = false;
    currentLineX = contX;
    currentLineWidth = contWidth;
    x = currentLineX;
    currentY += lineHeight;
    // pageBreak receives current Y position and returns new Y (reset if page added)
    if (pageBreak) {
      const newY = pageBreak(currentY);
      if (typeof newY === 'number' && newY !== currentY) {
        currentY = newY;
        justDidPageBreak = true; // Flag that we just did a page break
      }
    }
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Handle explicit line breaks
    if (word.text === '\n') {
      // Skip consecutive newlines after a page break to avoid extra spacing
      if (justDidPageBreak) {
        continue;
      }
      newLine();
      continue;
    }

    // Reset the page break flag when we encounter actual content
    if (word.text.trim() !== '') {
      justDidPageBreak = false;
    }

    const wordWidth = getWordWidth(word);

    // Check if we need to wrap
    if (x + wordWidth > currentLineX + currentLineWidth && x > currentLineX) {
      // Don't wrap if it's just whitespace
      if (word.text.trim() === '') {
        continue; // Skip trailing whitespace at line end
      }
      newLine();
    }

    // Draw the word
    const drawnWidth = drawWord(word, x, currentY);
    x += drawnWidth;
  }

  // Reset font to normal
  pdf.setFont(fontName, 'normal');

  return currentY;
}

/**
 * Calculate height needed for formatted text
 * @param {jsPDF} pdf - jsPDF instance
 * @param {Array} segments - Array from parseHtmlToSegments
 * @param {number} firstLineWidth - Max width for first line
 * @param {number} contWidth - Max width for continuation lines
 * @param {number} lineHeight - Line height
 * @param {string} fontName - Base font name
 * @param {number} fontSize - Font size
 * @returns {number} - Height in points
 */
function getFormattedTextHeight(pdf, segments, firstLineWidth, contWidth, lineHeight, fontName, fontSize) {
  let x = 0;
  let lines = 1;
  let currentWidth = firstLineWidth;

  for (const seg of segments) {
    if (seg.text === '\n') {
      x = 0;
      lines++;
      currentWidth = contWidth;
      continue;
    }

    // Set font for accurate width measurement
    let style = 'normal';
    if (seg.bold && seg.italic) style = 'bolditalic';
    else if (seg.bold) style = 'bold';
    else if (seg.italic) style = 'italic';
    pdf.setFont(fontName, style);
    pdf.setFontSize(fontSize);

    const parts = seg.text.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      const wordWidth = pdf.getTextWidth(part);

      if (x + wordWidth > currentWidth && x > 0 && part.trim() !== '') {
        x = 0;
        lines++;
        currentWidth = contWidth;
      }
      x += wordWidth;
    }
  }

  // Reset font
  pdf.setFont(fontName, 'normal');

  return lines * lineHeight;
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
    generateFilename,
    parseHtmlToSegments,
    renderFormattedText,
    getFormattedTextHeight
  };
}
