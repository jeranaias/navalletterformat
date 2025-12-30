/**
 * Naval Letter Generator - Batch Generator
 * Generate multiple letters from CSV data
 * Supports both CSV upload and inline table editing
 */

// ============================================================
// BATCH GENERATION
// ============================================================

let batchData = null;
let batchTemplate = null;

// Default columns for the editable table
const BATCH_COLUMNS = ['name', 'rank', 'to', 'subject', 'date', 'ssic', 'reason', 'period'];

// Column display names
const COLUMN_LABELS = {
  name: 'Name',
  rank: 'Rank',
  to: 'To',
  subject: 'Subject',
  date: 'Date',
  ssic: 'SSIC',
  reason: 'Reason',
  period: 'Period'
};

/**
 * Initialize batch generation modal and handlers
 */
function initBatchGenerator() {
  const modal = document.getElementById('batchModal');
  const openBtn = document.getElementById('batchGenerateBtn');
  const closeBtn = document.getElementById('batchModalClose');
  const csvInput = document.getElementById('batchCsvInput');
  const generateBtn = document.getElementById('batchGenerateSubmit');

  if (openBtn) {
    openBtn.addEventListener('click', openBatchModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeBatchModal);
  }

  if (csvInput) {
    csvInput.addEventListener('change', handleBatchCsvUpload);
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generateBatchLetters);
  }

  // Close on click outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBatchModal();
    });
  }

  // Make signature options mutually exclusive
  const keepSigCheckbox = document.getElementById('batchKeepSignature');
  const nameIsSigCheckbox = document.getElementById('batchNameIsSignature');

  if (keepSigCheckbox && nameIsSigCheckbox) {
    keepSigCheckbox.addEventListener('change', () => {
      if (keepSigCheckbox.checked) {
        nameIsSigCheckbox.checked = false;
      }
    });
    nameIsSigCheckbox.addEventListener('change', () => {
      if (nameIsSigCheckbox.checked) {
        keepSigCheckbox.checked = false;
      }
    });
  }
}

/**
 * Open batch generation modal
 */
function openBatchModal() {
  const modal = document.getElementById('batchModal');
  if (modal) {
    // Save current form as template
    batchTemplate = collectData();
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Initialize editable table if not already populated
    if (!batchData || batchData.length === 0) {
      initEditableTable(3);
    } else {
      renderEditableTable();
      updateBatchCount();
    }
  }
}

/**
 * Close batch generation modal
 */
function closeBatchModal() {
  const modal = document.getElementById('batchModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

/**
 * Handle CSV file upload - populates the editable table
 * @param {Event} e
 */
function handleBatchCsvUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const csvData = parseCSV(event.target.result);

      // Map CSV columns to our standard columns
      batchData = csvData.map(row => {
        const mappedRow = createEmptyRow();
        BATCH_COLUMNS.forEach(col => {
          if (row[col] !== undefined) {
            mappedRow[col] = row[col];
          }
        });
        return mappedRow;
      });

      // Render the editable table with imported data
      renderEditableTable();
      updateBatchCount();
      showStatus('success', `Imported ${batchData.length} rows from CSV`);

      // Reset file input so same file can be re-uploaded
      e.target.value = '';
    } catch (error) {
      showStatus('error', 'Failed to parse CSV file');
      console.error('CSV parse error:', error);
    }
  };
  reader.readAsText(file);
}

/**
 * Parse CSV string into array of objects
 * @param {string} csvText
 * @returns {Array}
 */
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have header row and at least one data row');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header.trim().toLowerCase()] = values[idx].trim();
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse a single CSV line (handles quoted fields)
 * @param {string} line
 * @returns {Array}
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// ============================================================
// EDITABLE TABLE FUNCTIONS
// ============================================================

/**
 * Initialize the editable batch table with empty rows
 * @param {number} initialRows - Number of rows to start with
 */
