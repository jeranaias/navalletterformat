/**
 * Naval Letter Generator - Live Preview Manager
 * Real-time PDF preview as you type
 */

let previewDebounceTimer = null;
let previewEnabled = false;
let lastPreviewData = null;

/**
 * Initialize the live preview system
 */
function initPreviewManager() {
  const toggleBtn = document.getElementById('previewToggle');
  const previewPane = document.getElementById('livePreviewPane');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleLivePreview);
  }

  // Listen for form changes to trigger preview updates
  const form = document.getElementById('letterForm');
  if (form) {
    form.addEventListener('input', schedulePreviewUpdate);
    form.addEventListener('change', schedulePreviewUpdate);
  }

  // Listen for paragraph changes (custom event from form-handler)
  document.addEventListener('paragraphsChanged', schedulePreviewUpdate);

  // Listen for dynamic list changes
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-add') || e.target.closest('.btn-remove')) {
      setTimeout(schedulePreviewUpdate, 100);
    }
  });
}

/**
 * Toggle the live preview pane
 */
function toggleLivePreview() {
  const container = document.querySelector('.container');
  const previewPane = document.getElementById('livePreviewPane');
  const toggleBtn = document.getElementById('previewToggle');

  previewEnabled = !previewEnabled;

  if (previewEnabled) {
    container.classList.add('preview-active');
    previewPane.classList.add('show');
    toggleBtn.textContent = 'Hide Preview';
    toggleBtn.classList.add('active');
    updateLivePreview(); // Generate initial preview
  } else {
    container.classList.remove('preview-active');
    previewPane.classList.remove('show');
    toggleBtn.textContent = 'Live Preview';
    toggleBtn.classList.remove('active');
  }

  // Save preference
  localStorage.setItem('livePreviewEnabled', previewEnabled);
}

/**
 * Schedule a preview update (debounced)
 */
function schedulePreviewUpdate() {
  if (!previewEnabled) return;

  if (previewDebounceTimer) {
    clearTimeout(previewDebounceTimer);
  }

  previewDebounceTimer = setTimeout(updateLivePreview, 750);
}

/**
 * Update the live preview
 */
async function updateLivePreview() {
  if (!previewEnabled) return;

  const previewFrame = document.getElementById('previewFrame');
  const previewLoading = document.getElementById('previewLoading');

  if (!previewFrame) return;

  try {
    // Show loading indicator
    if (previewLoading) {
      previewLoading.style.display = 'flex';
    }

    // Generate PDF blob
    const pdfBlob = await generatePDFBlob();

    if (pdfBlob) {
      // Create blob URL and display in iframe
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Revoke old blob URL to prevent memory leaks
      if (previewFrame.dataset.blobUrl) {
        URL.revokeObjectURL(previewFrame.dataset.blobUrl);
      }

      previewFrame.src = blobUrl;
      previewFrame.dataset.blobUrl = blobUrl;
    }
  } catch (error) {
    console.error('Preview generation error:', error);
  } finally {
    // Hide loading indicator
    if (previewLoading) {
      previewLoading.style.display = 'none';
    }
  }
}

/**
 * Generate PDF as blob (without downloading)
 * Returns a Blob object
 */
