#!/usr/bin/env node
/**
 * Naval Letter Example Generator
 * 
 * Generates sample naval letters for testing PDF output against HTML preview.
 * Run this to create example PDFs that match what the web generator produces.
 * 
 * Usage: node generate_examples.js
 * 
 * Requires: pdfkit (npm install pdfkit)
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ============================================================================
// SAMPLE DATA - Matches what users would enter in the HTML form
// ============================================================================

const EXAMPLE_LETTERS = {
  // Basic letter with minimal fields
  basic: {
    ssic: '1000',
    serialNumber: '',
    date: '13 Dec 24',
    fromLine: 'Commanding Officer, Marine Corps Detachment',
    toLine: 'Commanding General, Training and Education Command',
    viaLines: [],
    subjectLine: 'Request for Additional Training Resources',
    references: [],
    enclosures: [],
    paragraphs: [
      '1.  This letter is to request additional training resources for the upcoming fiscal year.',
      '2.  Current resources are insufficient to meet projected training requirements.',
      '3.  Request approval for the attached resource allocation.'
    ],
    signature: {
      name: 'J. D. SMITH',
      rank: 'Lieutenant Colonel, U.S. Marine Corps',
      title: 'Commanding Officer'
    },
    copyTo: [],
    sealPath: null
  },

  // Standard letter with via, references, enclosures
  standard: {
    ssic: '5216',
    serialNumber: '001/25',
    date: '13 Dec 24',
    fromLine: 'Commanding Officer, Headquarters and Service Battalion',
    toLine: 'Commandant of the Marine Corps (MMEA-25)',
    viaLines: [
      'Commanding General, Marine Corps Combat Development Command',
      'Director, Training and Education Command'
    ],
    subjectLine: 'Recommendation for Meritorious Promotion to Sergeant',
    references: [
      '(a) MCO 1400.32D',
      '(b) MCO P1070.12K'
    ],
    enclosures: [
      '(1) Meritorious Promotion Package',
      '(2) Fitness Reports (last 3)',
      '(3) Letters of Recommendation'
    ],
    paragraphs: [
      '1.  Per references (a) and (b), Corporal John A. Marine, 1234567/0311, is recommended for meritorious promotion to Sergeant.',
      '2.  Corporal Marine has consistently demonstrated superior performance, leadership ability, and dedication to duty that distinguish him from his peers.',
      '3.  Supporting documentation is provided in enclosures (1) through (3).',
      '4.  Point of contact for this matter is the undersigned at DSN 278-1234 or john.smith@usmc.mil.'
    ],
    signature: {
      name: 'J. D. SMITH',
      rank: 'Major, U.S. Marine Corps',
      title: 'Commanding Officer'
    },
    copyTo: [
      'S-1',
      'Marine\'s Service Record Book'
    ],
    sealPath: null
  },

  // Complex letter with endorsements
  withEndorsement: {
    ssic: '1650',
    serialNumber: '042/25',
    date: '10 Dec 24',
    fromLine: 'Commanding Officer, Company A, 1st Battalion, 5th Marines',
    toLine: 'Commandant of the Marine Corps (MMMA)',
    viaLines: [
      'Commanding Officer, 1st Battalion, 5th Marines',
      'Commanding General, 1st Marine Division'
    ],
    subjectLine: 'Recommendation for Navy and Marine Corps Achievement Medal',
    references: [
      '(a) SECNAVINST 1650.1H'
    ],
    enclosures: [
      '(1) Award Recommendation',
      '(2) Summary of Action'
    ],
    paragraphs: [
      '1.  Per reference (a), Lance Corporal Jane A. Marine, 7654321/0311, is recommended for the Navy and Marine Corps Achievement Medal.',
      '2.  During the period 1 June 2024 to 30 November 2024, Lance Corporal Marine performed her duties in an exemplary manner that brought credit upon herself, her unit, and the Marine Corps.',
      '3.  Enclosures (1) and (2) provide detailed justification for this recommendation.',
      '4.  Strongly recommend approval.'
    ],
    signature: {
      name: 'R. T. JONES',
      rank: 'Captain, U.S. Marine Corps',
      title: 'Commanding Officer'
    },
    copyTo: [],
    sealPath: null,
    endorsements: [
      {
        number: 'FIRST ENDORSEMENT',
        ssic: '1650',
        date: '12 Dec 24',
        fromLine: 'Commanding Officer, 1st Battalion, 5th Marines',
        toLine: 'Commanding General, 1st Marine Division',
        paragraphs: [
          '1.  Forwarded, recommending approval.'
        ],
        signature: {
          name: 'M. A. WILLIAMS',
          rank: 'Lieutenant Colonel, U.S. Marine Corps',
          title: 'Commanding Officer'
        }
      }
    ]
  },

  // Letter with continuation page (long content)
  multiPage: {
    ssic: '3000',
    serialNumber: '005/25',
    date: '13 Dec 24',
    fromLine: 'Commanding Officer, Marine Corps Detachment, Defense Language Institute',
    toLine: 'Director, Defense Language Institute Foreign Language Center',
    viaLines: [
      'Assistant Commandant, Academic Operations'
    ],
    subjectLine: 'After Action Report for Training Exercise DESERT LINGUIST 24-02',
    references: [
      '(a) DLIFLC Order 3500.1B',
      '(b) MCO 3500.27C',
      '(c) MCDP 1-0'
    ],
    enclosures: [
      '(1) Exercise Timeline',
      '(2) Participant Roster',
      '(3) Lessons Learned Database Extract',
      '(4) Photographs'
    ],
    paragraphs: [
      '1.  Purpose.  This report documents the planning, execution, and results of Training Exercise DESERT LINGUIST 24-02, conducted 15-22 November 2024.',
      '2.  Background.  Per reference (a), the Marine Corps Detachment is required to conduct semi-annual field training exercises to maintain operational readiness and language proficiency in austere environments.',
      '3.  Participants.  A total of 47 Marines participated in the exercise, including 12 Arabic linguists, 15 Russian linguists, 8 Chinese linguists, and 12 support personnel. Complete roster is provided in enclosure (2).',
      '4.  Execution.',
      '    a.  Phase I (15-17 Nov).  Initial deployment and establishment of forward operating base. Language teams conducted pattern of life analysis and began source development role-play scenarios.',
      '    b.  Phase II (18-20 Nov).  Full mission profiles including tactical questioning, document exploitation, and real-time reporting exercises. Teams rotated through all stations every 4 hours.',
      '    c.  Phase III (21-22 Nov).  Culminating exercise involving multi-language operations and joint debrief with Navy and Army linguist units.',
      '5.  Results.',
      '    a.  All participants met or exceeded minimum proficiency standards.',
      '    b.  Average DLPT improvement of 0.3 points across all languages.',
      '    c.  Three Marines achieved ILR 3/3 proficiency for the first time.',
      '    d.  Zero safety incidents reported.',
      '6.  Lessons Learned.',
      '    a.  Sustainment: Early coordination with range control and logistics support proved essential. Recommend maintaining 30-day advance coordination timeline.',
      '    b.  Improvement: Communication between language teams could be enhanced with dedicated radio nets. Recommend procurement of additional SINCGARS equipment.',
      '    c.  Improvement: Scenario injects should be developed further in advance to allow proper vetting by subject matter experts.',
      '7.  Recommendations.',
      '    a.  Continue semi-annual exercise schedule as specified in reference (a).',
      '    b.  Request funding for additional field communication equipment.',
      '    c.  Establish formal partnership with sister service linguist units for future joint exercises.',
      '8.  Point of contact is the Operations Officer at DSN 768-5432 or ops.mcddet@dli.mil.'
    ],
    signature: {
      name: 'J. M. MORGAN',
      rank: 'Major, U.S. Marine Corps',
      title: 'Commanding Officer'
    },
    copyTo: [
      'S-3',
      'Training NCO'
    ],
    sealPath: null
  }
};

// ============================================================================
// PDF GENERATION - Matches measurements from HTML generator
// ============================================================================

/**
 * Critical measurements from SECNAV M-5216.5
 * All measurements in points (72 points = 1 inch)
 */