function initEditableTable(initialRows = 3) {
  batchData = [];
  for (let i = 0; i < initialRows; i++) {
    batchData.push(createEmptyRow());
  }
  renderEditableTable();
  updateBatchCount();
}

/**
 * Create an empty row object
 * @returns {Object}
 */
function createEmptyRow() {
  const row = {};
  BATCH_COLUMNS.forEach(col => {
    row[col] = '';
  });
  return row;
}

/**
 * Render the editable table
 */
function renderEditableTable() {
  const container = document.getElementById('batchTableEditor');
  if (!container || !batchData) return;

  let html = '<table class="batch-edit-table">';

  // Header row
  html += '<thead><tr>';
  html += '<th class="row-num">#</th>';
  BATCH_COLUMNS.forEach(col => {
    html += `<th>${COLUMN_LABELS[col]}</th>`;
  });
  html += '<th class="row-actions"></th>';
  html += '</tr></thead>';

  // Data rows
  html += '<tbody>';
  batchData.forEach((row, rowIdx) => {
    html += `<tr data-row="${rowIdx}">`;
    html += `<td class="row-num">${rowIdx + 1}</td>`;
    BATCH_COLUMNS.forEach(col => {
      const value = row[col] || '';
      const placeholder = col === 'name' ? 'Smith J.M.' :
                         col === 'rank' ? 'Cpl' :
                         col === 'to' ? 'Commanding Officer' :
                         col === 'subject' ? 'REQUEST FOR...' :
                         col === 'date' ? '16 Dec 24' :
                         col === 'ssic' ? '1050' :
                         col === 'reason' ? 'Holiday leave' :
                         col === 'period' ? '20-31 Dec 24' : '';
      html += `<td><input type="text" class="batch-cell" data-row="${rowIdx}" data-col="${col}" value="${escapeHtml(value)}" placeholder="${placeholder}" onchange="updateBatchCell(${rowIdx}, '${col}', this.value)"></td>`;
    });
    html += `<td class="row-actions"><button type="button" class="btn-icon btn-remove-row" onclick="removeBatchRow(${rowIdx})" title="Remove row" aria-label="Remove row ${rowIdx + 1}">&times;</button></td>`;
    html += '</tr>';
  });
  html += '</tbody></table>';

  container.innerHTML = html;
}

/**
 * Escape HTML entities for safe display
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

/**
 * Update a cell in batchData
 * @param {number} rowIdx
 * @param {string} col
 * @param {string} value
 */
function updateBatchCell(rowIdx, col, value) {
  if (batchData && batchData[rowIdx]) {
    batchData[rowIdx][col] = value;
  }
  updateBatchCount();
}

/**
 * Add a new row to the batch table
 */
function addBatchRow() {
  if (!batchData) batchData = [];
  batchData.push(createEmptyRow());
  renderEditableTable();
  updateBatchCount();

  // Focus the first cell of the new row
  setTimeout(() => {
    const lastRow = batchData.length - 1;
    const firstInput = document.querySelector(`input[data-row="${lastRow}"][data-col="name"]`);
    if (firstInput) firstInput.focus();
  }, 50);
}

/**
 * Remove a row from the batch table
 * @param {number} rowIdx
 */
function removeBatchRow(rowIdx) {
  if (!batchData || batchData.length <= 1) {
    showStatus('info', 'Need at least one row');
    return;
  }
  batchData.splice(rowIdx, 1);
  renderEditableTable();
  updateBatchCount();
}

/**
 * Clear all rows and start fresh
 */
function clearBatchTable() {
  if (confirm('Clear all rows and start fresh?')) {
    initEditableTable(3);
  }
}

/**
 * Update the batch count display
 */
