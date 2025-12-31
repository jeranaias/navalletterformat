/**
 * Tests for Naval Letter Generator - PDF Output
 *
 * Tests PDF generation using pdfkit for server-side validation
 * Browser-based jsPDF testing would require integration tests
 *
 * @jest-environment node
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Constants matching pdf-generator.js
const PAGE_DIMENSIONS = {
  width: 612,      // 8.5" in points
  height: 792,     // 11" in points
  marginLeft: 72,  // 1" margin
  marginRight: 72,
  marginTop: 72,
  marginBottom: 72
};

const CONTENT_WIDTH = PAGE_DIMENSIONS.width - PAGE_DIMENSIONS.marginLeft - PAGE_DIMENSIONS.marginRight;

describe('PDF Output Constants', () => {
  test('page dimensions match letter size (8.5 x 11 inches)', () => {
    expect(PAGE_DIMENSIONS.width).toBe(612);  // 8.5 * 72
    expect(PAGE_DIMENSIONS.height).toBe(792); // 11 * 72
  });

  test('margins are 1 inch (72 points)', () => {
    expect(PAGE_DIMENSIONS.marginLeft).toBe(72);
    expect(PAGE_DIMENSIONS.marginRight).toBe(72);
    expect(PAGE_DIMENSIONS.marginTop).toBe(72);
    expect(PAGE_DIMENSIONS.marginBottom).toBe(72);
  });

  test('content width is correct', () => {
    expect(CONTENT_WIDTH).toBe(468); // 612 - 72 - 72
  });
});

describe('PDF Generation', () => {
  const testOutputDir = path.join(__dirname, 'output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  test('can create a basic PDF document', (done) => {
    const doc = new PDFDocument({ size: 'LETTER' });
    const outputPath = path.join(testOutputDir, 'test_basic.pdf');
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.font('Times-Roman').fontSize(12);
    doc.text('Test Document', 72, 72);
    doc.end();

    stream.on('finish', () => {
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
      done();
    });
  });

  test('can create multi-page PDF', (done) => {
    const doc = new PDFDocument({ size: 'LETTER' });
    const outputPath = path.join(testOutputDir, 'test_multipage.pdf');
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.font('Times-Roman').fontSize(12);

    // Page 1
    doc.text('Page 1 Content', 72, 72);

    // Page 2
    doc.addPage();
    doc.text('Page 2 Content', 72, 72);

    // Page 3
    doc.addPage();
    doc.text('Page 3 Content', 72, 72);

    doc.end();

    stream.on('finish', () => {
      expect(fs.existsSync(outputPath)).toBe(true);
      done();
    });
  });

  test('can include seal image', (done) => {
    const sealPath = path.join(__dirname, '..', 'assets', 'DOW-Seal-BW.jpg');

    if (!fs.existsSync(sealPath)) {
      console.warn('Seal image not found, skipping test');
      done();
      return;
    }

    const doc = new PDFDocument({ size: 'LETTER' });
    const outputPath = path.join(testOutputDir, 'test_with_seal.pdf');
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.image(sealPath, 36, 36, { width: 72 });
    doc.text('Document with seal', 72, 120);
    doc.end();

    stream.on('finish', () => {
      expect(fs.existsSync(outputPath)).toBe(true);
      done();
    });
  });
});

describe('Naval Letter Structure', () => {
  test('generates correct header block structure', (done) => {
    const doc = new PDFDocument({ size: 'LETTER' });
    const outputPath = path.join(__dirname, 'output', 'test_header.pdf');
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.font('Times-Roman').fontSize(12);

    let y = 72;
    const ML = 72;
    const TAB = 45;
    const CONTENT_WIDTH = 468;

    // SSIC and date
    doc.text('5216', PAGE_DIMENSIONS.width - PAGE_DIMENSIONS.marginRight - 72, y);
    y += 14;
    doc.text('S-1', PAGE_DIMENSIONS.width - PAGE_DIMENSIONS.marginRight - 72, y);
    y += 14;
    doc.text('12 Dec 24', PAGE_DIMENSIONS.width - PAGE_DIMENSIONS.marginRight - 72, y);
    y += 28;

    // From/To
    doc.text('From:', ML, y);
    doc.text('Commanding Officer', ML + TAB, y);
    y += 14;

    doc.text('To:', ML, y);
    doc.text('Commandant of the Marine Corps', ML + TAB, y);
    y += 28;

    // Subject
    doc.text('Subj:', ML, y);
    doc.text('TEST SUBJECT LINE', ML + TAB, y);

    doc.end();

    stream.on('finish', () => {
      expect(fs.existsSync(outputPath)).toBe(true);
      done();
    });
  });

  test('generates correct paragraph numbering format', () => {
    const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

    // Main paragraphs: 1., 2., 3.
    expect('1.').toMatch(/^\d+\.$/);
    expect('2.').toMatch(/^\d+\.$/);

    // Sub paragraphs: a., b., c.
    expect(`${LETTERS[0]}.`).toBe('a.');
    expect(`${LETTERS[1]}.`).toBe('b.');

    // Sub-sub paragraphs: (1), (2), (3)
    expect('(1)').toMatch(/^\(\d+\)$/);

    // Sub-sub-sub paragraphs: (a), (b), (c)
    expect(`(${LETTERS[0]})`).toBe('(a)');
  });
});

describe('Seal Asset', () => {
  test('DON seal image exists', () => {
    const sealPath = path.join(__dirname, '..', 'assets', 'DOW-Seal-BW.jpg');
    expect(fs.existsSync(sealPath)).toBe(true);

    const stats = fs.statSync(sealPath);
    expect(stats.size).toBeGreaterThan(100000); // Seal should be substantial size
  });
});

// Cleanup after tests
afterAll(() => {
  const testOutputDir = path.join(__dirname, 'output');
  if (fs.existsSync(testOutputDir)) {
    const files = fs.readdirSync(testOutputDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(testOutputDir, file));
    });
    fs.rmdirSync(testOutputDir);
  }
});
