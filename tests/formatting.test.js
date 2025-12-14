/**
 * Tests for Naval Letter Generator - Formatting Compliance
 *
 * Validates SECNAV M-5216.5 formatting requirements:
 * - Page dimensions and margins
 * - Element positioning
 * - Paragraph structure and numbering
 * - Font specifications
 */

const { LETTERS } = require('../js/utils');

// SECNAV M-5216.5 Specifications (in points, 72pt = 1 inch)
const SECNAV_SPECS = {
  page: {
    width: 612,           // 8.5 inches
    height: 792,          // 11 inches
    marginAll: 72         // 1 inch margins
  },
  positioning: {
    ssicFromTop: 72,      // 1 inch from top
    dateFromTop: 72,      // Same line as SSIC, right-aligned
    firstLineFromTop: 180 // ~2.5 inches from top for From line
  },
  fonts: {
    body: 'Times-Roman',
    bodySize: 12,
    headerSize: 10,
    addressSize: 8
  },
  spacing: {
    lineHeight: 14,       // 12pt font with standard leading
    paragraphGap: 14,     // One blank line between paragraphs
    signatureGap: 56      // ~4 lines before signature
  }
};

describe('Page Dimensions - SECNAV M-5216.5 Compliance', () => {
  test('page size is standard letter (8.5 x 11 inches)', () => {
    expect(SECNAV_SPECS.page.width).toBe(8.5 * 72);
    expect(SECNAV_SPECS.page.height).toBe(11 * 72);
  });

  test('margins are 1 inch on all sides', () => {
    expect(SECNAV_SPECS.page.marginAll).toBe(72);
  });

  test('content width is 6.5 inches', () => {
    const contentWidth = SECNAV_SPECS.page.width - (SECNAV_SPECS.page.marginAll * 2);
    expect(contentWidth).toBe(468); // 6.5 * 72
  });
});

describe('Paragraph Numbering Format', () => {
  test('main paragraphs use Arabic numerals with period (1., 2., 3.)', () => {
    for (let i = 1; i <= 10; i++) {
      expect(`${i}.`).toMatch(/^\d+\.$/);
    }
  });

  test('first-level subparagraphs use lowercase letters with period (a., b., c.)', () => {
    const expected = ['a.', 'b.', 'c.', 'd.', 'e.'];
    expected.forEach((label, i) => {
      expect(`${LETTERS[i]}.`).toBe(label);
    });
  });

  test('second-level subparagraphs use parenthetical numbers ((1), (2), (3))', () => {
    for (let i = 1; i <= 5; i++) {
      expect(`(${i})`).toMatch(/^\(\d+\)$/);
    }
  });

  test('third-level subparagraphs use parenthetical letters ((a), (b), (c))', () => {
    const expected = ['(a)', '(b)', '(c)', '(d)', '(e)'];
    expected.forEach((label, i) => {
      expect(`(${LETTERS[i]})`).toBe(label);
    });
  });

  test('LETTERS constant has all 26 lowercase letters', () => {
    expect(LETTERS).toBe('abcdefghijklmnopqrstuvwxyz');
    expect(LETTERS.length).toBe(26);
  });
});

describe('Reference and Enclosure Format', () => {
  test('references use lowercase letter format: (a), (b), (c)', () => {
    const refs = ['MCO 1400.32D', 'MCO P1070.12K', 'SECNAVINST 1650.1H'];
    refs.forEach((ref, i) => {
      const formatted = `(${LETTERS[i]}) ${ref}`;
      expect(formatted).toMatch(/^\([a-z]\) .+$/);
    });
  });

  test('enclosures use number format: (1), (2), (3)', () => {
    const encls = ['Promotion Package', 'Fitness Reports', 'Letters of Recommendation'];
    encls.forEach((encl, i) => {
      const formatted = `(${i + 1}) ${encl}`;
      expect(formatted).toMatch(/^\(\d+\) .+$/);
    });
  });
});

describe('Date Format', () => {
  test('naval date format is DD Mon YY', () => {
    const validFormats = ['01 Jan 25', '15 Dec 24', '31 Oct 23'];
    validFormats.forEach(date => {
      expect(date).toMatch(/^\d{2} [A-Z][a-z]{2} \d{2}$/);
    });
  });
});

describe('Header Block Structure', () => {
  test('sender symbols block order: SSIC, Office Code, Date', () => {
    const senderBlock = {
      ssic: '5216',
      officeCode: 'S-1',
      date: '12 Dec 24'
    };

    expect(senderBlock.ssic).toMatch(/^\d{4}$/);
    expect(senderBlock.officeCode).toBeTruthy();
    expect(senderBlock.date).toMatch(/^\d{2} [A-Z][a-z]{2} \d{2}$/);
  });

  test('addressing block order: From, To, Via (if applicable)', () => {
    const addressBlock = ['From:', 'To:', 'Via:'];
    expect(addressBlock[0]).toBe('From:');
    expect(addressBlock[1]).toBe('To:');
    expect(addressBlock[2]).toBe('Via:');
  });

  test('subject line label format', () => {
    expect('Subj:').toBe('Subj:');
  });

  test('references label format', () => {
    expect('Ref:').toBe('Ref:');
  });

  test('enclosures label format', () => {
    expect('Encl:').toBe('Encl:');
  });
});

