/**
 * Naval Letter Generator - PDF Generator
 * Generates SECNAV M-5216.5 compliant PDF output using jsPDF
 */

/**
 * Generate PDF document from form data
 */
async function generatePDF() {
  if (!window.jspdf) {
    showStatus('error', 'PDF library not loaded. Please refresh the page.');
    return;
  }

  // Run validation before generating
  if (typeof validateBeforeDownload === 'function' && !validateBeforeDownload()) {
    return;
  }

  const { jsPDF } = window.jspdf;
  const d = collectData();

  showStatus('loading', 'Generating PDF...');

  // Font settings
  const fontName = getJsPDFFont(d.fontFamily);
  const fontSize = d.fontSize || 12;
  const LH = getLineHeight(fontSize);  // Dynamic line height

  // Page dimensions (in points)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const PW = 612;       // Page width
  const PH = 792;       // Page height
  const ML = 72;        // Margin left (1 inch)
  const MR = 72;        // Margin right
  const MT = 72;        // Margin top
  const MB = 72;        // Margin bottom
  const CW = PW - ML - MR;  // Content width
  const TAB = 45;       // Tab width for labels

  // Paragraph indentation (space between label and text)
  const IM = 15;        // Align sub-para with main para text
  const IS = 16;        // Sub-sub aligns with sub-para text
  const ISS = 18;       // Sub-sub paragraph indent (after "(1)" - wider label)
  const ISSS = 19;      // Sub-sub-sub paragraph indent (after "(a)" - wider label)

  let y = 54;           // Current Y position (start of letterhead area)
  let pageNum = 1;
  const subjText = d.subj.toUpperCase();

  // Track when a page break just occurred (for skipping leading newlines)
  let freshPageBreak = false;

  /**
   * Handle page break with continuation header - pre-check version
   * @param {number} need - Space needed
   */
  function pageBreak(need) {
    if (y + need > PH - MB) {
      doPageBreak();
    }
  }

  /**
   * Actual page break - adds page and draws header
   */
  function doPageBreak() {
    freshPageBreak = true; // Flag that we just did a page break
    pdf.addPage();
    pageNum++;
    y = MT;

    // Classification/CUI at top of page (centered, 0.5" from top)
    if (d.classification) {
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(fontSize);
      pdf.text(d.classification, PW / 2, 36, { align: 'center' });
    }

    // Page number centered at bottom (0.5" from bottom edge)
    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(fontSize);
    pdf.text(String(pageNum), PW / 2, PH - 36, { align: 'center' });

    // Classification/CUI at bottom of page (centered, below page number)
    if (d.classification) {
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(fontSize);
      pdf.text(d.classification, PW / 2, PH - 20, { align: 'center' });
    }

    // Add continuation header
    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(fontSize);
    pdf.text('Subj:', ML, y);

    // Full subject line on continuation pages, wrapped as needed
    const subjLines = pdf.splitTextToSize(subjText, CW - TAB);
    subjLines.forEach((line, i) => {
      pdf.text(line, ML + TAB, y);
      y += LH;
    });
    y += LH; // One blank line after subject - consistent for all page breaks
  }

  /**
   * Page break callback for renderFormattedText - receives actual Y position
   */
  function pageBreakAtY(currentY) {
    if (currentY > PH - MB) {
      doPageBreak();
      return y; // Return new position after header
    }
    return currentY; // No change
  }

  // Classification at VERY TOP of page (above letterhead) - per DoD 5200.01
  if (d.classification) {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(fontSize);
    pdf.text(d.classification, PW / 2, 20, { align: 'center' });
    // Note: Classification does NOT push down letterhead - it's in a fixed position
  }

  // Letterhead (for basic letters, endorsements, and formal memos) - before MEMORANDUM for formal memos
  if (d.useLetterhead) {
    // Seal image
    if (d.hasSeal && d.sealData) {
      try {
        pdf.addImage(d.sealData, 'JPEG', 36, 36, 72, 72);
      } catch (e) {
        console.warn('Could not add seal image:', e);
      }
    }

    // Service/organization name (slightly smaller than body)
    if (d.unitName) {
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(Math.max(fontSize - 2, 8));
      pdf.text(d.unitName.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 12;
    }

    // Unit address (smaller)
    if (d.unitAddress) {
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(Math.max(fontSize - 4, 7));
      d.unitAddress.split('\n').filter(l => l.trim()).forEach(line => {
        pdf.text(line.trim(), PW / 2, y, { align: 'center' });
        y += 10;
      });
    }
    y = Math.max(y, 130);
  }

  // Memorandum header - appears for ALL memos (after letterhead for formal memos)
  if (d.documentType === 'memorandum') {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(fontSize);
    pdf.text('MEMORANDUM', PW / 2, y, { align: 'center' });
    y += LH * 2;
  }

  // Header block - sender's symbols left-aligned under first character
  pdf.setFont(fontName, 'normal');
  pdf.setFontSize(fontSize);
  const senderX = PW - MR - 72;  // Position on right side, left-aligned

  // "IN REPLY REFER TO:" label (if enabled) - sits above SSIC without affecting layout
  if (d.showInReplyTo) {
    pdf.setFontSize(6);
    pdf.text('IN REPLY REFER TO:', senderX, y - 11); // 11pt above SSIC, left-aligned with SSIC
    pdf.setFontSize(fontSize); // Reset to 12pt for SSIC/date
  }

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
    pdf.setFont(fontName, 'bold');
    pdf.text(`${d.endorseNumber} ENDORSEMENT`, PW / 2, y, { align: 'center' });
    y += LH * 2;
    pdf.setFont(fontName, 'normal');
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
      pdf.splitTextToSize(`(${getLetter(i)})  ${r}`, CW - TAB).forEach(line => {
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

  // Body paragraphs with enhanced orphan/widow prevention
  if (d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;
    const MIN_LINES_ON_PAGE = 2;    // Minimum lines to leave on current page (widows)
    const MIN_LINES_TO_CARRY = 2;   // Minimum lines to carry to next page (orphans)
    const END_BLOCK_KEEP_LINES = 3; // Last N lines of final paragraph to keep with signature

    // Pre-calculate signature + copy-to height for last paragraph check
    const sigHeight = d.sigName ? (LH * 5 + (d.byDirection ? LH : 0)) : 0;
    const copyHeight = d.copies.length > 0 ? (LH * 2 + LH * d.copies.length) : 0;
    const endBlockHeight = sigHeight + copyHeight;

    for (let pIdx = 0; pIdx < d.paras.length; pIdx++) {
      const p = d.paras[pIdx];
      const isLastPara = (pIdx === d.paras.length - 1);
      // Use HTML content if available for formatting, fall back to plain text
      const pHtml = ensureDoubleSpaces(p.html || p.text || '');
      const segments = parseHtmlToSegments(pHtml);

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
        label = getLetter(sn - 1) + '.';
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
        label = '(' + getLetter(sssn - 1) + ')';
        indent = IM + IS + ISS;
        tIndent = ISSS;
      }

      // Add portion marking if enabled
      let portionMark = '';
      let portionWidth = 0;
      if (d.portionMarkingEnabled && p.portionMark) {
        portionMark = `(${p.portionMark}) `;
        portionWidth = pdf.getTextWidth(portionMark);
      }

      const lx = ML + indent + portionWidth;
      const labelWidth = pdf.getTextWidth(label);
      const tx = lx + labelWidth + 4;  // Single space gap after label
      const firstLineWidth = CW - indent - labelWidth - 4;
      const wrapWidth = CW;

      // Calculate total height this paragraph will need using formatted text
      const paraHeight = getFormattedTextHeight(pdf, segments, firstLineWidth, wrapWidth, LH, fontName, fontSize);
      const totalLines = Math.ceil(paraHeight / LH);

      // Calculate space remaining on current page
      const spaceRemaining = PH - MB - y;

      // For LAST paragraph: keep last N lines grouped with signature + copy-to
      if (isLastPara) {
        const linesToKeepWithEnd = Math.min(END_BLOCK_KEEP_LINES, totalLines);
        const endGroupHeight = (linesToKeepWithEnd * LH) + endBlockHeight;

        // If paragraph spans pages, check if end group would be orphaned
        if (paraHeight > spaceRemaining) {
          const linesOnCurrentPage = Math.floor(spaceRemaining / LH);
          const linesOnNextPage = totalLines - linesOnCurrentPage;

          // Check if we'd leave too few lines on current page (widow)
          // OR if end group (last N lines + sig + copy) would be alone on next page
          if (linesOnCurrentPage < MIN_LINES_ON_PAGE ||
              (linesOnNextPage <= linesToKeepWithEnd && endGroupHeight > (PH - MT - MB))) {
            // Push entire paragraph to next page
            pageBreak(PH);
          }
        }
        // If entire para + end block fits, no problem; if not and it's short, push to next page
        else if (paraHeight + endBlockHeight > spaceRemaining && totalLines <= END_BLOCK_KEEP_LINES + 2) {
          pageBreak(PH);
        }
      }
      // For other paragraphs: standard orphan/widow check
      else if (paraHeight > spaceRemaining && spaceRemaining > 0) {
        const linesOnCurrentPage = Math.floor(spaceRemaining / LH);
        const linesOnNextPage = totalLines - linesOnCurrentPage;

        // Prevent widows (too few lines left on current page)
        // Prevent orphans (too few lines carried to next page)
        if (linesOnCurrentPage < MIN_LINES_ON_PAGE || linesOnNextPage < MIN_LINES_TO_CARRY) {
          pageBreak(PH);
        }
      }

      pageBreak(LH * 2);

      // Draw portion marking if enabled
      if (portionMark) {
        pdf.setFont(fontName, 'bold');
        pdf.text(portionMark, ML + indent, y);
        pdf.setFont(fontName, 'normal');
      }

      pdf.text(label, lx, y);

      // Check for explicit paragraph subject (only for top-level paragraphs)
      if (p.subject && p.type === 'para') {
        // Calculate right margin edge and max subject width
        const rightEdge = PW - MR;
        const maxSubjectWidth = rightEdge - tx - 6;  // Leave space for gap after subject

        // Draw subject with underline, constrained to margins
        const subjectWidth = Math.min(pdf.getTextWidth(p.subject), maxSubjectWidth);
        const displaySubject = subjectWidth < pdf.getTextWidth(p.subject)
          ? p.subject.substring(0, Math.floor(p.subject.length * (subjectWidth / pdf.getTextWidth(p.subject)))) + '...'
          : p.subject;

        pdf.text(displaySubject, tx, y);
        pdf.setLineWidth(0.5);
        const underlineEnd = Math.min(tx + subjectWidth, rightEdge);
        pdf.line(tx, y + 2, underlineEnd, y + 2);

        const afterSubjectX = tx + subjectWidth + 6;
        const remainingWidth = firstLineWidth - subjectWidth - 6;

        if (segments.length > 0 && segments[0].text && remainingWidth > 50 && afterSubjectX < rightEdge - 50) {
          // Render formatted text starting after subject
          const skipNewlines = freshPageBreak;
          freshPageBreak = false;
          y = renderFormattedText(pdf, segments, {
            firstLineX: afterSubjectX,
            firstLineWidth: remainingWidth,
            contX: ML,
            contWidth: wrapWidth,
            y: y,
            lineHeight: LH,
            fontName: fontName,
            fontSize: fontSize,
            pageBreak: pageBreakAtY,
            skipLeadingNewlines: skipNewlines
          });
          y += LH;
        } else {
          y += LH;
          if (segments.length > 0 && segments[0].text) {
            const skipNewlines = freshPageBreak;
            freshPageBreak = false;
            y = renderFormattedText(pdf, segments, {
              firstLineX: ML,
              firstLineWidth: wrapWidth,
              contX: ML,
              contWidth: wrapWidth,
              y: y,
              lineHeight: LH,
              fontName: fontName,
              fontSize: fontSize,
              pageBreak: pageBreakAtY,
              skipLeadingNewlines: skipNewlines
            });
            y += LH;
          }
        }
      } else {
        // No subject - render text with formatting
        if (segments.length > 0 && segments[0].text) {
          const skipNewlines = freshPageBreak;
          freshPageBreak = false;
          y = renderFormattedText(pdf, segments, {
            firstLineX: tx,
            firstLineWidth: firstLineWidth,
            contX: ML,
            contWidth: wrapWidth,
            y: y,
            lineHeight: LH,
            fontName: fontName,
            fontSize: fontSize,
            pageBreak: pageBreakAtY,
            skipLeadingNewlines: skipNewlines
          });
          y += LH;
        }
      }

      // Reset flag at end of each paragraph to prevent carry-over
      freshPageBreak = false;
    }
  }

  // Signature and Copy-to block - keep together as a group
  const sigBlockHeight = d.sigName ? (LH * 5 + (d.byDirection ? LH : 0)) : 0;
  const copyBlockHeight = d.copies.length > 0 ? (LH * 2 + LH * d.copies.length) : 0;
  const totalEndBlockHeight = sigBlockHeight + copyBlockHeight;

  // Check if signature + copy-to block needs to move to next page together
  if (totalEndBlockHeight > 0) {
    const spaceForEndBlock = PH - MB - y;
    if (spaceForEndBlock < totalEndBlockHeight) {
      pageBreak(totalEndBlockHeight);
    }
  }

  // Signature - DoN standard: name only, no rank or title (ALL CAPS, not bold)
  if (d.sigName) {
    y += LH * 4;
    const sx = PW / 2;
    pdf.setFont(fontName, 'normal');
    pdf.text(d.sigName.toUpperCase(), sx, y);
    y += LH;
    if (d.byDirection) {
      pdf.text('By direction', sx, y);
      y += LH;
    }
  }

  // Copy to (numbered if multiple)
  if (d.copies.length > 0) {
    y += LH * 2;
    pdf.text('Copy to:', ML, y);
    d.copies.forEach((c, i) => {
      const copyText = d.copies.length > 1 ? `(${i + 1})  ${c}` : c;
      pdf.text(copyText, ML + TAB, y);
      y += LH;
    });
  }

  // Classification at bottom of every page (symmetric with top at y=20)
  if (d.classification) {
    for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(fontSize);
      pdf.text(d.classification, PW / 2, PH - 36, { align: 'center' });
    }
  }

  // Page numbers (above classification if present) - only on page 2+
  if (pdf.getNumberOfPages() > 1) {
    const pageNumY = d.classification ? PH - 50 : PH - 36;
    for (let i = 2; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(fontSize);
      pdf.text(String(i), PW / 2, pageNumY, { align: 'center' });
    }
  }

  // Save PDF
  const filename = generateFilename(d.subj, 'pdf');
  pdf.save(filename);
  showStatus('success', 'Downloaded ' + filename);
}


/**
 * Generate PDF and open print dialog
 */
async function printPDF() {
  if (!window.jspdf) {
    showStatus('error', 'PDF library not loaded. Please refresh the page.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const d = collectData();

  showStatus('loading', 'Preparing print preview...');

  // Font settings
  const fontName = getJsPDFFont(d.fontFamily);
  const fontSize = d.fontSize || 12;
  const LH = getLineHeight(fontSize);

  // Generate the PDF using same logic as generatePDF
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const PW = 612, PH = 792, ML = 72, MR = 72, MT = 72, MB = 72;
  const CW = PW - ML - MR, TAB = 45;
  const IM = 15, IS = 16, ISS = 18, ISSS = 19;
  let y = 54, pageNum = 1;
  const subjText = d.subj.toUpperCase();

  function pageBreak(need) {
    if (y + need > PH - MB) {
      pdf.addPage();
      pageNum++;
      y = MT;
      // Classification at top of continuation pages
      if (d.classification) {
        pdf.setFont(fontName, 'bold');
        pdf.setFontSize(fontSize);
        pdf.text(d.classification, PW / 2, 20, { align: 'center' });
      }
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(fontSize);
      pdf.text('Subj:', ML, y);
      const subjLines = pdf.splitTextToSize(subjText, CW - TAB);
      subjLines.forEach((line) => { pdf.text(line, ML + TAB, y); y += LH; });
      y += LH;
    }
  }

  // Classification at VERY TOP of page (above letterhead) - per DoD 5200.01
  if (d.classification) {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(fontSize);
    pdf.text(d.classification, PW / 2, 20, { align: 'center' });
  }

  // Letterhead (for basic letters, endorsements, and formal memos) - before MEMORANDUM for formal memos
  if (d.useLetterhead) {
    if (d.hasSeal && d.sealData) {
      try { pdf.addImage(d.sealData, 'JPEG', 36, 36, 72, 72); } catch (e) {}
    }
    if (d.unitName) {
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(10);
      pdf.text(d.unitName.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 12;
    }
    if (d.unitAddress) {
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(8);
      d.unitAddress.split('\n').filter(l => l.trim()).forEach(line => {
        pdf.text(line.trim(), PW / 2, y, { align: 'center' });
        y += 10;
      });
    }
    y = Math.max(y, 130);
  }

  // Memorandum header - appears for ALL memos (after letterhead for formal memos)
  if (d.documentType === 'memorandum') {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(12);
    pdf.text('MEMORANDUM', PW / 2, y, { align: 'center' });
    y += LH * 2;
  }

  pdf.setFont(fontName, 'normal');
  pdf.setFontSize(12);
  const senderX = PW - MR - 72;
  if (d.showInReplyTo) { pdf.setFontSize(6); pdf.text('IN REPLY REFER TO:', senderX, y - 11); pdf.setFontSize(12); }
  if (d.ssic) { pdf.text(d.ssic, senderX, y); y += LH; }
  if (d.officeCode) { pdf.text(d.officeCode, senderX, y); y += LH; }
  pdf.text(d.date, senderX, y);
  y += LH * 2;

  if (d.documentType === 'endorsement') {
    pdf.setFont(fontName, 'bold');
    pdf.text(d.endorseNumber + ' ENDORSEMENT', PW / 2, y, { align: 'center' });
    y += LH * 2;
    pdf.setFont(fontName, 'normal');
  }

  pdf.text('From:', ML, y);
  pdf.splitTextToSize(d.from, CW - TAB).forEach(line => { pdf.text(line, ML + TAB, y); y += LH; });
  pdf.text('To:', ML, y);
  pdf.splitTextToSize(d.to, CW - TAB).forEach(line => { pdf.text(line, ML + TAB, y); y += LH; });

  if (d.via.length > 0) {
    pdf.text('Via:', ML, y);
    d.via.forEach((v, i) => {
      const viaText = d.via.length > 1 ? '(' + (i + 1) + ')  ' + v : v;
      pdf.splitTextToSize(viaText, CW - TAB).forEach(line => { pdf.text(line, ML + TAB, y); y += LH; });
    });
  }

  y += LH;
  pageBreak(LH * 2);
  pdf.text('Subj:', ML, y);
  pdf.splitTextToSize(subjText, CW - TAB).forEach(line => { pdf.text(line, ML + TAB, y); y += LH; });

  if (d.refs.length > 0) {
    y += LH;
    pageBreak(LH * (d.refs.length + 1));
    pdf.text('Ref:', ML, y);
    d.refs.forEach((r, i) => {
      pdf.splitTextToSize('(' + getLetter(i) + ')  ' + r, CW - TAB).forEach(line => { pdf.text(line, ML + TAB, y); y += LH; });
    });
  }

  if (d.encls.length > 0) {
    y += LH;
    pageBreak(LH * (d.encls.length + 1));
    pdf.text('Encl:', ML, y);
    d.encls.forEach((e, i) => {
      pdf.splitTextToSize('(' + (i + 1) + ')  ' + e, CW - TAB).forEach(line => { pdf.text(line, ML + TAB, y); y += LH; });
    });
  }

  // Body paragraphs with enhanced orphan/widow prevention
  if (d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;
    const MIN_LINES_ON_PAGE = 2;
    const MIN_LINES_TO_CARRY = 2;
    const END_BLOCK_KEEP_LINES = 3;

    const sigHeight = d.sigName ? (LH * 5 + (d.byDirection ? LH : 0)) : 0;
    const copyHeight = d.copies.length > 0 ? (LH * 2 + LH * d.copies.length) : 0;
    const endBlockHeight = sigHeight + copyHeight;

    for (let pIdx = 0; pIdx < d.paras.length; pIdx++) {
      const p = d.paras[pIdx];
      const isLastPara = (pIdx === d.paras.length - 1);
      const pText = ensureDoubleSpaces(p.text);
      y += LH;
      let label, indent;
      if (p.type === 'para') { pn++; sn = 0; ssn = 0; sssn = 0; label = pn + '.'; indent = 0; }
      else if (p.type === 'subpara') { sn++; ssn = 0; sssn = 0; label = getLetter(sn - 1) + '.'; indent = IM; }
      else if (p.type === 'subsubpara') { ssn++; sssn = 0; label = '(' + ssn + ')'; indent = IM + IS; }
      else { sssn++; label = '(' + getLetter(sssn - 1) + ')'; indent = IM + IS + ISS; }

      // Add portion marking if enabled
      let portionMark = '';
      let portionWidth = 0;
      if (d.portionMarkingEnabled && p.portionMark) {
        portionMark = `(${p.portionMark}) `;
        portionWidth = pdf.getTextWidth(portionMark);
      }

      const lx = ML + indent + portionWidth;
      const labelWidth = pdf.getTextWidth(label);
      const tx = lx + labelWidth + 4;
      const firstLineWidth = CW - indent - labelWidth - 4 - portionWidth;

      // Calculate total lines
      const firstLineText = pdf.splitTextToSize(pText, firstLineWidth);
      let totalLines = 1;
      if (firstLineText.length > 1) {
        const remainingText = pText.substring(firstLineText[0].length).trim();
        if (remainingText) {
          totalLines += pdf.splitTextToSize(remainingText, CW).length;
        }
      }

      const paraHeight = totalLines * LH;
      const spaceRemaining = PH - MB - y;

      // Orphan/widow prevention
      if (isLastPara) {
        const linesToKeepWithEnd = Math.min(END_BLOCK_KEEP_LINES, totalLines);
        if (paraHeight > spaceRemaining) {
          const linesOnCurrentPage = Math.floor(spaceRemaining / LH);
          const linesOnNextPage = totalLines - linesOnCurrentPage;
          if (linesOnCurrentPage < MIN_LINES_ON_PAGE ||
              linesOnNextPage <= linesToKeepWithEnd) {
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

      pageBreak(LH * 2);

      // Draw portion marking if enabled
      if (portionMark) {
        pdf.setFont(fontName, 'bold');
        pdf.text(portionMark, ML + indent, y);
        pdf.setFont(fontName, 'normal');
      }

      pdf.text(label, lx, y);
      if (p.subject && p.type === 'para') {
        const rightEdge = PW - MR;
        const subjectWidth = Math.min(pdf.getTextWidth(p.subject), rightEdge - tx - 6);
        pdf.text(p.subject, tx, y);
        pdf.setLineWidth(0.5);
        pdf.line(tx, y + 2, tx + subjectWidth, y + 2);
        y += LH;
        if (pText) {
          pdf.splitTextToSize(pText, CW).forEach(line => { pageBreak(LH); pdf.text(line, ML, y); y += LH; });
        }
      } else {
        const lines = pdf.splitTextToSize(pText, CW - indent - labelWidth - 4);
        pdf.text(lines[0] || '', tx, y);
        y += LH;
        if (lines.length > 1) {
          const remaining = pText.substring(lines[0].length).trim();
          if (remaining) {
            pdf.splitTextToSize(remaining, CW).forEach(line => { pageBreak(LH); pdf.text(line, ML, y); y += LH; });
          }
        }
      }
    }
  }

  // Signature and Copy-to block - keep together
  const sigBlockHeight = d.sigName ? (LH * 5 + (d.byDirection ? LH : 0)) : 0;
  const copyBlockHeight = d.copies.length > 0 ? (LH * 2 + LH * d.copies.length) : 0;
  const totalEndBlockHeight = sigBlockHeight + copyBlockHeight;

  if (totalEndBlockHeight > 0) {
    const spaceForEndBlock = PH - MB - y;
    if (spaceForEndBlock < totalEndBlockHeight) {
      pageBreak(totalEndBlockHeight);
    }
  }

  if (d.sigName) {
    y += LH * 4;
    pdf.setFont(fontName, 'normal');
    pdf.text(d.sigName.toUpperCase(), PW / 2, y);
    y += LH;
    if (d.byDirection) { pdf.text('By direction', PW / 2, y); y += LH; }
  }

  // Copy to (numbered if multiple)
  if (d.copies.length > 0) {
    y += LH * 2;
    pdf.text('Copy to:', ML, y);
    d.copies.forEach((c, i) => {
      const copyText = d.copies.length > 1 ? `(${i + 1})  ${c}` : c;
      pdf.text(copyText, ML + TAB, y);
      y += LH;
    });
  }

  // Classification at bottom of every page (symmetric with top at y=20)
  if (d.classification) {
    for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(fontSize);
      pdf.text(d.classification, PW / 2, PH - 36, { align: 'center' });
    }
  }

  // Page numbers (above classification if present) - only on page 2+
  if (pdf.getNumberOfPages() > 1) {
    const pageNumY = d.classification ? PH - 50 : PH - 36;
    for (let i = 2; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(fontSize);
      pdf.text(String(i), PW / 2, pageNumY, { align: 'center' });
    }
  }

  // Open PDF in new window for printing
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(pdfUrl, '_blank');

  if (printWindow) {
    printWindow.onload = function() {
      printWindow.focus();
      setTimeout(function() { printWindow.print(); }, 500);
    };
    showStatus('success', 'Print preview opened in new tab');
  } else {
    showStatus('error', 'Popup blocked - please allow popups and try again');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generatePDF
  };
}