async function generatePDFBlob() {
  if (!window.jspdf) {
    console.error('PDF library not loaded');
    return null;
  }
  const { jsPDF } = window.jspdf;
  const d = collectData();

  // Page dimensions (in points)
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

  const IM = 14;
  const IS = 14;
  const ISS = 14;
  const ISSS = 14;

  let y = 54;
  let pageNum = 1;
  const subjText = d.subj.toUpperCase();

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
      subjLines.forEach((line, i) => {
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

  // Letterhead (before MEMORANDUM header for formal memos)
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

  // Memorandum header (after letterhead)
  if (d.documentType === 'memorandum') {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text('MEMORANDUM', PW / 2, y, { align: 'center' });
    y += LH * 2;
  }

  // Sender's symbols (right side, left-aligned)
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

  // Endorsement header
  if (d.documentType === 'endorsement') {
    pdf.setFont('times', 'bold');
    pdf.text(`${d.endorseNumber} ENDORSEMENT`, PW / 2, y, { align: 'center' });
    y += LH * 2;
    pdf.setFont('times', 'normal');
  }

  // From (with text wrapping for long values)
  pdf.setFont('times', 'normal');
  pdf.text('From:', ML, y);
  pdf.splitTextToSize(d.from, CW - TAB).forEach(line => {
    pdf.text(line, ML + TAB, y);
    y += LH;
  });

  // To (with text wrapping for long values)
  pdf.text('To:', ML, y);
  pdf.splitTextToSize(d.to, CW - TAB).forEach(line => {
    pdf.text(line, ML + TAB, y);
    y += LH;
  });

  // Via - label once, numbered items at tab position
  if (d.via && d.via.length > 0) {
    pdf.text('Via:', ML, y);
    d.via.forEach((v, i) => {
      const viaText = d.via.length > 1 ? `(${i + 1})  ${v}` : v;
      pdf.splitTextToSize(viaText, CW - TAB).forEach((line, lineIdx) => {
        if (lineIdx === 0) {
          pdf.text(line, ML + TAB, y);
        } else {
          pdf.text(line, ML + TAB, y);
        }
        y += LH;
      });
    });
  }

  y += LH;

  // Subject
  pdf.text('Subj:', ML, y);
  const subjLines = pdf.splitTextToSize(subjText, CW - TAB);
  subjLines.forEach((line, i) => {
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

  // Endorsement action
  if (d.documentType === 'endorsement' && d.endorseAction) {
    pdf.text(`1.  ${d.endorseAction}.`, ML, y);
    y += LH * 2;
  }

  // Body paragraphs with enhanced orphan/widow prevention
  if (d.paras && d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;
    const MIN_LINES_ON_PAGE = 2;    // Minimum lines to leave on current page (widows)
    const MIN_LINES_TO_CARRY = 2;   // Minimum lines to carry to next page (orphans)
    const END_BLOCK_KEEP_LINES = 3; // Last N lines of final paragraph to keep with signature

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
        pn++;
        sn = 0; ssn = 0; sssn = 0;
        label = pn + '.';
        indent = 0;
      } else if (p.type === 'subpara') {
        sn++;
        ssn = 0; sssn = 0;
        label = getLetter(sn - 1) + '.';
        indent = IM;
      } else if (p.type === 'subsubpara') {
        ssn++;
        sssn = 0;
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
      const spaceRemaining = PH - MB - y - LH; // Account for the y += LH below

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

      // Draw label
      pdf.setFont('times', 'normal');
      pdf.text(label, lx, y);

      // Paragraph subject (only for top-level) - underlined, NOT bold
      if (p.subject && p.type === 'para') {
        // Calculate subject width constrained to margins
        const rightEdge = PW - MR;
        const maxSubjectWidth = rightEdge - tx - 6;
        const subjectWidth = Math.min(pdf.getTextWidth(p.subject), maxSubjectWidth);

        // Draw subject with underline (NOT bold)
        pdf.text(p.subject, tx, y);
        pdf.setLineWidth(0.5);
        pdf.line(tx, y + 2, tx + subjectWidth, y + 2);

        // Calculate if text can fit on same line after subject
        const afterSubjectX = tx + subjectWidth + 6;
        const remainingWidth = CW - (afterSubjectX - ML);

        if (pText && remainingWidth > 50) {
          // Text starts on same line after subject
          const firstLinePart = pdf.splitTextToSize(pText, remainingWidth);
          pdf.text(firstLinePart[0], afterSubjectX, y);
          y += LH;

          // Remaining text wraps to margin
          if (pText.length > firstLinePart[0].length) {
            const leftover = pText.substring(firstLinePart[0].length).trim();
            if (leftover) {
              pdf.splitTextToSize(leftover, CW).forEach(line => {
                pageBreak(LH);
                pdf.text(line, ML, y);
                y += LH;
              });
            }
          }
        } else {
          // Subject takes full line, text on next line
          y += LH;
          if (pText) {
            pdf.splitTextToSize(pText, CW).forEach(line => {
              pageBreak(LH);
              pdf.text(line, ML, y);
              y += LH;
            });
          }
        }
      } else {
        // Regular paragraph text (no subject)
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
  }

  // Signature and Copy-to block - keep together as a group
  const sigBlockHeight = d.sigName ? (LH * 5 + (d.byDirection ? LH : 0)) : 0;
  const copyBlockHeight = d.copies && d.copies.length > 0 ? (LH * 2 + LH * d.copies.length) : 0;
  const totalEndBlockHeight = sigBlockHeight + copyBlockHeight;

  if (totalEndBlockHeight > 0) {
    const spaceForEndBlock = PH - MB - y;
    if (spaceForEndBlock < totalEndBlockHeight) {
      pageBreak(totalEndBlockHeight);
    }
  }

  // Signature block - DoN standard: name only, ALL CAPS, then "By direction" below
  if (d.sigName) {
    y += LH * 4;
    const sigX = PW / 2;  // Signature starts at page center per SECNAV M-5216.5
    pdf.setFont('times', 'normal');
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

  // Return as blob
  return pdf.output('blob');
}

/**
 * Restore preview state from localStorage
 */
function restorePreviewState() {
  const savedState = localStorage.getItem('livePreviewEnabled');
  if (savedState === 'true') {
    // Delay to ensure DOM is ready
    setTimeout(() => {
      toggleLivePreview();
    }, 500);
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.initPreviewManager = initPreviewManager;
  window.toggleLivePreview = toggleLivePreview;
  window.updateLivePreview = updateLivePreview;
  window.generatePDFBlob = generatePDFBlob;
  window.restorePreviewState = restorePreviewState;
}
