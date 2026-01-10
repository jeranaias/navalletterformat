/**
 * Naval Letter Generator - Import/Export Manager
 * Handles Word doc import/export, recently used memory, and clipboard operations
 */

// ============================================================
// WORD DOCUMENT IMPORT (.docx)
// ============================================================

/**
 * Initialize the document import drop zone
 */
function initDocumentImport() {
  const dropZone = document.getElementById('docDropZone');
  const fileInput = document.getElementById('docFileInput');

  if (!dropZone || !fileInput) return;

  // Click to upload
  dropZone.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleDocumentFile(e.target.files[0]);
    }
  });

  // Drag and drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleDocumentFile(files[0]);
    }
  });
}

/**
 * Handle uploaded document file
 * @param {File} file - The uploaded file
 */
async function handleDocumentFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  if (!validTypes.includes(file.type) && !file.name.match(/\.(docx|doc|txt)$/i)) {
    showStatus('error', 'Please upload a Word document (.docx) or text file (.txt)');
    return;
  }

  showStatus('loading', 'Parsing document...');

  try {
    if (file.name.endsWith('.txt')) {
      const text = await file.text();
      parseNavalLetterText(text);
    } else {
      // Use mammoth.js for .docx files
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      parseNavalLetterText(result.value);
    }
    showStatus('success', 'Document imported successfully!');
  } catch (error) {
    console.error('Document import error:', error);
    showStatus('error', 'Failed to parse document. Please check the format.');
  }
}

/**
 * Parse naval letter text and populate form fields
 * @param {string} text - Raw text from document
 */
