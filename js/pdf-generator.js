/**
 * Naval Letter Generator - PDF Generator
 * Generates SECNAV M-5216.5 compliant PDF output using jsPDF
 */

/**
 * Generate PDF document from form data
 */
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const d = collectData();

  showStatus('loading', 'Generating PDF...');

  // Page dimensions (in points)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const PW = 612;       // Page width
  const PH = 792;       // Page height
  const ML = 72;        // Margin left (1 inch)
  const MR = 72;        // Margin right
  const MT = 72;        // Margin top
  const MB = 72;        // Margin bottom
  const CW = PW - ML - MR;  // Content width
  const LH = 14;        // Line height
  const TAB = 45;       // Tab width for labels

  // Paragraph indentation (space between label and text)
  const IM = 14;        // Main paragraph indent (after "1.")
  const IS = 14;        // Sub paragraph indent (after "a.")
  const ISS = 14;       // Sub-sub paragraph indent (after "(1)")
  const ISSS = 14;      // Sub-sub-sub paragraph indent (after "(a)")

  let y = 54;           // Current Y position
  let pageNum = 1;
  const subjText = d.subj.toUpperCase();

  /**
   * Handle page break with continuation header
   * @param {number} need - Space needed
   */
  function pageBreak(need) {
    if (y + need > PH - MB) {
      pdf.addPage();
      pageNum++;
      y = MT;

      // Add continuation header
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.text('Subj:', ML, y);

      // Full subject line on continuation pages, wrapped as needed
      const subjLines = pdf.splitTextToSize(subjText, CW - TAB);
      subjLines.forEach((line, i) => {
        pdf.text(line, ML + TAB, y);
        y += LH;
      });
      y += LH;  // One blank line after subject
    }
  }

  // Classification at top
  if (d.classification) {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text(d.classification, PW / 2, y, { align: 'center' });
    y += LH + 4;
  }

  // Letterhead
  if (d.useLetterhead) {
    // Seal image
    if (d.hasSeal && d.sealData) {
      try {
        pdf.addImage(d.sealData, 'JPEG', 36, 36, 72, 72);
      } catch (e) {
        console.warn('Could not add seal image:', e);
      }
    }

    // Service/organization name
    if (d.unitName) {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10);
      pdf.text(d.unitName.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 11;
    }

    // Unit address
    if (d.unitAddress) {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(8);
      d.unitAddress.split('\n').filter(l => l.trim()).forEach(line => {
        pdf.text(line.trim(), PW / 2, y, { align: 'center' });
        y += 9;
      });
    }
    y += LH * 2;  // 2 blank lines after letterhead
  }

  // Header block - sender's symbols left-aligned under first character
  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);
  const senderX = PW - MR - 72;  // Position on right side, left-aligned

  if (d.ssic) {
    pdf.text(d.ssic, senderX, y);
    y += LH;
  }
  if (d.officeCode) {
    pdf.text(d.officeCode, senderX, y);
    y += LH;
  }
  pdf.text(d.date, senderX, y);
  y += LH * 2;

  // Endorsement header
  if (d.documentType === 'endorsement') {
    pdf.setFont('times', 'bold');
    pdf.text(`${d.endorseNumber} ENDORSEMENT`, PW / 2, y, { align: 'center' });
    y += LH * 2;
    pdf.setFont('times', 'normal');
  }

  // From
  pdf.text('From:', ML, y);
  pdf.splitTextToSize(d.from, CW - TAB).forEach(line => {
    pdf.text(line, ML + TAB, y);
    y += LH;
  });

  // To
  pdf.text('To:', ML, y);
  pdf.splitTextToSize(d.to, CW - TAB).forEach(line => {
    pdf.text(line, ML + TAB, y);
    y += LH;
  });

  // Via - only number if multiple addressees
  if (d.via.length > 0) {
    pdf.text('Via:', ML, y);
    d.via.forEach((v, i) => {
      const viaText = d.via.length > 1 ? `(${i + 1})  ${v}` : v;
      pdf.splitTextToSize(viaText, CW - TAB).forEach(line => {
        pdf.text(line, ML + TAB, y);
        y += LH;
      });
    });
  }

  // Subject
  y += LH;
  pageBreak(LH * 2);
  pdf.text('Subj:', ML, y);
  pdf.splitTextToSize(subjText, CW - TAB).forEach(line => {
    pdf.text(line, ML + TAB, y);
    y += LH;
  });

  // References
  if (d.refs.length > 0) {
    y += LH;
    pageBreak(LH * (d.refs.length + 1));
    pdf.text('Ref:', ML, y);
    d.refs.forEach((r, i) => {
      pdf.splitTextToSize(`(${LETTERS[i]})  ${r}`, CW - TAB).forEach(line => {
        pdf.text(line, ML + TAB, y);
        y += LH;
      });
    });
  }

  // Enclosures
  if (d.encls.length > 0) {
    y += LH;
    pageBreak(LH * (d.encls.length + 1));
    pdf.text('Encl:', ML, y);
    d.encls.forEach((e, i) => {
      pdf.splitTextToSize(`(${i + 1})  ${e}`, CW - TAB).forEach(line => {
        pdf.text(line, ML + TAB, y);
        y += LH;
      });
    });
  }

  // Body paragraphs with orphan prevention
  if (d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;
    const MIN_LINES_ON_PAGE = 2;

    // Pre-calculate signature + copy-to height for last paragraph check
    const sigHeight = d.sigName ? (LH * 5 + (d.byDirection ? LH : 0)) : 0;
    const copyHeight = d.copies.length > 0 ? (LH * 2 + LH * (d.copies.length + 1)) : 0;
    const endBlockHeight = sigHeight + copyHeight;

    for (let pIdx = 0; pIdx < d.paras.length; pIdx++) {
      const p = d.paras[pIdx];
      const isLastPara = (pIdx === d.paras.length - 1);
      // Ensure double spaces after periods (military standard)
      const pText = ensureDoubleSpaces(p.text);

      y += LH;
      let label, indent, tIndent;

      if (p.type === 'para') {
        pn++;
        sn = 0;
        ssn = 0;
        sssn = 0;
        label = pn + '.';
        indent = 0;
        tIndent = IM;
      } else if (p.type === 'subpara') {
        sn++;
        ssn = 0;
        sssn = 0;
        label = LETTERS[sn - 1] + '.';
        indent = IM;
        tIndent = IS;
      } else if (p.type === 'subsubpara') {
        ssn++;
        sssn = 0;
        label = '(' + ssn + ')';
        indent = IM + IS;
        tIndent = ISS;
      } else {
        sssn++;
        label = '(' + LETTERS[sssn - 1] + ')';
        indent = IM + IS + ISS;
        tIndent = ISSS;
      }

      const lx = ML + indent;
      const labelWidth = pdf.getTextWidth(label);
      const tx = lx + labelWidth + 8;  // 8pt gap after label
      const firstLineWidth = CW - indent - labelWidth - 8;
      const wrapWidth = CW;

      // Calculate total lines this paragraph will need
      const firstLineText = pdf.splitTextToSize(pText, firstLineWidth);
      let totalLines = 1;
      if (firstLineText.length > 1) {
        const remainingText = pText.substring(firstLineText[0].length).trim();
        if (remainingText) {
          totalLines += pdf.splitTextToSize(remainingText, wrapWidth).length;
        }
      }

      // Calculate paragraph height
      const paraHeight = totalLines * LH;

      // For LAST paragraph: include signature + copy-to in orphan check
      const totalHeightNeeded = isLastPara ? (paraHeight + endBlockHeight) : paraHeight;

      // Calculate space remaining on current page
      const spaceRemaining = PH - MB - y;

      // For last paragraph: if entire end block won't fit, push ALL to next page
      if (isLastPara && totalHeightNeeded > spaceRemaining) {
        pageBreak(PH);
      }
      // For other paragraphs: standard orphan check
      else if (!isLastPara && totalHeightNeeded > spaceRemaining && spaceRemaining > 0) {
        const linesOnCurrentPage = Math.floor(spaceRemaining / LH);
        const linesOnNextPage = totalLines - linesOnCurrentPage;
        if (linesOnCurrentPage < MIN_LINES_ON_PAGE || linesOnNextPage < MIN_LINES_ON_PAGE) {
          pageBreak(PH);
        }
      }

      pageBreak(LH * 2);
      pdf.text(label, lx, y);

      // Check for explicit paragraph subject (only for top-level paragraphs)
      if (p.subject && p.type === 'para') {
        // Draw subject with underline
        const subjectWidth = pdf.getTextWidth(p.subject);
        pdf.text(p.subject, tx, y);
        pdf.setLineWidth(0.5);
        pdf.line(tx, y + 2, tx + subjectWidth, y + 2);

        const afterSubjectX = tx + subjectWidth + 6;
        const remainingWidth = firstLineWidth - subjectWidth - 6;

        if (pText && remainingWidth > 50) {
          const firstLinePart = pdf.splitTextToSize(pText, remainingWidth);
          pdf.text(firstLinePart[0], afterSubjectX, y);
          y += LH;

          if (firstLinePart.length > 1 || pText.length > firstLinePart[0].length) {
            const leftover = pText.substring(firstLinePart[0].length).trim();
            if (leftover) {
              pdf.splitTextToSize(leftover, wrapWidth).forEach(line => {
                pageBreak(LH);
                pdf.text(line, ML, y);
                y += LH;
              });
            }
          }
        } else {
          y += LH;
          if (pText) {
            pdf.splitTextToSize(pText, wrapWidth).forEach(line => {
              pageBreak(LH);
              pdf.text(line, ML, y);
              y += LH;
            });
          }
        }
      } else {
        // No subject - render text normally
        pdf.text(firstLineText[0], tx, y);
        y += LH;

        if (firstLineText.length > 1) {
          const remainingText = pText.substring(firstLineText[0].length).trim();
          if (remainingText) {
            pdf.splitTextToSize(remainingText, wrapWidth).forEach(line => {
              pageBreak(LH);
              pdf.text(line, ML, y);
              y += LH;
            });
          }
        }
      }
    }
  }

  // Signature - DoN standard: name only, no rank or title
  if (d.sigName) {
    y += LH * 4;
    const sx = PW / 2;
    pdf.text(d.sigName.toUpperCase(), sx, y);
    y += LH;
    if (d.byDirection) {
      pdf.text('By direction', sx, y);
      y += LH;
    }
  }

  // Copy to
  if (d.copies.length > 0) {
    y += LH * 2;
    pdf.text('Copy to:', ML, y);
    y += LH;
    d.copies.forEach(c => {
      pdf.text(c, ML, y);
      y += LH;
    });
  }

  // Classification at bottom of every page
  if (d.classification) {
    for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFont('times', 'bold');
      pdf.setFontSize(12);
      pdf.text(d.classification, PW / 2, PH - 36, { align: 'center' });
    }
  }

  // Page numbers (above classification if present) - only on page 2+
  if (pdf.getNumberOfPages() > 1) {
    const pageNumY = d.classification ? PH - 50 : PH - 36;
    for (let i = 2; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.text(String(i), PW / 2, pageNumY, { align: 'center' });
    }
  }

  // Save PDF
  const filename = generateFilename(d.subj, 'pdf');
  pdf.save(filename);
  showStatus('success', 'Downloaded ' + filename);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generatePDF
  };
}
