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

  previewDebounceTimer = setTimeout(updateLivePreview, 500);
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
        pdf.text(d.classification, PW / 2, 18, { align: 'center' });
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
    pdf.text(d.classification, PW / 2, 18, { align: 'center' });
  }

  // Memorandum header
  if (d.documentType === 'memorandum') {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text('MEMORANDUM', PW / 2, y, { align: 'center' });
    y += LH * 2;
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
      pdf.setFontSize(10);
      const addrLines = d.unitAddress.split('\n');
      addrLines.forEach(line => {
        pdf.text(line.toUpperCase(), PW / 2, y, { align: 'center' });
        y += 12;
      });
    }

    y = Math.max(y, 130);
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
    pdf.text(`${d.endorseNumber} ENDORSEMENT on ${d.endorseRef || '[basic letter reference]'}`, ML, y);
    y += LH * 2;
    pdf.setFont('times', 'normal');
  }

  // From
  pdf.setFont('times', 'normal');
  pdf.text('From:', ML, y);
  pdf.text(d.from, ML + TAB, y);
  y += LH;

  // To
  pdf.text('To:', ML, y);
  pdf.text(d.to, ML + TAB, y);
  y += LH;

  // Via
  if (d.via && d.via.length > 0) {
    d.via.forEach((v, i) => {
      const label = d.via.length > 1 ? `Via: (${i + 1})` : 'Via:';
      pdf.text(label, ML, y);
      pdf.text(v, ML + TAB, y);
      y += LH;
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
    d.refs.forEach((r, i) => {
      const letter = String.fromCharCode(97 + i);
      const label = i === 0 ? `Ref:  (${letter})` : `      (${letter})`;
      pdf.text(label, ML, y);
      const refLines = pdf.splitTextToSize(r, CW - TAB - 20);
      refLines.forEach((line, j) => {
        pdf.text(line, ML + TAB + 20, y);
        y += LH;
      });
    });
  }

  // Enclosures
  if (d.encls && d.encls.length > 0) {
    y += LH;
    d.encls.forEach((e, i) => {
      const label = i === 0 ? `Encl: (${i + 1})` : `      (${i + 1})`;
      pdf.text(label, ML, y);
      pdf.text(e, ML + TAB + 20, y);
      y += LH;
    });
  }

  y += LH * 2;

  // Endorsement action
  if (d.documentType === 'endorsement' && d.endorseAction) {
    pdf.text(`1.  ${d.endorseAction}.`, ML, y);
    y += LH * 2;
  }

  // Body paragraphs (flat structure with type: para, subpara, subsubpara, subsubsubpara)
  if (d.paras && d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;

    d.paras.forEach((p) => {
      const pText = p.text || '';
      let label, indent;

      if (p.type === 'para') {
        pn++;
        sn = 0; ssn = 0; sssn = 0;
        label = pn + '.';
        indent = 0;
      } else if (p.type === 'subpara') {
        sn++;
        ssn = 0; sssn = 0;
        label = String.fromCharCode(96 + sn) + '.';
        indent = IM;
      } else if (p.type === 'subsubpara') {
        ssn++;
        sssn = 0;
        label = '(' + ssn + ')';
        indent = IM + IS;
      } else {
        sssn++;
        label = '(' + String.fromCharCode(96 + sssn) + ')';
        indent = IM + IS + ISS;
      }

      const lx = ML + indent;
      const labelWidth = pdf.getTextWidth(label) + 4;
      const tx = lx + labelWidth;
      const textWidth = CW - indent - labelWidth;

      y += LH;
      pageBreak(LH * 2);

      // Draw label
      pdf.setFont('times', 'normal');
      pdf.text(label, lx, y);

      // Paragraph subject (only for top-level)
      if (p.subject && p.type === 'para') {
        pdf.setFont('times', 'bold');
        pdf.text(p.subject, tx, y);
        pdf.setLineWidth(0.5);
        pdf.line(tx, y + 2, tx + pdf.getTextWidth(p.subject), y + 2);
        y += LH;
        pdf.setFont('times', 'normal');

        if (pText) {
          const lines = pdf.splitTextToSize(pText, CW);
          lines.forEach((line) => {
            pageBreak(LH);
            pdf.text(line, ML, y);
            y += LH;
          });
        }
      } else {
        // Regular paragraph text
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
    });
  }

  // Signature block
  y += LH * 2;
  pageBreak(LH * 4);

  const sigX = PW / 2 + 36;
  if (d.byDirection) {
    pdf.text('By direction', sigX, y);
    y += LH * 4;
  } else {
    y += LH * 3;
  }

  if (d.sigName) {
    pdf.setFont('times', 'bold');
    pdf.text(d.sigName.toUpperCase(), sigX, y);
  }

  // Copy to
  if (d.copies && d.copies.length > 0) {
    y += LH * 3;
    pageBreak(LH * (d.copies.length + 1));
    pdf.setFont('times', 'normal');
    pdf.text('Copy to:', ML, y);
    y += LH;
    d.copies.forEach(c => {
      pdf.text(c, ML + 36, y);
      y += LH;
    });
  }

  // Classification at bottom
  if (d.classification) {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text(d.classification, PW / 2, PH - 18, { align: 'center' });
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