function parseNavalLetterText(text) {
  // Normalize line breaks and clean up
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

  // Patterns to match naval letter components
  const patterns = {
    ssic: /^(\d{4,5})\s*$/,
    date: /^(\d{1,2}\s+\w{3}\s+\d{2,4})$/i,
    from: /^From:\s*(.+)$/i,
    to: /^To:\s*(.+)$/i,
    via: /^Via:\s*(?:\(\d+\))?\s*(.+)$/i,
    subj: /^Subj:\s*(.+)$/i,
    ref: /^Ref:\s*(?:\([a-z]\))?\s*(.+)$/i,
    refContinue: /^\([a-z]\)\s+(.+)$/i,  // Reference continuation like "(b) MCO..."
    encl: /^Encl:\s*(?:\(\d+\))?\s*(.+)$/i,
    enclContinue: /^\(\d+\)\s+(.+)$/,  // Enclosure continuation like "(2) Document..."
    para: /^(\d+)\.\s+(.+)$/,
    subpara: /^([a-z])\.\s+(.+)$/,
    subsubpara: /^\((\d+)\)\s+(.+)$/,
    subsubsubpara: /^\(([a-z])\)\s+(.+)$/
  };

  let currentField = null;  // Track what section we're in
  let refs = [];
  let encls = [];
  let vias = [];
  let paragraphs = [];
  let currentPara = null;
  let inBodySection = false;  // Flag to track when we've entered body paragraphs

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for SSIC (usually near top, 4-5 digits)
    if (patterns.ssic.test(line) && i < 10) {
      document.getElementById('ssicSearch').value = line;
      continue;
    }

    // Check for date
    if (patterns.date.test(line) && i < 15) {
      document.getElementById('date').value = line;
      continue;
    }

    // From
    let match = line.match(patterns.from);
    if (match) {
      document.getElementById('from').value = match[1].trim();
      currentField = 'from';
      continue;
    }

    // To
    match = line.match(patterns.to);
    if (match) {
      document.getElementById('to').value = match[1].trim();
      currentField = 'to';
      continue;
    }

    // Via
    match = line.match(patterns.via);
    if (match) {
      vias.push(match[1].trim());
      currentField = 'via';
      continue;
    }

    // Subject
    match = line.match(patterns.subj);
    if (match) {
      document.getElementById('subj').value = match[1].trim();
      currentField = 'subj';
      continue;
    }

    // Reference (starts with "Ref:")
    match = line.match(patterns.ref);
    if (match) {
      // Extract the actual reference text, removing (a) prefix if present
      let refText = match[1].trim();
      refText = refText.replace(/^\([a-z]\)\s*/i, '');
      refs.push(refText);
      currentField = 'ref';
      continue;
    }

    // Reference continuation line like "(b) MCO 1050.3J"
    if (currentField === 'ref' && !inBodySection) {
      match = line.match(patterns.refContinue);
      if (match) {
        refs.push(match[1].trim());
        continue;
      }
    }

    // Enclosure (starts with "Encl:")
    match = line.match(patterns.encl);
    if (match) {
      // Extract the actual enclosure text, removing (1) prefix if present
      let enclText = match[1].trim();
      enclText = enclText.replace(/^\(\d+\)\s*/, '');
      encls.push(enclText);
      currentField = 'encl';
      continue;
    }

    // Enclosure continuation line like "(2) Document Name"
    if (currentField === 'encl' && !inBodySection) {
      match = line.match(patterns.enclContinue);
      if (match) {
        encls.push(match[1].trim());
        continue;
      }
    }

    // Main paragraph (e.g., "1.  Text here")
    match = line.match(patterns.para);
    if (match) {
      inBodySection = true;  // We've entered the body
      if (currentPara) paragraphs.push(currentPara);
      currentPara = { type: 'para', text: match[2].trim() };
      currentField = 'para';
      continue;
    }

    // Only match sub-paragraphs if we're already in body section
    if (inBodySection) {
      // Sub-paragraph (e.g., "a.  Text here")
      match = line.match(patterns.subpara);
      if (match) {
        if (currentPara) paragraphs.push(currentPara);
        currentPara = { type: 'subpara', text: match[2].trim() };
        continue;
      }

      // Sub-sub-paragraph (e.g., "(1)  Text here")
      match = line.match(patterns.subsubpara);
      if (match) {
        if (currentPara) paragraphs.push(currentPara);
        currentPara = { type: 'subsubpara', text: match[2].trim() };
        continue;
      }

      // Sub-sub-sub-paragraph (e.g., "(a)  Text here")
      match = line.match(patterns.subsubsubpara);
      if (match) {
        if (currentPara) paragraphs.push(currentPara);
        currentPara = { type: 'subsubsubpara', text: match[2].trim() };
        continue;
      }

      // Continuation of current paragraph
      if (currentPara && line && !line.match(/^(Copy to:|By direction)/i)) {
        currentPara.text += ' ' + line;
      }
    }
  }

  // Push last paragraph
  if (currentPara) paragraphs.push(currentPara);

  // Populate Via fields
  const viaList = document.getElementById('viaList');
  viaList.innerHTML = '';
  vias.forEach((v, i) => {
    addVia();
    const inputs = viaList.querySelectorAll('input[name="via[]"]');
    if (inputs[i]) inputs[i].value = v;
  });

  // Populate References
  const refList = document.getElementById('refList');
  refList.innerHTML = '';
  refs.forEach((r, i) => {
    addRef();
    const inputs = refList.querySelectorAll('input[name="ref[]"]');
    if (inputs[i]) inputs[i].value = r;
  });

  // Populate Enclosures
  const enclList = document.getElementById('enclList');
  enclList.innerHTML = '';
  encls.forEach((e, i) => {
    addEncl();
    const inputs = enclList.querySelectorAll('input[name="encl[]"]');
    if (inputs[i]) inputs[i].value = e;
  });

  // Populate Paragraphs
  const paraContainer = document.getElementById('paraContainer');
  paraContainer.innerHTML = '';
  paragraphs.forEach(p => {
    addParaAfter(null, p.type);
    const items = paraContainer.querySelectorAll('.para-item');
    const lastItem = items[items.length - 1];
    if (lastItem) {
      const editor = lastItem.querySelector('.para-editor');
      if (editor && p.text) {
        editor.innerHTML = p.text;
      }
    }
  });

  // Trigger preview update if enabled
  if (typeof schedulePreviewUpdate === 'function') {
    schedulePreviewUpdate();
  }
}

// ============================================================
// WORD DOCUMENT EXPORT (.docx)
// ============================================================

/**
 * Convert base64 data URL to Uint8Array for docx ImageRun
 * @param {string} dataUrl - Base64 data URL (e.g., "data:image/jpeg;base64,...")
 * @returns {Uint8Array|null}
 */