function updateBatchCount() {
  const countEl = document.getElementById('batchCount');
  const generateBtn = document.getElementById('batchGenerateSubmit');

  if (!batchData) {
    if (countEl) countEl.textContent = '';
    if (generateBtn) generateBtn.disabled = true;
    return;
  }

  // Count non-empty rows (rows with at least name or to filled)
  const validRows = batchData.filter(row =>
    (row.name && row.name.trim()) || (row.to && row.to.trim())
  );

  if (countEl) {
    countEl.textContent = validRows.length > 0
      ? `${validRows.length} letter${validRows.length !== 1 ? 's' : ''} ready`
      : 'Fill in at least one row';
  }

  if (generateBtn) {
    generateBtn.disabled = validRows.length === 0;
  }
}

/**
 * Collect data from editable table (filters empty rows)
 * @returns {Array}
 */
function collectValidBatchData() {
  if (!batchData) return [];
  return batchData.filter(row =>
    (row.name && row.name.trim()) || (row.to && row.to.trim())
  );
}

/**
 * Display batch data preview
 */
function displayBatchPreview() {
  const preview = document.getElementById('batchPreview');
  const countEl = document.getElementById('batchCount');

  if (!preview || !batchData) return;

  countEl.textContent = `${batchData.length} records found`;

  // Show first few records
  const headers = Object.keys(batchData[0] || {});

  let html = '<table class="batch-preview-table">';
  html += '<thead><tr>';
  headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += '</tr></thead><tbody>';

  const displayCount = Math.min(batchData.length, 5);
  for (let i = 0; i < displayCount; i++) {
    html += '<tr>';
    headers.forEach(h => {
      const val = batchData[i][h] || '';
      html += `<td>${val.substring(0, 30)}${val.length > 30 ? '...' : ''}</td>`;
    });
    html += '</tr>';
  }

  if (batchData.length > 5) {
    html += `<tr><td colspan="${headers.length}" style="text-align:center; color:var(--gray-500);">... and ${batchData.length - 5} more</td></tr>`;
  }

  html += '</tbody></table>';

  // Show field mapping hints
  html += '<div class="batch-mapping-hints" style="margin-top:16px; font-size:0.85rem; color:var(--gray-600);">';
  html += '<strong>Supported columns:</strong> name, rank, unit, from, to, subject, date, ssic, reason, period<br>';
  html += 'Use <code>{{column_name}}</code> in your current form to create placeholders.';
  html += '</div>';

  preview.innerHTML = html;
  preview.style.display = 'block';

  // Enable generate button
  const generateBtn = document.getElementById('batchGenerateSubmit');
  if (generateBtn) generateBtn.disabled = false;
}

/**
 * Generate batch letters
 */