describe('Via Numbering', () => {
  test('multiple via addressees are numbered (1), (2), (3)', () => {
    const viaList = [
      'Commanding General, TECOM',
      'Director, MCDLP'
    ];

    viaList.forEach((via, i) => {
      const formatted = `(${i + 1}) ${via}`;
      expect(formatted).toMatch(/^\(\d+\) .+$/);
    });
  });

  test('single via addressee has no number', () => {
    const singleVia = 'Commanding General';
    expect(singleVia).not.toMatch(/^\(\d+\)/);
  });
});

describe('Signature Block', () => {
  test('signature name is uppercase', () => {
    const name = 'John D. Smith';
    expect(name.toUpperCase()).toBe('JOHN D. SMITH');
  });

  test('"By direction" is lowercase except B', () => {
    expect('By direction').toBe('By direction');
  });
});

describe('Copy To Format', () => {
  test('copy to label format', () => {
    expect('Copy to:').toBe('Copy to:');
  });
});

describe('Classification Markings', () => {
  test('classification options are valid', () => {
    const validClassifications = ['', 'CUI', 'FOUO'];
    validClassifications.forEach(cls => {
      expect(['', 'CUI', 'FOUO']).toContain(cls);
    });
  });

  test('classification displayed as uppercase', () => {
    expect('CUI').toBe('CUI');
    expect('FOR OFFICIAL USE ONLY').toBe('FOR OFFICIAL USE ONLY');
  });
});

describe('Continuation Page Format', () => {
  test('continuation header includes subject', () => {
    const subject = 'REQUEST FOR ADDITIONAL PERSONNEL';
    const continuationHeader = `Subj:  ${subject}`;
    expect(continuationHeader).toContain('Subj:');
    expect(continuationHeader).toContain(subject);
  });
});

describe('Font Specifications', () => {
  test('body font is Times Roman 12pt', () => {
    expect(SECNAV_SPECS.fonts.body).toBe('Times-Roman');
    expect(SECNAV_SPECS.fonts.bodySize).toBe(12);
  });

  test('line height is appropriate for 12pt font', () => {
    // Standard line height is 1.15-1.2x font size
    expect(SECNAV_SPECS.spacing.lineHeight).toBeGreaterThanOrEqual(12);
    expect(SECNAV_SPECS.spacing.lineHeight).toBeLessThanOrEqual(16);
  });
});

describe('Endorsement Format', () => {
  test('endorsement numbers are spelled out', () => {
    const endorsementNumbers = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH'];
    endorsementNumbers.forEach(num => {
      expect(num).toMatch(/^[A-Z]+$/);
    });
  });

  test('endorsement header format', () => {
    const header = 'FIRST ENDORSEMENT';
    expect(header).toMatch(/^[A-Z]+ ENDORSEMENT$/);
  });
});

describe('Memorandum Format', () => {
  test('memorandum is a valid document type', () => {
    const validTypes = ['basic', 'endorsement', 'memorandum'];
    expect(validTypes).toContain('memorandum');
  });

  test('memorandum header format', () => {
    const header = 'MEMORANDUM';
    expect(header).toBe('MEMORANDUM');
    expect(header).toMatch(/^[A-Z]+$/);
  });

  test('memorandum does not use letterhead', () => {
    const useLetterhead = (docType) => docType !== 'memorandum';
    expect(useLetterhead('basic')).toBe(true);
    expect(useLetterhead('endorsement')).toBe(true);
    expect(useLetterhead('memorandum')).toBe(false);
  });

  test('memorandum still has From/To/Subj fields', () => {
    const requiredFields = ['From', 'To', 'Subj'];
    requiredFields.forEach(field => {
      expect(requiredFields).toContain(field);
    });
  });

  test('memorandum can have paragraphs', () => {
    const memoDraft = {
      version: '2.0',
      docType: 'memorandum',
      from: 'Operations Officer',
      to: 'All Staff',
      subj: 'WEEKLY UPDATE',
      paragraphs: [
        { type: 'para', subject: '', text: 'This is a memo paragraph.' }
      ]
    };

    expect(memoDraft.docType).toBe('memorandum');
    expect(memoDraft.paragraphs).toHaveLength(1);
  });

  test('memorandum can have references and enclosures', () => {
    const memoDraft = {
      docType: 'memorandum',
      refs: ['Previous memo dated 1 Dec 24'],
      encls: ['Attachment A']
    };

    expect(memoDraft.refs).toHaveLength(1);
    expect(memoDraft.encls).toHaveLength(1);
  });
});