function dataUrlToUint8Array(dataUrl) {
  try {
    if (!dataUrl || !dataUrl.includes(',')) return null;
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.warn('Could not convert seal data:', e);
    return null;
  }
}

/**
 * Parse HTML content to extract text with formatting
 * Returns array of { text, bold, italic, underline }
 */
function parseHtmlForWord(html) {
  if (!html) return [{ text: '', bold: false, italic: false, underline: false }];

  const segments = [];
  const div = document.createElement('div');
  div.innerHTML = html;

  function processNode(node, style = { bold: false, italic: false, underline: false }) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        segments.push({
          text: node.textContent,
          bold: style.bold,
          italic: style.italic,
          underline: style.underline
        });
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const newStyle = { ...style };
      const tag = node.tagName.toLowerCase();

      if (tag === 'b' || tag === 'strong') newStyle.bold = true;
      if (tag === 'i' || tag === 'em') newStyle.italic = true;
      if (tag === 'u') newStyle.underline = true;

      for (const child of node.childNodes) {
        processNode(child, newStyle);
      }
    }
  }

  for (const child of div.childNodes) {
    processNode(child);
  }

  return segments.length > 0 ? segments : [{ text: '', bold: false, italic: false, underline: false }];
}

/**
 * Export letter as Word document (.docx)
 * Matches PDF output exactly
 */
