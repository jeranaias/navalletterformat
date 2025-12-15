/**
 * Naval Letter Generator - Batch Generator
 * Generate multiple letters from CSV data
 */

// ============================================================
// BATCH GENERATION
// ============================================================

let batchData = null;
let batchTemplate = null;

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
 * Handle CSV file upload
 * @param {Event} e
 */
function handleBatchCsvUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      batchData = parseCSV(event.target.result);
      displayBatchPreview();
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
  if (!batchData || batchData.length === 0) {
    showStatus('error', 'No batch data loaded');
    return;
  }

  if (!batchTemplate) {
    showStatus('error', 'Please fill out the form first as a template');
    return;
  }

  showStatus('loading', `Generating ${batchData.length} letters...`);

  try {
    if (!window.jspdf) {
      showStatus('error', 'PDF library not loaded. Please refresh the page.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const zip = new JSZip();

    for (let i = 0; i < batchData.length; i++) {
      const rowData = batchData[i];

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
      showStatus('loading', `Generating ${i + 1} of ${batchData.length}...`);
    }

    // Download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_letters_${new Date().toISOString().slice(0,10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    showStatus('success', `Generated ${batchData.length} letters!`);
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

  // Replace placeholders in string fields
  const replaceInString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return rowData[key.toLowerCase()] || match;
    });
  };

  // Process all string fields
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
  const directMappings = {
    'name': 'sigName',
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

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const PW = 612;
  const PH = 792;
  const ML = 72;
  const MR = 72;
  const MT = 72;
  const MB = 72;
  const CW = PW - ML - MR;
  const LH = 14;
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
        pdf.setFont('times', 'bold');
        pdf.setFontSize(12);
        pdf.text(d.classification, PW / 2, 20, { align: 'center' });
      }

      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
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
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
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
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10);
      pdf.text(d.unitName.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 12;
    }

    if (d.unitAddress) {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(8);
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
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text('MEMORANDUM', PW / 2, y, { align: 'center' });
    y += LH * 2;
  }

  // Sender's symbols
  const senderX = PW - MR - 72;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);

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
    const IM = 14;
    const IS = 14;
    const ISS = 14;
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
        pdf.setFont('times', 'bold');
        pdf.text(portionMark, ML + indent, y);
        pdf.setFont('times', 'normal');
      }

      pdf.setFont('times', 'normal');
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

  // Signature
  y += LH * 2;
  pageBreak(LH * 4);

  const sigX = PW / 2;  // Signature starts at page center per SECNAV M-5216.5
  if (d.byDirection) {
    pdf.text('By direction', sigX, y);
    y += LH * 4;
  } else {
    y += LH * 3;
  }

  if (d.sigName) {
    pdf.setFont('times', 'normal');  // Not bold per SECNAV M-5216.5
    pdf.text(d.sigName.toUpperCase(), sigX, y);
  }

  // Copy to (numbered if multiple)
  if (d.copies && d.copies.length > 0) {
    y += LH * 3;
    pageBreak(LH * (d.copies.length + 1));
    pdf.setFont('times', 'normal');
    pdf.text('Copy to:', ML, y);
    d.copies.forEach((c, i) => {
      const copyText = d.copies.length > 1 ? `(${i + 1})  ${c}` : c;
      pdf.text(copyText, ML + TAB, y);
      y += LH;
    });
  }

  // Classification at bottom (symmetric with top at y=20)
  if (d.classification) {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text(d.classification, PW / 2, PH - 20, { align: 'center' });
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

// Export for module usage
if (typeof window !== 'undefined') {
  window.initBatchGeneratorModule = initBatchGeneratorModule;
  window.openBatchModal = openBatchModal;
  window.closeBatchModal = closeBatchModal;
  window.generateBatchLetters = generateBatchLetters;
  window.handleBatchCsvUpload = handleBatchCsvUpload;
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
