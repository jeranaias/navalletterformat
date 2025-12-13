#!/usr/bin/env node
/**
 * Generate a 3-page example naval letter PDF for showcase
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Page measurements (72 points = 1 inch)
const PAGE = {
  width: 612,      // 8.5"
  height: 792,     // 11"
  marginLeft: 72,  // 1"
  marginRight: 72, // 1"
  marginTop: 72,   // 1"
  marginBottom: 72 // 1"
};

const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight;

// Create PDF
const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: PAGE.marginTop, bottom: PAGE.marginBottom, left: PAGE.marginLeft, right: PAGE.marginRight },
  bufferPages: true,
  info: {
    Title: 'Naval Letter Example - 3 Page Showcase',
    Author: 'Naval Letter Generator v2.0',
    Subject: 'SECNAV M-5216.5 Compliant Correspondence'
  }
});

const outputPath = path.join(__dirname, 'example_3page_letter.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Load seal
const sealPath = path.join(__dirname, 'assets', 'DOW-Seal-BW.jpg');
const hasSeal = fs.existsSync(sealPath);

// ============================================================================
// PAGE 1 - Letterhead with full header
// ============================================================================

let y = PAGE.marginTop;

// DON Seal (top right)
if (hasSeal) {
  doc.image(sealPath, PAGE.width - PAGE.marginRight - 72, PAGE.marginTop - 20, { width: 72 });
}

// Letterhead
doc.font('Helvetica-Bold').fontSize(10);
doc.text('UNITED STATES MARINE CORPS', PAGE.marginLeft, y, { width: CONTENT_WIDTH, align: 'center' });
y += 12;

doc.font('Helvetica').fontSize(8);
doc.text('MARINE CORPS DETACHMENT', PAGE.marginLeft, y, { width: CONTENT_WIDTH, align: 'center' });
y += 10;
doc.text('DEFENSE LANGUAGE INSTITUTE', PAGE.marginLeft, y, { width: CONTENT_WIDTH, align: 'center' });
y += 10;
doc.text('PRESIDIO OF MONTEREY, CA 93944-5006', PAGE.marginLeft, y, { width: CONTENT_WIDTH, align: 'center' });
y += 24;

// SSIC and date block
doc.font('Times-Roman').fontSize(12);
doc.text('5216', PAGE.marginLeft, y);
doc.text('S-1', PAGE.marginLeft, y + 14);
doc.text('12 Dec 24', PAGE.marginLeft, y, { width: CONTENT_WIDTH, align: 'right' });
y += 36;

// From/To/Via
doc.text('From:  Commanding Officer, Marine Corps Detachment', PAGE.marginLeft, y);
y += 14;
doc.text('To:    Commandant of the Marine Corps (MMEA-25)', PAGE.marginLeft, y);
y += 14;
doc.text('Via:   (1) Commanding General, Training and Education Command', PAGE.marginLeft, y);
y += 14;
doc.text('       (2) Director, Marine Corps Distance Learning Program', PAGE.marginLeft, y);
y += 24;

// Subject
doc.text('Subj:  AFTER ACTION REPORT FOR TRAINING EXERCISE DESERT LINGUIST 24-02', PAGE.marginLeft, y, { width: CONTENT_WIDTH });
y = doc.y + 14;

// References
doc.text('Ref:   (a) DLIFLC Order 3500.1B', PAGE.marginLeft, y);
y += 14;
doc.text('       (b) MCO 3500.27C', PAGE.marginLeft, y);
y += 14;
doc.text('       (c) MCDP 1-0', PAGE.marginLeft, y);
y += 14;
doc.text('       (d) SECNAV M-5216.5', PAGE.marginLeft, y);
y += 24;

// Enclosures
doc.text('Encl:  (1) Exercise Timeline and Schedule', PAGE.marginLeft, y);
y += 14;
doc.text('       (2) Participant Roster', PAGE.marginLeft, y);
y += 14;
doc.text('       (3) Lessons Learned Database Extract', PAGE.marginLeft, y);
y += 14;
doc.text('       (4) Photographs', PAGE.marginLeft, y);
y += 14;
doc.text('       (5) Budget Expenditure Report', PAGE.marginLeft, y);
y += 24;

// Body paragraphs
const paragraphs = [
  '1.  Purpose.  Per references (a) through (d), this report documents the planning, execution, and results of Training Exercise DESERT LINGUIST 24-02, conducted 15-22 November 2024 at the Presidio of Monterey and Fort Hunter Liggett training areas.',

  '2.  Background.  The Marine Corps Detachment at Defense Language Institute Foreign Language Center is required to conduct semi-annual field training exercises to maintain operational readiness and validate language proficiency in austere field environments. This exercise represented the culmination of six months of planning and coordination with multiple agencies.',

  '3.  Participants.  A total of 47 Marines participated in the exercise, organized into four language teams:',

  '    a.  Arabic Team: 12 Marines (8 students, 4 instructors)',
  '    b.  Russian Team: 15 Marines (11 students, 4 instructors)',
  '    c.  Chinese-Mandarin Team: 8 Marines (6 students, 2 instructors)',
  '    d.  Support Element: 12 Marines (communications, logistics, medical)',

  '4.  Execution Summary.',

  '    a.  Phase I (15-17 November).  Initial deployment and establishment of forward operating base at Training Area 12, Fort Hunter Liggett. Language teams conducted pattern of life analysis using simulated intelligence scenarios. Role players from the Presidio language schools provided realistic cultural immersion opportunities.',
];

paragraphs.forEach(para => {
  doc.text(para, PAGE.marginLeft, y, { width: CONTENT_WIDTH, lineGap: 2 });
  y = doc.y + 12;
});

// ============================================================================
// PAGE 2 - Continuation
// ============================================================================

doc.addPage();
y = PAGE.marginTop;

// Continuation header
doc.text('Subj:  AFTER ACTION REPORT FOR TRAINING EXERCISE DESERT LINGUIST 24-02', PAGE.marginLeft, y, { width: CONTENT_WIDTH });
y = doc.y + 24;

const page2Paragraphs = [
  '    b.  Phase II (18-20 November).  Full mission profiles including tactical questioning, document exploitation, and real-time reporting exercises. Teams rotated through all training stations on four-hour cycles. Night operations tested equipment functionality and operator proficiency under limited visibility conditions.',

  '    c.  Phase III (21-22 November).  Culminating exercise involving multi-language operations, joint debriefing procedures, and integration with Navy and Army linguist units from the Naval Postgraduate School and Presidio language training programs.',

  '5.  Results and Metrics.',

  '    a.  Proficiency Standards.  All 25 student participants met or exceeded minimum proficiency standards as measured by field-expedient language assessments.',

  '    b.  DLPT Improvement.  Post-exercise diagnostic testing indicated an average Defense Language Proficiency Test improvement of 0.3 points across all language categories.',

  '    c.  Notable Achievements.',

  '        (1) Three Marines achieved Interagency Language Roundtable 3/3 proficiency for the first time during this exercise.',

  '        (2) Arabic Team completed 47 successful tactical questioning scenarios with zero critical errors.',

  '        (3) Russian Team processed 23 simulated captured documents with 94% accuracy rate.',

  '    d.  Safety Record.  Zero safety incidents, injuries, or equipment losses were reported during the entire exercise period.',

  '6.  Lessons Learned.',

  '    a.  Sustainments.',

  '        (1) Early coordination with Range Control (30+ days) proved essential for securing training areas during peak usage periods. Recommend maintaining this timeline for future exercises.',

  '        (2) Integration of role players from sister service language programs enhanced realism and provided valuable cross-cultural training opportunities.',

  '        (3) Use of commercial off-the-shelf translation technology as a training aid improved student confidence in high-pressure scenarios.',
];

page2Paragraphs.forEach(para => {
  doc.text(para, PAGE.marginLeft, y, { width: CONTENT_WIDTH, lineGap: 2 });
  y = doc.y + 12;
});

// ============================================================================
// PAGE 3 - Continuation with Signature
// ============================================================================

doc.addPage();
y = PAGE.marginTop;

// Continuation header
doc.text('Subj:  AFTER ACTION REPORT FOR TRAINING EXERCISE DESERT LINGUIST 24-02', PAGE.marginLeft, y, { width: CONTENT_WIDTH });
y = doc.y + 24;

const page3Paragraphs = [
  '    b.  Areas for Improvement.',

  '        (1) Communication between language teams could be enhanced with dedicated radio nets. Current shared frequency plan created occasional congestion during peak activity periods.',

  '        (2) Scenario injects should be developed further in advance to allow proper vetting by subject matter experts and coordination with role player schedules.',

  '        (3) Transportation assets were limited during Phase II. Recommend requesting additional vehicles or coordinating with installation motor pool earlier in planning process.',

  '7.  Recommendations.',

  '    a.  Continue semi-annual exercise schedule as specified in reference (a) to maintain operational readiness and language proficiency.',

  '    b.  Request funding in FY25 budget for additional field communication equipment, specifically four additional AN/PRC-152 radios for dedicated team nets.',

  '    c.  Establish formal memorandum of agreement with Naval Postgraduate School for recurring joint exercise support and role player integration.',

  '    d.  Develop standardized exercise scenario database to reduce planning burden and ensure consistent training objectives across exercise iterations.',

  '8.  Resource Expenditure.  Total exercise cost was $47,234.00, which was $2,766.00 under the allocated budget of $50,000.00. Detailed breakdown is provided in enclosure (5).',

  '9.  Point of contact for this matter is the Operations Officer, Captain J. A. Smith, at DSN 768-5432 or commercial (831) 242-5432, email: operations.mcddet@dli.mil.',
];

page3Paragraphs.forEach(para => {
  doc.text(para, PAGE.marginLeft, y, { width: CONTENT_WIDTH, lineGap: 2 });
  y = doc.y + 12;
});

// Signature block (3 blank lines, then signature at center)
y += 36;
const sigX = PAGE.width / 2;
doc.text('J. M. MORGAN', sigX, y);
y += 14;
doc.text('Major, U.S. Marine Corps', sigX, y);
y += 14;
doc.text('Commanding Officer', sigX, y);
y += 28;

// Copy to
doc.text('Copy to:', PAGE.marginLeft, y);
y += 14;
doc.text('S-3', PAGE.marginLeft, y);
y += 14;
doc.text('Training NCO', PAGE.marginLeft, y);
y += 14;
doc.text('Operations Files', PAGE.marginLeft, y);

// Finalize
doc.end();

stream.on('finish', () => {
  console.log('Generated 3-page example PDF:', outputPath);
  console.log('');
  console.log('Contents:');
  console.log('  Page 1: Letterhead, From/To/Via, Subject, Refs, Encls, Body start');
  console.log('  Page 2: Continuation with results and lessons learned');
  console.log('  Page 3: Recommendations, signature block, copy to');
});