async function exportToWord() {
  const d = collectData();

  showStatus('loading', 'Generating Word document...');

  try {
    const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, TabStopType, UnderlineType, convertInchesToTwip, Header, Footer } = docx;

    // Font settings to match PDF exactly
    const FONT = 'Times New Roman';
    const SIZE_12 = 24; // 12pt in half-points
    const SIZE_10 = 20; // 10pt
    const SIZE_8 = 16;  // 8pt
    const SIZE_6 = 12;  // 6pt for "IN REPLY REFER TO"
    const LINE_SPACING = 240; // Single line spacing (240 twips = 1 line)

    // Tab stop for labels - matches PDF TAB = 45pt = 900 twips (0.625 inch)
    const LABEL_TAB = 900;

    // Indentation values to match PDF (in twips, 1 pt = 20 twips)
    const IM = 300;   // 15pt - main para text indent
    const IS = 320;   // 16pt - subpara indent
    const ISS = 360;  // 18pt - subsubpara indent
    const ISSS = 380; // 19pt - subsubsubpara indent

    // Signature starts at page center (3.25 inches from left = 4680 twips)
    const SIG_INDENT = 4680;

    const children = [];

    // Get seal image data
    let sealImageData = null;
    if (d.useLetterhead && d.hasSeal && d.sealData) {
      sealImageData = dataUrlToUint8Array(d.sealData);
    }

    // Classification at top (centered, bold)
    if (d.classification) {
      children.push(new Paragraph({
        children: [new TextRun({ text: d.classification, bold: true, size: SIZE_12, font: FONT })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 }
      }));
    }

    // Letterhead section
    if (d.useLetterhead) {
      const unitNameChildren = [];

      if (sealImageData) {
        try {
          unitNameChildren.push(new ImageRun({
            data: sealImageData,
            transformation: { width: 72, height: 72 },
            floating: {
              horizontalPosition: { relative: 'page', offset: 457200 },
              verticalPosition: { relative: 'page', offset: 457200 },
              wrap: { type: 'none' },
              behindDocument: true
            }
          }));
        } catch (e) {
          console.warn('Could not add seal to Word doc:', e);
        }
      }

      if (d.unitName) {
        unitNameChildren.push(new TextRun({ text: d.unitName.toUpperCase(), bold: true, size: SIZE_10, font: FONT }));
        children.push(new Paragraph({
          children: unitNameChildren,
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 }
        }));
      } else if (sealImageData) {
        children.push(new Paragraph({ children: unitNameChildren, spacing: { after: 0 } }));
      }

      if (d.unitAddress) {
        d.unitAddress.split('\n').filter(l => l.trim()).forEach(line => {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.trim().toUpperCase(), size: SIZE_8, font: FONT })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 }
          }));
        });
      }

      // Match PDF spacing after letterhead
      children.push(new Paragraph({ children: [], spacing: { after: 480 } }));
    }

    // Sender's symbols block - positioned on right side
    // "IN REPLY REFER TO:" label if enabled
    if (d.showInReplyTo) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'IN REPLY REFER TO:', size: SIZE_6, font: FONT })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 }
      }));
    }

    if (d.ssic) {
      children.push(new Paragraph({
        children: [new TextRun({ text: d.ssic, size: SIZE_12, font: FONT })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 }
      }));
    }
    if (d.officeCode) {
      children.push(new Paragraph({
        children: [new TextRun({ text: d.officeCode, size: SIZE_12, font: FONT })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 }
      }));
    }
    if (d.date) {
      children.push(new Paragraph({
        children: [new TextRun({ text: d.date, size: SIZE_12, font: FONT })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: LINE_SPACING }
      }));
    }

    // Memorandum title (after SSIC/date, left-aligned, one blank line gap before and after)
    if (d.documentType === 'memorandum') {
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING * 2 } }));
      children.push(new Paragraph({
        children: [new TextRun({ text: d.memoTitle || 'MEMORANDUM', size: SIZE_12, font: FONT })],
        alignment: AlignmentType.LEFT,
        spacing: { after: LINE_SPACING * 2 }
      }));
    } else {
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
    }

    // Endorsement header (centered, bold)
    if (d.documentType === 'endorsement') {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${d.endorseNumber} ENDORSEMENT`, bold: true, size: SIZE_12, font: FONT })],
        alignment: AlignmentType.CENTER,
        spacing: { after: LINE_SPACING * 2 }
      }));
    }

    // Helper for labeled fields with tab stops
    const createLabeledPara = (label, value, spacing = 0) => {
      return new Paragraph({
        children: [
          new TextRun({ text: label, size: SIZE_12, font: FONT }),
          new TextRun({ text: '\t', size: SIZE_12 }),
          new TextRun({ text: value, size: SIZE_12, font: FONT })
        ],
        tabStops: [{ type: TabStopType.LEFT, position: LABEL_TAB }],
        spacing: { after: spacing }
      });
    };

    // From/To/Via only for non-memo documents
    if (d.documentType !== 'memorandum') {
      // From line
      children.push(createLabeledPara('From:', d.from));

      // To line
      children.push(createLabeledPara('To:', d.to));

      // Via lines (numbered if multiple)
      if (d.via && d.via.length > 0) {
        d.via.forEach((v, i) => {
          const viaText = d.via.length > 1 ? `(${i + 1})  ${v}` : v;
          children.push(new Paragraph({
            children: [
              new TextRun({ text: i === 0 ? 'Via:' : '', size: SIZE_12, font: FONT }),
              new TextRun({ text: '\t', size: SIZE_12 }),
              new TextRun({ text: viaText, size: SIZE_12, font: FONT })
            ],
            tabStops: [{ type: TabStopType.LEFT, position: LABEL_TAB }],
            spacing: { after: 0 }
          }));
        });
      }

      // Blank line before Subject (matches PDF y += LH)
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
    }

    // Subject line (uppercase)
    children.push(createLabeledPara('Subj:', d.subj.toUpperCase()));

    // References (with blank line before)
    if (d.refs && d.refs.length > 0) {
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
      d.refs.forEach((r, i) => {
        const letter = String.fromCharCode(97 + i);
        children.push(new Paragraph({
          children: [
            new TextRun({ text: i === 0 ? 'Ref:' : '', size: SIZE_12, font: FONT }),
            new TextRun({ text: '\t', size: SIZE_12 }),
            new TextRun({ text: `(${letter})  ${r}`, size: SIZE_12, font: FONT })
          ],
          tabStops: [{ type: TabStopType.LEFT, position: LABEL_TAB }],
          spacing: { after: 0 }
        }));
      });
    }

    // Enclosures (with blank line before)
    if (d.encls && d.encls.length > 0) {
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
      d.encls.forEach((e, i) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: i === 0 ? 'Encl:' : '', size: SIZE_12, font: FONT }),
            new TextRun({ text: '\t', size: SIZE_12 }),
            new TextRun({ text: `(${i + 1})  ${e}`, size: SIZE_12, font: FONT })
          ],
          tabStops: [{ type: TabStopType.LEFT, position: LABEL_TAB }],
          spacing: { after: 0 }
        }));
      });
    }

    // Endorsement action
    if (d.documentType === 'endorsement' && d.endorseAction) {
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `1.  ${d.endorseAction}.`, size: SIZE_12, font: FONT })],
        spacing: { after: LINE_SPACING * 2 }
      }));
    }

    // Body paragraphs with proper indentation matching PDF
    if (d.paras && d.paras.length > 0) {
      let pn = 0, sn = 0, ssn = 0, sssn = 0;

      d.paras.forEach((p, pIdx) => {
        let label, indent = 0, labelWidth = 0;

        // Parse HTML content for formatting
        const htmlContent = p.html || p.text || '';
        const segments = parseHtmlForWord(htmlContent);

        if (p.type === 'para') {
          pn++; sn = 0; ssn = 0; sssn = 0;
          label = pn + '.';
          indent = 0;
          labelWidth = IM;
        } else if (p.type === 'subpara') {
          sn++; ssn = 0; sssn = 0;
          label = String.fromCharCode(96 + sn) + '.';
          indent = IM;
          labelWidth = IS;
        } else if (p.type === 'subsubpara') {
          ssn++; sssn = 0;
          label = '(' + ssn + ')';
          indent = IM + IS;
          labelWidth = ISS;
        } else {
          sssn++;
          label = '(' + String.fromCharCode(96 + sssn) + ')';
          indent = IM + IS + ISS;
          labelWidth = ISSS;
        }

        // Build text runs with formatting
        const textRuns = [];

        // Handle paragraph subject (top-level only, underlined)
        if (p.subject && p.type === 'para') {
          textRuns.push(new TextRun({
            text: label + '  ',
            size: SIZE_12,
            font: FONT
          }));
          textRuns.push(new TextRun({
            text: p.subject,
            size: SIZE_12,
            font: FONT,
            underline: { type: UnderlineType.SINGLE }
          }));
          // Add space after subject if there's body text
          if (segments.some(s => s.text.trim())) {
            textRuns.push(new TextRun({ text: '  ', size: SIZE_12, font: FONT }));
          }
        } else {
          textRuns.push(new TextRun({ text: label + '  ', size: SIZE_12, font: FONT }));
        }

        // Add formatted text segments
        segments.forEach(seg => {
          if (seg.text) {
            // Ensure double space after periods (but not after initials like "C.")
            const text = seg.text.replace(/([a-zA-Z]{2,})\. (?=[a-zA-Z])/g, '$1.  ');
            textRuns.push(new TextRun({
              text: text,
              size: SIZE_12,
              font: FONT,
              bold: seg.bold,
              italics: seg.italic,
              underline: seg.underline ? { type: UnderlineType.SINGLE } : undefined
            }));
          }
        });

        // Add paragraph with proper hanging indent
        children.push(new Paragraph({
          children: textRuns,
          indent: {
            left: indent,
            hanging: 0,
            firstLine: 0
          },
          spacing: {
            before: LINE_SPACING,
            after: 0,
            line: LINE_SPACING
          }
        }));
      });
    }

    // Signature block - matches PDF exactly
    // 4 blank lines before signature name
    if (d.sigName) {
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));

      // Signature name (ALL CAPS) at page center
      children.push(new Paragraph({
        children: [new TextRun({ text: d.sigName.toUpperCase(), size: SIZE_12, font: FONT })],
        indent: { left: SIG_INDENT },
        spacing: { after: 0 }
      }));

      // "By direction" AFTER signature name (per SECNAV M-5216.5)
      if (d.byDirection) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'By direction', size: SIZE_12, font: FONT })],
          indent: { left: SIG_INDENT },
          spacing: { after: 0 }
        }));
      }
    }

    // Copy to section
    if (d.copies && d.copies.length > 0) {
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));
      children.push(new Paragraph({ children: [], spacing: { after: LINE_SPACING } }));

      d.copies.forEach((c, i) => {
        const copyText = d.copies.length > 1 ? `(${i + 1})  ${c}` : c;
        children.push(new Paragraph({
          children: [
            new TextRun({ text: i === 0 ? 'Copy to:' : '', size: SIZE_12, font: FONT }),
            new TextRun({ text: '\t', size: SIZE_12 }),
            new TextRun({ text: copyText, size: SIZE_12, font: FONT })
          ],
          tabStops: [{ type: TabStopType.LEFT, position: LABEL_TAB }],
          spacing: { after: 0 }
        }));
      });
    }

    // Build document with 1-inch margins
    const sections = [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1)
          }
        }
      },
      children
    }];

    // Add classification to header/footer if present
    if (d.classification) {
      sections[0].headers = {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: d.classification, bold: true, size: SIZE_12, font: FONT })],
            alignment: AlignmentType.CENTER
          })]
        })
      };
      sections[0].footers = {
        default: new Footer({
          children: [new Paragraph({
            children: [new TextRun({ text: d.classification, bold: true, size: SIZE_12, font: FONT })],
            alignment: AlignmentType.CENTER
          })]
        })
      };
    }

    const doc = new Document({ sections });

    const blob = await Packer.toBlob(doc);
    const filename = `naval_letter_${d.ssic || 'draft'}_${new Date().toISOString().slice(0,10)}.docx`;

    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showStatus('success', 'Word document downloaded!');
  } catch (error) {
    console.error('Word export error:', error);
    showStatus('error', 'Failed to generate Word document: ' + error.message);
  }
}

// ============================================================
// RECENTLY USED MEMORY
// ============================================================

const RECENT_KEY = 'navalLetter_recentlyUsed';
const MAX_RECENT = 10;

/**
 * Get recently used values for a field
 * @param {string} field - Field name (from, to, unit)
 * @returns {Array} - Array of recent values
 */
function getRecentlyUsed(field) {
  try {
    const data = JSON.parse(localStorage.getItem(RECENT_KEY) || '{}');
    return data[field] || [];
  } catch {
    return [];
  }
}

/**
 * Save a recently used value
 * @param {string} field - Field name
 * @param {string} value - Value to save
 */
function saveRecentlyUsed(field, value) {
  if (!value || value.trim().length < 3) return;

  try {
    const data = JSON.parse(localStorage.getItem(RECENT_KEY) || '{}');
    if (!data[field]) data[field] = [];

    // Remove if exists, add to front
    const idx = data[field].indexOf(value);
    if (idx > -1) data[field].splice(idx, 1);
    data[field].unshift(value);

    // Limit size
    data[field] = data[field].slice(0, MAX_RECENT);

    localStorage.setItem(RECENT_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save recently used:', e);
  }
}

/**
 * Initialize recently used dropdowns
 */
function initRecentlyUsed() {
  const fields = [
    { id: 'from', key: 'from' },
    { id: 'to', key: 'to' },
    { id: 'unitAddress', key: 'unit' }
  ];

  fields.forEach(({ id, key }) => {
    const input = document.getElementById(id);
    if (!input) return;

    // Create dropdown container
    const container = input.parentElement;
    if (!container.classList.contains('recent-container')) {
      container.classList.add('recent-container');
      container.style.position = 'relative';
    }

    // Create dropdown
    let dropdown = container.querySelector('.recent-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'recent-dropdown';
      dropdown.style.cssText = 'display:none; position:absolute; top:100%; left:0; right:0; background:var(--white); border:1px solid var(--gray-300); border-radius:var(--radius); box-shadow:var(--shadow); z-index:100; max-height:200px; overflow-y:auto;';
      container.appendChild(dropdown);
    }

    // Show dropdown on focus
    input.addEventListener('focus', () => {
      const recent = getRecentlyUsed(key);
      if (recent.length > 0) {
        dropdown.innerHTML = recent.map(v =>
          `<div class="recent-item" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--gray-200);" data-value="${v.replace(/"/g, '&quot;')}">${v}</div>`
        ).join('');
        dropdown.style.display = 'block';

        // Add click handlers
        dropdown.querySelectorAll('.recent-item').forEach(item => {
          item.addEventListener('click', () => {
            input.value = item.dataset.value;
            dropdown.style.display = 'none';
            if (typeof schedulePreviewUpdate === 'function') {
              schedulePreviewUpdate();
            }
          });
          item.addEventListener('mouseenter', () => {
            item.style.background = 'var(--gray-100)';
          });
          item.addEventListener('mouseleave', () => {
            item.style.background = '';
          });
        });
      }
    });

    // Hide dropdown on blur (with delay for click)
    input.addEventListener('blur', () => {
      setTimeout(() => { dropdown.style.display = 'none'; }, 200);
    });

    // Save on change
    input.addEventListener('change', () => {
      saveRecentlyUsed(key, input.value);
    });
  });
}

// ============================================================
// COPY AS PLAIN TEXT
// ============================================================

/**
 * Copy letter as formatted plain text to clipboard
 */
async function copyAsPlainText() {
  const d = collectData();

  let text = '';

  // Header info
  if (d.useLetterhead && d.unitName) {
    text += d.unitName.toUpperCase() + '\n';
    if (d.unitAddress) {
      text += d.unitAddress.toUpperCase() + '\n';
    }
    text += '\n';
  }

  // Sender's symbols
  const senderBlock = [];
  if (d.ssic) senderBlock.push(d.ssic);
  if (d.officeCode) senderBlock.push(d.officeCode);
  if (d.date) senderBlock.push(d.date);
  if (senderBlock.length > 0) {
    // Right-align by padding
    const maxLen = 60;
    senderBlock.forEach(line => {
      text += line.padStart(maxLen) + '\n';
    });
    text += '\n';
  }

  // From, To, Via
  text += `From:  ${d.from}\n`;
  text += `To:    ${d.to}\n`;
  if (d.via && d.via.length > 0) {
    d.via.forEach((v, i) => {
      const label = d.via.length > 1 ? `Via: (${i+1})` : 'Via:';
      text += `${label.padEnd(7)}${v}\n`;
    });
  }
  text += '\n';

  // Subject
  text += `Subj:  ${d.subj.toUpperCase()}\n`;

  // References
  if (d.refs && d.refs.length > 0) {
    text += '\n';
    d.refs.forEach((r, i) => {
      const letter = String.fromCharCode(97 + i);
      const label = i === 0 ? 'Ref:' : '';
      text += `${label.padEnd(7)}(${letter})  ${r}\n`;
    });
  }

  // Enclosures
  if (d.encls && d.encls.length > 0) {
    text += '\n';
    d.encls.forEach((e, i) => {
      const label = i === 0 ? 'Encl:' : '';
      text += `${label.padEnd(7)}(${i+1})  ${e}\n`;
    });
  }

  text += '\n';

  // Body paragraphs
  if (d.paras && d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;

    d.paras.forEach(p => {
      let label, indent = '';

      if (p.type === 'para') {
        pn++; sn = 0; ssn = 0; sssn = 0;
        label = pn + '.';
      } else if (p.type === 'subpara') {
        sn++; ssn = 0; sssn = 0;
        label = String.fromCharCode(96 + sn) + '.';
        indent = '    ';
      } else if (p.type === 'subsubpara') {
        ssn++; sssn = 0;
        label = '(' + ssn + ')';
        indent = '        ';
      } else {
        sssn++;
        label = '(' + String.fromCharCode(96 + sssn) + ')';
        indent = '            ';
      }

      text += `${indent}${label}  ${p.text}\n\n`;
    });
  }

  // Signature
  text += '\n';
  if (d.byDirection) {
    text += '                              By direction\n';
  }
  text += '\n\n';
  if (d.sigName) {
    text += '                              ' + d.sigName.toUpperCase() + '\n';
  }

  // Copy to
  if (d.copies && d.copies.length > 0) {
    text += '\nCopy to:\n';
    d.copies.forEach(c => {
      text += c + '\n';
    });
  }

  try {
    await navigator.clipboard.writeText(text);
    showStatus('success', 'Copied to clipboard!');
  } catch (error) {
    console.error('Clipboard error:', error);
    showStatus('error', 'Failed to copy to clipboard');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize import/export manager
 */
function initImportExportManager() {
  initDocumentImport();
  initRecentlyUsed();
}

// Export for module usage
if (typeof window !== 'undefined') {
  window.initImportExportManager = initImportExportManager;
  window.handleDocumentFile = handleDocumentFile;
  window.parseNavalLetterText = parseNavalLetterText;
  window.exportToWord = exportToWord;
  window.copyAsPlainText = copyAsPlainText;
  window.getRecentlyUsed = getRecentlyUsed;
  window.saveRecentlyUsed = saveRecentlyUsed;
}
