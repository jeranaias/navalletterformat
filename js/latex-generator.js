/**
 * Naval Letter Generator - LaTeX Generator
 * Generates SECNAV M-5216.5 compliant LaTeX output
 */

/**
 * Generate LaTeX document from form data
 * @returns {string} - Complete LaTeX document
 */
function generateTex() {
  const d = collectData();

  let tex = `%% Naval Letter - Generated ${new Date().toISOString()}
%% SECNAV M-5216.5 Compliant

\\documentclass[12pt,oneside]{article}
\\usepackage[letterpaper,top=1in,bottom=1in,left=1in,right=1in,headheight=26pt,headsep=12pt,footskip=0.5in]{geometry}
\\usepackage{mathptmx}
\\usepackage{setspace}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{lastpage}
\\usepackage{eso-pic}

\\singlespacing
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\fancypagestyle{firstpage}{\\fancyhf{}\\renewcommand{\\headrulewidth}{0pt}}
\\fancypagestyle{continuation}{\\fancyhf{}\\renewcommand{\\headrulewidth}{0pt}\\fancyhead[L]{\\small Subj:\\hspace{0.375in}${escapeLatex(d.subj.toUpperCase())}}\\fancyfoot[C]{\\thepage}}
\\pagestyle{continuation}

\\newlength{\\labeltab}\\setlength{\\labeltab}{0.625in}
\\newlength{\\Lmain}\\settowidth{\\Lmain}{1.\\ }
\\newlength{\\Lsub}\\settowidth{\\Lsub}{a.\\ }
\\newlength{\\Lsubsub}\\settowidth{\\Lsubsub}{(1)\\ }
\\newlength{\\Lsubsubsub}\\settowidth{\\Lsubsubsub}{(a)\\ }

\\begin{document}
\\thispagestyle{firstpage}
\\vspace*{-0.5in}

`;

  // Classification at top
  if (d.classification) {
    tex += `\\begin{center}\\textbf{${escapeLatex(d.classification)}}\\end{center}\\vspace{6pt}\n`;
  }

  // Letterhead
  if (d.useLetterhead) {
    if (d.hasSeal) {
      tex += `\\AddToShipoutPictureBG*{\\AtPageUpperLeft{\\put(0.5in,-1.5in){\\includegraphics[width=1in]{${d.sealFilename}}}}}\n`;
    }
    tex += `\\begin{center}\n`;
    if (d.unitName) {
      tex += `{\\fontsize{10}{11}\\selectfont\\textbf{${escapeLatex(d.unitName.toUpperCase())}}}\\\\\n`;
    }
    if (d.unitAddress) {
      d.unitAddress.split('\n').filter(l => l.trim()).forEach(line => {
        tex += `{\\fontsize{8}{9}\\selectfont ${escapeLatex(line.trim())}}\\\\\n`;
      });
    }
    tex += `\\end{center}\\vspace{6pt}\n`;
  }

  // Memorandum header (instead of letterhead)
  if (d.documentType === 'memorandum') {
    tex += `\\begin{center}\\textbf{MEMORANDUM}\\end{center}\\vspace{6pt}\n`;
  }

  // Sender's symbols block
  tex += `\\begin{flushright}\n${escapeLatex(d.ssic)}\\\\\n`;
  if (d.officeCode) {
    tex += `${escapeLatex(d.officeCode)}\\\\\n`;
  }
  tex += `${escapeLatex(d.date)}\n\\end{flushright}\n\\vspace{\\baselineskip}\n`;

  // Endorsement header
  if (d.documentType === 'endorsement') {
    tex += `\\begin{center}\\textbf{${escapeLatex(d.endorseNumber)} ENDORSEMENT}\\end{center}\\vspace{\\baselineskip}\n`;
  }

  // From/To
  tex += `\\noindent\\makebox[\\labeltab][l]{From:}${escapeLatex(d.from)}\n\n`;
  tex += `\\noindent\\makebox[\\labeltab][l]{To:}${escapeLatex(d.to)}\n\n`;

  // Via
  if (d.via.length > 0) {
    tex += `\\noindent\\makebox[\\labeltab][l]{Via:}`;
    d.via.forEach((v, i) => {
      tex += i === 0 ? `(${i + 1}) ${escapeLatex(v)}` : `\\\\\n\\hspace*{\\labeltab}(${i + 1}) ${escapeLatex(v)}`;
    });
    tex += `\n\n`;
  }

  // Subject
  tex += `\\vspace{\\baselineskip}\n\\noindent\\makebox[\\labeltab][l]{Subj:}${escapeLatex(d.subj.toUpperCase())}\n\n`;

  // References
  if (d.refs.length > 0) {
    tex += `\\vspace{\\baselineskip}\n\\noindent\\makebox[\\labeltab][l]{Ref:}%\n\\begin{minipage}[t]{\\dimexpr\\textwidth-\\labeltab\\relax}\n`;
    d.refs.forEach((r, i) => {
      tex += `(${LETTERS[i]}) ${escapeLatex(r)}${i < d.refs.length - 1 ? '\\\\*\n' : '\n'}`;
    });
    tex += `\\end{minipage}\n\n`;
  }

  // Enclosures
  if (d.encls.length > 0) {
    tex += `\\vspace{\\baselineskip}\n\\noindent\\makebox[\\labeltab][l]{Encl:}%\n\\begin{minipage}[t]{\\dimexpr\\textwidth-\\labeltab\\relax}\n`;
    d.encls.forEach((e, i) => {
      tex += `(${i + 1}) ${escapeLatex(e)}${i < d.encls.length - 1 ? '\\\\*\n' : '\n'}`;
    });
    tex += `\\end{minipage}\n\n`;
  }

  // Body paragraphs
  if (d.paras.length > 0) {
    let pn = 0, sn = 0, ssn = 0, sssn = 0;
    for (const p of d.paras) {
      // Ensure double spaces after periods (military standard)
      const text = escapeLatex(ensureDoubleSpaces(p.text));

      if (p.type === 'para') {
        pn++;
        sn = 0;
        ssn = 0;
        sssn = 0;
        // Add underlined subject if present
        const subjectPart = p.subject ? `\\underline{${escapeLatex(p.subject)}}  ` : '';
        tex += `\\par\\vspace{\\baselineskip}\n\\noindent ${pn}.\\ ${subjectPart}${text}\n\n`;
      } else if (p.type === 'subpara') {
        sn++;
        ssn = 0;
        sssn = 0;
        tex += `\\par\\vspace{\\baselineskip}\n\\noindent\\hspace{\\Lmain}${LETTERS[sn - 1]}.\\ ${text}\n\n`;
      } else if (p.type === 'subsubpara') {
        ssn++;
        sssn = 0;
        tex += `\\par\\vspace{\\baselineskip}\n\\noindent\\hspace{\\Lmain}\\hspace{\\Lsub}(${ssn})\\ ${text}\n\n`;
      } else if (p.type === 'subsubsubpara') {
        sssn++;
        tex += `\\par\\vspace{\\baselineskip}\n\\noindent\\hspace{\\Lmain}\\hspace{\\Lsub}\\hspace{\\Lsubsub}(${LETTERS[sssn - 1]})\\ ${text}\n\n`;
      }
    }
  }

  // Signature
  if (d.sigName) {
    tex += `\\par\\vspace{4\\baselineskip}\n\\hspace*{3.25in}${escapeLatex(d.sigName.toUpperCase())}`;
    if (d.byDirection) {
      tex += `\\\\\n\\hspace*{3.25in}By direction`;
    }
    tex += `\n\n`;
  }

  // Copy to
  if (d.copies.length > 0) {
    tex += `\\par\\vspace{2\\baselineskip}\n\\noindent Copy to:\\\\\n`;
    d.copies.forEach((c, i) => {
      tex += `${escapeLatex(c)}${i < d.copies.length - 1 ? '\\\\*\n' : '\n'}`;
    });
  }

  // Classification at bottom
  if (d.classification) {
    tex += `\\vfill\n\\begin{center}\\textbf{${escapeLatex(d.classification)}}\\end{center}\n`;
  }

  tex += `\\end{document}\n`;
  return tex;
}