async function generateBatchLetters() {
  const validData = collectValidBatchData();

  if (!validData || validData.length === 0) {
    showStatus('error', 'No valid rows - fill in at least name or to field');
    return;
  }

  if (!batchTemplate) {
    showStatus('error', 'Please fill out the form first as a template');
    return;
  }

  showStatus('loading', `Generating ${validData.length} letters...`);

  try {
    if (!window.jspdf) {
      showStatus('error', 'PDF library not loaded. Please refresh the page.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const zip = new JSZip();

    for (let i = 0; i < validData.length; i++) {
      const rowData = validData[i];

      // Merge template with row data
      const letterData = mergeTemplateData(batchTemplate, rowData);

      // Generate PDF
      const pdfBlob = await generatePDFFromData(letterData);

      // Create filename
      const name = rowData.name || rowData.to || `letter_${i + 1}`;
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const filename = `${safeName}_${letterData.ssic || 'letter'}.pdf`;

      zip.file(filename, pdfBlob);

      // Update progress
      showStatus('loading', `Generating ${i + 1} of ${validData.length}...`);
    }

    // Download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_letters_${new Date().toISOString().slice(0,10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    showStatus('success', `Generated ${validData.length} letters!`);
    closeBatchModal();

  } catch (error) {
    console.error('Batch generation error:', error);
    showStatus('error', 'Failed to generate batch letters');
  }
}

/**
 * Merge template data with CSV row data
 * @param {Object} template - Base template from form
 * @param {Object} rowData - CSV row data
 * @returns {Object} - Merged data
 */
function mergeTemplateData(template, rowData) {
  const merged = JSON.parse(JSON.stringify(template));

  // Check signature options
  const keepSignature = document.getElementById('batchKeepSignature')?.checked ?? true;
  const nameIsSignature = document.getElementById('batchNameIsSignature')?.checked ?? false;

  // Replace placeholders in string fields
  const replaceInString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return rowData[key.toLowerCase()] || match;
    });
  };

  // Process all string fields (for {{placeholder}} replacement)
  Object.keys(merged).forEach(key => {
    if (typeof merged[key] === 'string') {
      merged[key] = replaceInString(merged[key]);
    } else if (Array.isArray(merged[key])) {
      merged[key] = merged[key].map(item => {
        if (typeof item === 'string') {
          return replaceInString(item);
        } else if (typeof item === 'object') {
          const newItem = { ...item };
          Object.keys(newItem).forEach(k => {
            if (typeof newItem[k] === 'string') {
              newItem[k] = replaceInString(newItem[k]);
            }
          });
          return newItem;
        }
        return item;
      });
    }
  });

  // Direct field mappings (override if CSV has these columns)
  // Note: 'name' handling depends on checkbox options
  const directMappings = {
    'to': 'to',
    'from': 'from',
    'subject': 'subj',
    'date': 'date',
    'ssic': 'ssic'
  };

  Object.entries(directMappings).forEach(([csvKey, formKey]) => {
    if (rowData[csvKey]) {
      merged[formKey] = rowData[csvKey];
    }
  });

  // Handle signature based on options
  if (nameIsSignature && rowData.name) {
    // "Name = Signature" mode: each person signs their own letter
    merged.sigName = rowData.name;
    // Also set From to the name if not explicitly provided
    if (!rowData.from) {
      merged.from = rowData.name;
    }
  }
  // If "Keep my signature" is checked, we don't touch sigName - it stays from template

  return merged;
}

/**
 * Generate PDF from data object (similar to generatePDF but returns blob)
 * @param {Object} d - Letter data
 * @returns {Promise<Blob>}
 */