const MEASUREMENTS = {
  page: {
    width: 612,      // 8.5 inches
    height: 792,     // 11 inches
    marginLeft: 72,  // 1 inch
    marginRight: 72, // 1 inch  
    marginTop: 72,   // 1 inch
    marginBottom: 72 // 1 inch
  },
  letterhead: {
    ssicFromTop: 72,           // 1 inch from top
    dateFromTop: 144,          // 2 inches from top (1 inch below SSIC)
    firstLineFromTop: 180      // 2.5 inches from top
  },
  text: {
    fontSize: 12,
    lineHeight: 14.4,          // 12pt * 1.2
    paragraphSpacing: 14.4,    // One blank line between paragraphs
    signatureGap: 43.2         // 3 blank lines (for signature)
  },
  continuation: {
    subjectFromTop: 72,        // 1 inch from top on continuation pages
    textStart: 108             // Below subject on continuation
  }
};

/**
 * Generate PDF for a naval letter
 */
function generatePDF(letterData, outputPath) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: {
      top: MEASUREMENTS.page.marginTop,
      bottom: MEASUREMENTS.page.marginBottom,
      left: MEASUREMENTS.page.marginLeft,
      right: MEASUREMENTS.page.marginRight
    },
    bufferPages: true
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Set default font
  doc.font('Times-Roman').fontSize(MEASUREMENTS.text.fontSize);

  let currentY = MEASUREMENTS.letterhead.ssicFromTop;
  let pageNum = 1;
  const contentWidth = MEASUREMENTS.page.width - MEASUREMENTS.page.marginLeft - MEASUREMENTS.page.marginRight;

  // === PAGE 1: LETTERHEAD FORMAT ===
  
  // SSIC and Serial Number (flush left)
  let ssicLine = letterData.ssic;
  if (letterData.serialNumber) {
    ssicLine += `\n${letterData.serialNumber}`;
  }
  doc.text(ssicLine, MEASUREMENTS.page.marginLeft, currentY);

  // Date (flush right, 2 inches from top)
  doc.text(letterData.date, MEASUREMENTS.page.marginLeft, MEASUREMENTS.letterhead.dateFromTop, {
    width: contentWidth,
    align: 'right'
  });

  // Start content at 2.5 inches from top
  currentY = MEASUREMENTS.letterhead.firstLineFromTop;

  // From line
  doc.text(`From:  ${letterData.fromLine}`, MEASUREMENTS.page.marginLeft, currentY);
  currentY += MEASUREMENTS.text.lineHeight;

  // To line
  doc.text(`To:    ${letterData.toLine}`, MEASUREMENTS.page.marginLeft, currentY);
  currentY += MEASUREMENTS.text.lineHeight;

  // Via lines (if any)
  if (letterData.viaLines && letterData.viaLines.length > 0) {
    letterData.viaLines.forEach((via, index) => {
      const prefix = index === 0 ? 'Via:   ' : '       ';
      const suffix = index < letterData.viaLines.length - 1 ? ' (SYMBOL)' : '';
      doc.text(`${prefix}(${index + 1}) ${via}${suffix}`, MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.lineHeight;
    });
  }

  // Blank line before Subject
  currentY += MEASUREMENTS.text.paragraphSpacing;

  // Subject line
  doc.text(`Subj:  ${letterData.subjectLine}`, MEASUREMENTS.page.marginLeft, currentY, {
    width: contentWidth
  });
  currentY = doc.y + MEASUREMENTS.text.paragraphSpacing;

  // References (if any)
  if (letterData.references && letterData.references.length > 0) {
    letterData.references.forEach((ref, index) => {
      const prefix = index === 0 ? 'Ref:   ' : '       ';
      doc.text(`${prefix}${ref}`, MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.lineHeight;
    });
    currentY += MEASUREMENTS.text.paragraphSpacing;
  }

  // Enclosures (if any)
  if (letterData.enclosures && letterData.enclosures.length > 0) {
    letterData.enclosures.forEach((encl, index) => {
      const prefix = index === 0 ? 'Encl:  ' : '       ';
      doc.text(`${prefix}${encl}`, MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.lineHeight;
    });
    currentY += MEASUREMENTS.text.paragraphSpacing;
  }

  // Body paragraphs
  letterData.paragraphs.forEach((para, index) => {
    // Check if we need a new page
    const paraHeight = doc.heightOfString(para, { width: contentWidth });
    if (currentY + paraHeight > MEASUREMENTS.page.height - MEASUREMENTS.page.marginBottom - 100) {
      // Add continuation page
      doc.addPage();
      pageNum++;
      
      // Continuation page header: Subject and page number
      doc.text(`Subj:  ${letterData.subjectLine}`, MEASUREMENTS.page.marginLeft, MEASUREMENTS.continuation.subjectFromTop, {
        width: contentWidth
      });
      currentY = doc.y + MEASUREMENTS.text.paragraphSpacing;
    }

    doc.text(para, MEASUREMENTS.page.marginLeft, currentY, {
      width: contentWidth,
      lineGap: 2
    });
    currentY = doc.y + MEASUREMENTS.text.paragraphSpacing;
  });

  // Signature block (right-aligned, 3 blank lines above)
  currentY += MEASUREMENTS.text.signatureGap;
  
  const signatureX = MEASUREMENTS.page.width / 2; // Center of page, signature extends right
  
  doc.text(letterData.signature.name, signatureX, currentY);
  currentY += MEASUREMENTS.text.lineHeight;
  doc.text(letterData.signature.rank, signatureX, currentY);
  if (letterData.signature.title) {
    currentY += MEASUREMENTS.text.lineHeight;
    doc.text(letterData.signature.title, signatureX, currentY);
  }

  // Copy to (if any)
  if (letterData.copyTo && letterData.copyTo.length > 0) {
    currentY += MEASUREMENTS.text.paragraphSpacing * 2;
    doc.text('Copy to:', MEASUREMENTS.page.marginLeft, currentY);
    currentY += MEASUREMENTS.text.lineHeight;
    letterData.copyTo.forEach(copy => {
      doc.text(copy, MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.lineHeight;
    });
  }

  // === ENDORSEMENTS (if any) ===
  if (letterData.endorsements && letterData.endorsements.length > 0) {
    letterData.endorsements.forEach(endorsement => {
      doc.addPage();
      currentY = MEASUREMENTS.page.marginTop;

      // Endorsement header
      doc.font('Times-Bold').text(endorsement.number + ' on', MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.lineHeight;
      doc.font('Times-Roman');
      
      // Original letter reference
      doc.text(`${letterData.fromLine} ltr ${letterData.ssic}${letterData.serialNumber ? ' Ser ' + letterData.serialNumber : ''} of ${letterData.date}`, 
        MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.paragraphSpacing * 2;

      // Endorsement From/To/Date
      doc.text(`From:  ${endorsement.fromLine}`, MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.lineHeight;
      doc.text(`To:    ${endorsement.toLine}`, MEASUREMENTS.page.marginLeft, currentY);
      currentY += MEASUREMENTS.text.paragraphSpacing;

      // Endorsement body
      endorsement.paragraphs.forEach(para => {
        doc.text(para, MEASUREMENTS.page.marginLeft, currentY, { width: contentWidth });
        currentY = doc.y + MEASUREMENTS.text.paragraphSpacing;
      });

      // Endorsement signature
      currentY += MEASUREMENTS.text.signatureGap;
      doc.text(endorsement.signature.name, signatureX, currentY);
      currentY += MEASUREMENTS.text.lineHeight;
      doc.text(endorsement.signature.rank, signatureX, currentY);
      if (endorsement.signature.title) {
        currentY += MEASUREMENTS.text.lineHeight;
        doc.text(endorsement.signature.title, signatureX, currentY);
      }
    });
  }

  doc.end();
  
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// ============================================================================
// MAIN - Generate all examples
// ============================================================================

async function main() {
  const outputDir = path.join(__dirname, 'examples');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Naval Letter Example Generator');
  console.log('==============================\n');

  for (const [name, data] of Object.entries(EXAMPLE_LETTERS)) {
    const outputPath = path.join(outputDir, `example_${name}.pdf`);
    console.log(`Generating: ${name}...`);
    
    try {
      await generatePDF(data, outputPath);
      console.log(`  ✓ Created: ${outputPath}`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
    }
  }

  // Also export the sample data as JSON for reference
  const jsonPath = path.join(outputDir, 'sample_data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(EXAMPLE_LETTERS, null, 2));
  console.log(`\n✓ Sample data exported to: ${jsonPath}`);

  console.log('\n==============================');
  console.log('Generation complete!');
  console.log('\nUse these PDFs to verify your HTML generator produces matching output.');
  console.log('The sample_data.json can be used to populate the web form for comparison.');
}

main().catch(console.error);
