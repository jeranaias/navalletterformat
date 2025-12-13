/**
 * Tests for Naval Letter Generator - Utilities
 */

const { LETTERS, escapeLatex, formatDateValue, getTodayFormatted, generateFilename } = require('../js/utils');

describe('LETTERS constant', () => {
  test('should contain all lowercase letters', () => {
    expect(LETTERS).toBe('abcdefghijklmnopqrstuvwxyz');
    expect(LETTERS.length).toBe(26);
  });
});

describe('escapeLatex', () => {
  test('should return empty string for null/undefined', () => {
    expect(escapeLatex(null)).toBe('');
    expect(escapeLatex(undefined)).toBe('');
    expect(escapeLatex('')).toBe('');
  });

  test('should escape ampersand', () => {
    expect(escapeLatex('AT&T')).toBe('AT\\&T');
  });

  test('should escape percent', () => {
    expect(escapeLatex('100%')).toBe('100\\%');
  });

  test('should escape dollar sign', () => {
    expect(escapeLatex('$100')).toBe('\\$100');
  });

  test('should escape hash', () => {
    expect(escapeLatex('#1')).toBe('\\#1');
  });

  test('should escape underscore', () => {
    expect(escapeLatex('file_name')).toBe('file\\_name');
  });

  test('should escape curly braces', () => {
    expect(escapeLatex('{test}')).toBe('\\{test\\}');
  });

  test('should escape backslash', () => {
    expect(escapeLatex('path\\to\\file')).toBe('path\\textbackslash{}to\\textbackslash{}file');
  });

  test('should escape tilde', () => {
    expect(escapeLatex('~user')).toBe('\\textasciitilde{}user');
  });

  test('should escape caret', () => {
    expect(escapeLatex('2^10')).toBe('2\\textasciicircum{}10');
  });

  test('should handle multiple special characters', () => {
    expect(escapeLatex('Cost: $100 & 50%')).toBe('Cost: \\$100 \\& 50\\%');
  });

  test('should leave normal text unchanged', () => {
    expect(escapeLatex('Normal text here')).toBe('Normal text here');
  });
});

describe('formatDateValue', () => {
  test('should return null for empty input', () => {
    expect(formatDateValue(null)).toBeNull();
    expect(formatDateValue('')).toBeNull();
    expect(formatDateValue('   ')).toBeNull();
  });

  test('should parse MM/DD/YYYY format', () => {
    expect(formatDateValue('12/25/2024')).toBe('25 Dec 24');
    expect(formatDateValue('01/15/2025')).toBe('15 Jan 25');
  });

  test('should parse MM-DD-YYYY format', () => {
    expect(formatDateValue('12-25-2024')).toBe('25 Dec 24');
  });

  test('should parse MM/DD/YY format', () => {
    expect(formatDateValue('12/25/24')).toBe('25 Dec 24');
  });

  test('should parse YYYY-MM-DD format', () => {
    expect(formatDateValue('2024-12-25')).toBe('25 Dec 24');
  });

  test('should parse "Mon DD YYYY" format', () => {
    expect(formatDateValue('Dec 25 2024')).toBe('25 Dec 24');
    expect(formatDateValue('December 25, 2024')).toBe('25 Dec 24');
  });

  test('should parse "DD Mon YYYY" format', () => {
    expect(formatDateValue('25 Dec 2024')).toBe('25 Dec 24');
    expect(formatDateValue('25 December 2024')).toBe('25 Dec 24');
    expect(formatDateValue('1 Jan 2025')).toBe('01 Jan 25');
  });

  test('should handle "today" keyword', () => {
    const result = formatDateValue('today');
    expect(result).toMatch(/^\d{2} [A-Z][a-z]{2} \d{2}$/);
  });

  test('should handle case insensitivity', () => {
    expect(formatDateValue('DEC 25 2024')).toBe('25 Dec 24');
    expect(formatDateValue('DECEMBER 25, 2024')).toBe('25 Dec 24');
  });

  test('should return null for invalid dates', () => {
    expect(formatDateValue('not a date')).toBeNull();
    expect(formatDateValue('abc123')).toBeNull();
  });
});

describe('getTodayFormatted', () => {
  test('should return date in DD Mon YY format', () => {
    const result = getTodayFormatted();
    expect(result).toMatch(/^\d{2} [A-Z][a-z]{2} \d{2}$/);
  });

  test('should match current date', () => {
    const result = getTodayFormatted();
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const expected = `${String(today.getDate()).padStart(2, '0')} ${months[today.getMonth()]} ${String(today.getFullYear()).slice(-2)}`;
    expect(result).toBe(expected);
  });
});

describe('generateFilename', () => {
  test('should generate filename from subject', () => {
    expect(generateFilename('Request for Leave', 'pdf')).toBe('request_for_leave.pdf');
  });

  test('should handle special characters', () => {
    expect(generateFilename('Test & Report #1', 'pdf')).toBe('test_report_1.pdf');
  });

  test('should truncate long subjects', () => {
    const longSubject = 'This is a very long subject line that should be truncated to thirty characters';
    const result = generateFilename(longSubject, 'tex');
    expect(result.length).toBeLessThanOrEqual(34); // 30 chars + '.tex'
  });

  test('should return default filename for empty subject', () => {
    expect(generateFilename('', 'pdf')).toBe('naval_letter.pdf');
    expect(generateFilename(null, 'tex')).toBe('naval_letter.tex');
  });

  test('should handle different extensions', () => {
    expect(generateFilename('Test', 'pdf')).toBe('test.pdf');
    expect(generateFilename('Test', 'tex')).toBe('test.tex');
    expect(generateFilename('Test', 'zip')).toBe('test.zip');
  });
});