async function generatePDFFromData(d) {
  // This uses the same logic as generatePDFBlob from preview-manager
  // but accepts data directly instead of collecting from form
  if (!window.jspdf) {
    throw new Error('PDF library not loaded');
  }
  const { jsPDF } = window.jspdf;

  // Font settings
  const fontName = getJsPDFFont(d.fontFamily);
  const fontSize = d.fontSize || 12;
  const LH = getLineHeight(fontSize);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const PW = 612;
  const PH = 792;
  const ML = 72;
  const MR = 72;
  const MT = 72;
  const MB = 72;
  const CW = PW - ML - MR;
  const TAB = 45;

  let y = 54;
  let pageNum = 1;
  const subjText = (d.subj || '').toUpperCase();

  function pageBreak(need) {
    if (y + need > PH - MB) {
      pdf.addPage();
      pageNum++;
      y = MT;

      if (d.classification) {
        pdf.setFont(fontName, 'bold');
        pdf.setFontSize(fontSize);
        pdf.text(d.classification, PW / 2, 20, { align: 'center' });
      }

      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(fontSize);
      pdf.text('Subj:', ML, y);

      const subjLines = pdf.splitTextToSize(subjText, CW - TAB);
      subjLines.forEach((line) => {
        pdf.text(line, ML + TAB, y);
        y += LH;
      });
      y += LH;
    }
  }

  // Classification at top
  if (d.classification) {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(fontSize);
    pdf.text(d.classification, PW / 2, 20, { align: 'center' });
  }

  // Letterhead
  if (d.useLetterhead) {
    if (d.hasSeal && d.sealData) {
      try {
        pdf.addImage(d.sealData, 'JPEG', 36, 36, 72, 72);
      } catch (e) {
        console.warn('Could not add seal image:', e);
      }
    }

    if (d.unitName) {
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(Math.max(fontSize - 2, 8));
      pdf.text(d.unitName.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 12;
    }

    if (d.unitAddress) {
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(Math.max(fontSize - 4, 7));
      const addrLines = d.unitAddress.split('\n');
      addrLines.forEach(line => {
        pdf.text(line.toUpperCase(), PW / 2, y, { align: 'center' });
        y += 10;
      });
    }

    y = Math.max(y, 130);
  }

  // MEMORANDUM header
  if (d.documentType === 'memorandum') {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(fontSize);
    pdf.text('MEMORANDUM', PW / 2, y, { align: 'center' });
    y += LH * 2;
  }

  // Sender's symbols
  const senderX = PW - MR - 72;
  pdf.setFont(fontName, 'normal');
  pdf.setFontSize(fontSize);

  if (d.ssic) {
    pdf.text(d.ssic, senderX, y);
    y += LH;
  }
  if (d.officeCode) {
    pdf.text(d.officeCode, senderX, y);
    y += LH;
  }
  if (d.date) {
    pdf.text(d.date, senderX, y);
    y += LH * 2;
  }

  // From, To, Via, Subject
  pdf.text('From:', ML, y);
  pdf.text(d.from || '', ML + TAB, y);
  y += LH;

  pdf.text('To:', ML, y);
  pdf.text(d.to || '', ML + TAB, y);
  y += LH;

  if (d.via && d.via.length > 0) {
    d.via.forEach((v, i) => {
      const label = d.via.length > 1 ? `Via: (${i + 1})` : 'Via:';
      pdf.text(label, ML, y);
      pdf.text(v, ML + TAB, y);
      y += LH;
    });
  }

  y += LH;

  pdf.text('Subj:', ML, y);
  const subjLines = pdf.splitTextToSize(subjText, CW - TAB);
  subjLines.forEach((line) => {
    pdf.text(line, ML + TAB, y);
    y += LH;
  });

  // References
  if (d.refs && d.refs.length > 0) {
    y += LH;
    pdf.text('Ref:', ML, y);
    d.refs.forEach((r, i) => {
      const letter = getLetter(i);
      const refLines = pdf.splitTextToSize(`(${letter})  ${r}`, CW - TAB);
      refLines.forEach((line) => {
        pdf.text(line, ML + TAB, y);
        y += LH;
      });
    });
  }

  // Enclosures
  if (d.encls && d.encls.length > 0) {
    y += LH;
    pdf.text('Encl:', ML, y);
    d.encls.forEach((e, i) => {
      const enclLines = pdf.splitTextToSize(`(${i + 1})  ${e}`, CW - TAB);
      enclLines.forEach((line) => {
        pdf.text(line, ML + TAB, y);
        y += LH;
      });
    });
  }

  y += LH * 2;

  // Body paragraphs with orphan/widow prevention
  if (d.paras && d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;
    const IM = 15;
    const IS = 16;
    const ISS = 18;
    const MIN_LINES_ON_PAGE = 2;
    const MIN_LINES_TO_CARRY = 2;
    const END_BLOCK_KEEP_LINES = 3;

    // Pre-calculate signature + copy-to height for last paragraph check
    const sigHeight = d.sigName ? (LH * 5 + (d.byDirection ? LH : 0)) : 0;
    const copyHeight = d.copies && d.copies.length > 0 ? (LH * 2 + LH * d.copies.length) : 0;
    const endBlockHeight = sigHeight + copyHeight;

    for (let pIdx = 0; pIdx < d.paras.length; pIdx++) {
      const p = d.paras[pIdx];
      const isLastPara = (pIdx === d.paras.length - 1);
      const pText = ensureDoubleSpaces(p.text || '');
      let label, indent;

      if (p.type === 'para') {
        pn++; sn = 0; ssn = 0; sssn = 0;
        label = pn + '.';
        indent = 0;
      } else if (p.type === 'subpara') {
        sn++; ssn = 0; sssn = 0;
        label = getLetter(sn - 1) + '.';
        indent = IM;
      } else if (p.type === 'subsubpara') {
        ssn++; sssn = 0;
        label = '(' + ssn + ')';
        indent = IM + IS;
      } else {
        sssn++;
        label = '(' + getLetter(sssn - 1) + ')';
        indent = IM + IS + ISS;
      }

      // Add portion marking if enabled
      let portionMark = '';
      let portionWidth = 0;
      if (d.portionMarkingEnabled && p.portionMark) {
        portionMark = `(${p.portionMark}) `;
        portionWidth = pdf.getTextWidth(portionMark);
      }

      const lx = ML + indent + portionWidth;
      const labelWidth = pdf.getTextWidth(label) + 4;
      const tx = lx + labelWidth;
      const textWidth = CW - indent - labelWidth - portionWidth;

      // Calculate total lines this paragraph will need
      const firstLineText = pdf.splitTextToSize(pText, textWidth);
      let totalLines = 1;
      if (firstLineText.length > 1) {
        const remainingText = pText.substring(firstLineText[0].length).trim();
        if (remainingText) {
          totalLines += pdf.splitTextToSize(remainingText, CW).length;
        }
      }

      const paraHeight = totalLines * LH;
      const spaceRemaining = PH - MB - y - LH;

      // Orphan/widow prevention
      if (isLastPara) {
        const linesToKeepWithEnd = Math.min(END_BLOCK_KEEP_LINES, totalLines);
        if (paraHeight > spaceRemaining) {
          const linesOnCurrentPage = Math.floor(spaceRemaining / LH);
          const linesOnNextPage = totalLines - linesOnCurrentPage;
          if (linesOnCurrentPage < MIN_LINES_ON_PAGE || linesOnNextPage <= linesToKeepWithEnd) {
            pageBreak(PH);
          }
        } else if (paraHeight + endBlockHeight > spaceRemaining && totalLines <= END_BLOCK_KEEP_LINES + 2) {
          pageBreak(PH);
        }
      } else if (paraHeight > spaceRemaining && spaceRemaining > 0) {
        const linesOnCurrentPage = Math.floor(spaceRemaining / LH);
        const linesOnNextPage = totalLines - linesOnCurrentPage;
        if (linesOnCurrentPage < MIN_LINES_ON_PAGE || linesOnNextPage < MIN_LINES_TO_CARRY) {
          pageBreak(PH);
        }
      }

      y += LH;
      pageBreak(LH * 2);

      // Draw portion marking if enabled
      if (portionMark) {
        pdf.setFont(fontName, 'bold');
        pdf.text(portionMark, ML + indent, y);
        pdf.setFont(fontName, 'normal');
      }

      pdf.setFont(fontName, 'normal');
      pdf.text(label, lx, y);

      if (pText) {
        const lines = pdf.splitTextToSize(pText, textWidth);
        lines.forEach((line, i) => {
          if (i === 0) {
            pdf.text(line, tx, y);
          } else {
            pdf.text(line, ML, y);
          }
          y += LH;
          pageBreak(LH);
        });
      }
    }
  }

  // Signature block - DoN standard: name only, ALL CAPS, then "By direction" below
  if (d.sigName) {
    y += LH * 4;
    pageBreak(LH * 4);
    const sigX = PW / 2;  // Signature starts at page center per SECNAV M-5216.5
    pdf.setFont(fontName, 'normal');  // Not bold per SECNAV M-5216.5
    pdf.text(d.sigName.toUpperCase(), sigX, y);
    y += LH;
    if (d.byDirection) {
      pdf.text('By direction', sigX, y);
      y += LH;
    }
  }

  // Copy to (numbered if multiple)
  if (d.copies && d.copies.length > 0) {
    y += LH * 2;
    pageBreak(LH * (d.copies.length + 1));
    pdf.setFont(fontName, 'normal');
    pdf.text('Copy to:', ML, y);
    d.copies.forEach((c, i) => {
      const copyText = d.copies.length > 1 ? `(${i + 1})  ${c}` : c;
      pdf.text(copyText, ML + TAB, y);
      y += LH;
    });
  }

  // Classification at bottom
  if (d.classification) {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(fontSize);
    pdf.text(d.classification, PW / 2, PH - 36, { align: 'center' });
  }

  return pdf.output('blob');
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize batch generator
 */
function initBatchGeneratorModule() {
  initBatchGenerator();
}

// ============================================================
// BATCH HELP MODAL
// ============================================================

/**
 * Show the batch generator help/explanation modal
 */
function showBatchHelp() {
  let modal = document.getElementById('batchHelpModal');
  if (!modal) {
    modal = createBatchHelpModal();
    document.body.appendChild(modal);
  }
  modal.classList.add('show');
}

/**
 * Close the batch help modal
 */
function closeBatchHelp() {
  const modal = document.getElementById('batchHelpModal');
  if (modal) modal.classList.remove('show');
}

/**
 * Create the batch help modal
 */
function createBatchHelpModal() {
  const modal = document.createElement('div');
  modal.id = 'batchHelpModal';
  modal.className = 'modal';
  modal.style.zIndex = '2100'; // Above the batch modal

  modal.innerHTML = `
    <div class="modal-content batch-help-modal">
      <div class="modal-header">
        <h2>Batch Generator Guide</h2>
        <button type="button" class="modal-close" onclick="closeBatchHelp()">&times;</button>
      </div>
      <div class="batch-help-content">
        <section class="help-section">
          <h3>What is Batch Generation?</h3>
          <p>Generate multiple letters at once from a single template. Perfect for:</p>
          <ul>
            <li>Block leave requests for an entire platoon</li>
            <li>Award recommendations for multiple Marines</li>
            <li>Counseling entries (6105s) for several individuals</li>
            <li>Mass notifications or instructions</li>
          </ul>
        </section>

        <section class="help-section">
          <h3>The Two Modes</h3>
          <div class="help-modes">
            <div class="help-mode">
              <h4>Keep My Signature</h4>
              <p><strong>You</strong> are the author of all letters. Your signature stays the same on every letter.</p>
              <p><em>Use for:</em> Awards you're writing FOR Marines, counseling entries, notifications you're sending.</p>
            </div>
            <div class="help-mode">
              <h4>Name = Signature</h4>
              <p>Each person in the table "signs" their own letter. The name becomes the From line and signature.</p>
              <p><em>Use for:</em> Leave requests, special liberty requests - letters written BY each Marine.</p>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h3>Using Placeholders</h3>
          <p>Placeholders let you insert data from each row into your letter text. Wrap column names in double curly braces:</p>
          <div class="help-placeholders">
            <code>{{name}}</code> <code>{{rank}}</code> <code>{{reason}}</code> <code>{{period}}</code> <code>{{to}}</code> <code>{{subject}}</code>
          </div>
        </section>

        <section class="help-section">
          <h3>Example: NAM Recommendations</h3>
          <p>You're a Platoon Sergeant writing 5 Navy Achievement Medal recommendations.</p>

          <h4>Step 1: Fill out the main form</h4>
          <div class="help-example">
            <div class="example-field"><strong>From:</strong> Platoon Sergeant, 2nd Platoon, Alpha Company</div>
            <div class="example-field"><strong>To:</strong> Commanding Officer, Alpha Company</div>
            <div class="example-field"><strong>Subject:</strong> NAVY ACHIEVEMENT MEDAL RECOMMENDATION FOR {{rank}} {{name}}</div>
            <div class="example-field"><strong>Signature:</strong> SMITH J.M.</div>
          </div>

          <h4>Step 2: Write your paragraph with placeholders</h4>
          <div class="help-example example-para">
            <p>1. {{rank}} {{name}} is recommended for the Navy Achievement Medal for superior performance of duty while serving as a Rifleman, 2nd Platoon, Alpha Company from {{period}}. During this period, {{rank}} {{name}} demonstrated exceptional dedication to duty and professionalism. Specifically, {{rank}} {{name}} {{reason}}.</p>
          </div>

          <h4>Step 3: Add recipients in the table</h4>
          <table class="help-table">
            <thead>
              <tr><th>Name</th><th>Rank</th><th>Reason</th><th>Period</th></tr>
            </thead>
            <tbody>
              <tr><td>Johnson R.T.</td><td>LCpl</td><td>led 3 convoys without incident</td><td>Jan-Jun 2024</td></tr>
              <tr><td>Williams K.A.</td><td>Cpl</td><td>trained 12 new joins on weapon systems</td><td>Feb-Jul 2024</td></tr>
              <tr><td>Davis M.J.</td><td>PFC</td><td>maintained 100% accountability of gear</td><td>Mar-Aug 2024</td></tr>
            </tbody>
          </table>

          <h4>Step 4: Select "Keep my signature" and Generate</h4>
          <p>You'll get 5 PDFs, each with:</p>
          <ul>
            <li>Your signature (SMITH J.M.) on all letters</li>
            <li>Each Marine's name/rank in the subject and body</li>
            <li>Their specific reason and period filled in</li>
          </ul>
        </section>

        <section class="help-section">
          <h3>Example: Leave Requests</h3>
          <p>Collecting leave requests from 30 Marines for block leave.</p>

          <h4>Set up the template</h4>
          <div class="help-example">
            <div class="example-field"><strong>To:</strong> Commanding Officer</div>
            <div class="example-field"><strong>Subject:</strong> REQUEST FOR ANNUAL LEAVE</div>
            <div class="example-field"><strong>Paragraph:</strong> I request annual leave from {{period}} for the purpose of {{reason}}.</div>
          </div>

          <h4>Select "Name = Signature"</h4>
          <p>Each Marine's name becomes the From line and signature. Add their names, leave dates, and reasons in the table. Each PDF is a complete leave request "from" that Marine.</p>
        </section>

        <div class="help-footer">
          <button type="button" class="btn btn-primary" onclick="closeBatchHelp()">Got It</button>
        </div>
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeBatchHelp();
  });

  return modal;
}

// Export for module usage
if (typeof window !== 'undefined') {
  window.initBatchGeneratorModule = initBatchGeneratorModule;
  window.openBatchModal = openBatchModal;
  window.closeBatchModal = closeBatchModal;
  window.generateBatchLetters = generateBatchLetters;
  window.handleBatchCsvUpload = handleBatchCsvUpload;
  // Editable table functions
  window.addBatchRow = addBatchRow;
  window.removeBatchRow = removeBatchRow;
  window.updateBatchCell = updateBatchCell;
  window.clearBatchTable = clearBatchTable;
  window.initEditableTable = initEditableTable;
  // Help modal
  window.showBatchHelp = showBatchHelp;
  window.closeBatchHelp = closeBatchHelp;
}

/**
 * Download a template CSV file for batch generation
 */
function downloadBatchTemplate() {
  const csvContent = `name,rank,to,subject,date,ssic,reason,period
Smith J.M.,Cpl,Commanding Officer,REQUEST FOR ANNUAL LEAVE,16 Dec 24,1050,Holiday block leave,20 Dec 24 - 03 Jan 25
Johnson R.T.,LCpl,Commanding Officer,REQUEST FOR ANNUAL LEAVE,16 Dec 24,1050,Family emergency,18 Dec 24 - 22 Dec 24
Williams K.A.,Sgt,Commanding Officer,REQUEST FOR SPECIAL LIBERTY,16 Dec 24,1050,Wedding attendance,21 Dec 24 - 23 Dec 24`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'batch_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Add to window exports
if (typeof window !== 'undefined') {
  window.downloadBatchTemplate = downloadBatchTemplate;
}