/**
 * Preview LaTeX in preview section
 */
function previewTex() {
  document.getElementById('previewContent').textContent = generateTex();
  document.getElementById('previewSection').classList.add('show');
}

/**
 * Download .tex file
 */
function downloadTex() {
  const tex = generateTex();
  const d = collectData();
  const filename = generateFilename(d.subj, 'tex');
  const blob = new Blob([tex], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showStatus('success', 'Downloaded ' + filename);
}

/**
 * Download ZIP file with .tex and seal image
 */
async function downloadZip() {
  if (typeof JSZip === 'undefined') {
    showStatus('error', 'ZIP library not loaded');
    return;
  }

  showStatus('loading', 'Creating ZIP...');

  try {
    const zip = new JSZip();
    const d = collectData();

    zip.file('naval_letter.tex', generateTex());

    if (d.sealData && d.sealFilename) {
      zip.file(d.sealFilename, d.sealData.split(',')[1], { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const filename = generateFilename(d.subj, 'zip');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    showStatus('success', 'Downloaded ' + filename);
  } catch (err) {
    showStatus('error', 'Error: ' + err.message);
  }
}

/**
 * Open in Overleaf directly
 */
function openInOverleafDirect() {
  const d = collectData();

  if (d.hasSeal) {
    showStatus('error', 'Custom seal requires ZIP upload to Overleaf');
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.overleaf.com/docs';
  form.target = '_blank';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'snip';
  input.value = generateTex();
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  showStatus('success', 'Overleaf opened - click Recompile');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateTex,
    previewTex,
    downloadTex,
    downloadZip,
    openInOverleafDirect
  };
}
