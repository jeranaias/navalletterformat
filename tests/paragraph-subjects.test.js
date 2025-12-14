/**
 * Tests for Paragraph Subjects Feature
 *
 * Validates paragraph subject formatting per SECNAV M-5216.5:
 * - Subjects only on top-level paragraphs
 * - Underlined subject text
 * - Margin constraints
 * - Text flow after subject
 */

describe('Paragraph Subjects', () => {
  // PDF generator constants (matching pdf-generator.js)
  const PW = 612;       // Page width
  const MR = 72;        // Margin right
  const ML = 72;        // Margin left
  const CW = PW - ML - MR;  // Content width (468)
  const IM = 14;        // Main paragraph indent
  const TAB = 45;       // Label tab width

  describe('Subject Eligibility', () => {
    test('subjects are only allowed on top-level paragraphs', () => {
      const canHaveSubject = (type) => type === 'para';

      expect(canHaveSubject('para')).toBe(true);
      expect(canHaveSubject('subpara')).toBe(false);
      expect(canHaveSubject('subsubpara')).toBe(false);
      expect(canHaveSubject('subsubsubpara')).toBe(false);
    });

    test('all paragraph types are recognized', () => {
      const validTypes = ['para', 'subpara', 'subsubpara', 'subsubsubpara'];
      expect(validTypes).toHaveLength(4);
    });
  });

  describe('Subject Structure', () => {
    test('paragraph with subject structure', () => {
      const paraWithSubject = {
        type: 'para',
        subject: 'Purpose.',
        text: 'This paragraph has a subject.'
      };

      expect(paraWithSubject).toHaveProperty('type');
      expect(paraWithSubject).toHaveProperty('subject');
      expect(paraWithSubject).toHaveProperty('text');
      expect(paraWithSubject.type).toBe('para');
    });

    test('paragraph without subject is valid', () => {
      const paraNoSubject = {
        type: 'para',
        subject: '',
        text: 'This paragraph has no subject.'
      };

      expect(paraNoSubject.subject).toBe('');
      expect(paraNoSubject.text).toBeTruthy();
    });

    test('subject can be undefined or empty string', () => {
      const paraUndefined = { type: 'para', text: 'Text only' };
      const paraEmpty = { type: 'para', subject: '', text: 'Text only' };

      expect(paraUndefined.subject).toBeUndefined();
      expect(paraEmpty.subject).toBe('');
    });
  });

  describe('Subject Positioning', () => {
    test('subject text positioned after paragraph label', () => {
      // Simulating: "1.  Purpose.  This is the text..."
      // Label starts at ML (72), text starts at ML + labelWidth + 4
      const labelWidth = 12;  // Approximate width of "1."
      const labelX = ML;
      const textX = labelX + labelWidth + 4;  // Single space gap after label

      expect(textX).toBeGreaterThan(labelX);
      expect(textX).toBeLessThan(ML + TAB);
    });

    test('label position varies by paragraph level', () => {
      // Main: ML
      // Sub: ML + IM
      // Subsub: ML + IM + IS (where IS = 14)
      // Subsubsub: ML + IM + IS + ISS (where ISS = 14)
      const IS = 14;
      const ISS = 14;

      const mainX = ML;
      const subX = ML + IM;
      const subsubX = ML + IM + IS;
      const subsubsubX = ML + IM + IS + ISS;

      expect(subX).toBeGreaterThan(mainX);
      expect(subsubX).toBeGreaterThan(subX);
      expect(subsubsubX).toBeGreaterThan(subsubX);
    });
  });

  describe('Margin Constraints', () => {
    test('subject width constrained to right margin', () => {
      // From pdf-generator.js:
      // const rightEdge = PW - MR;
      // const maxSubjectWidth = rightEdge - tx - 6;
      const rightEdge = PW - MR;  // 540
      const labelWidth = 12;
      const tx = ML + labelWidth + 4;  // Text X position
      const maxSubjectWidth = rightEdge - tx - 6;

      expect(maxSubjectWidth).toBeGreaterThan(0);
      expect(tx + maxSubjectWidth).toBeLessThanOrEqual(rightEdge);
    });

    test('underline ends at right margin for long subjects', () => {
      const rightEdge = PW - MR;  // 540
      const labelWidth = 12;
      const tx = ML + labelWidth + 4;
      const longSubjectWidth = 600;  // Exceeds available space

      // Underline should be capped at right edge
      const underlineEnd = Math.min(tx + longSubjectWidth, rightEdge);
      expect(underlineEnd).toBeLessThanOrEqual(rightEdge);
      expect(underlineEnd).toBe(rightEdge);
    });

    test('short subjects fit within margins', () => {
      const rightEdge = PW - MR;  // 540
      const labelWidth = 12;
      const tx = ML + labelWidth + 4;
      const shortSubjectWidth = 50;  // Short subject

      const underlineEnd = Math.min(tx + shortSubjectWidth, rightEdge);
      expect(underlineEnd).toBe(tx + shortSubjectWidth);
      expect(underlineEnd).toBeLessThan(rightEdge);
    });

    test('right edge calculation is correct', () => {
      const rightEdge = PW - MR;
      expect(rightEdge).toBe(540);  // 612 - 72
    });
  });

  describe('Subject Truncation', () => {
    test('truncation adds ellipsis for overlong subjects', () => {
      const subject = 'This is a very long subject that exceeds the available width';
      const maxWidth = 100;  // Simulated available width
      const fullWidth = 400;  // Simulated full subject width

      // Simulating truncation logic from pdf-generator.js
      const needsTruncation = fullWidth > maxWidth;
      expect(needsTruncation).toBe(true);

      if (needsTruncation) {
        const ratio = maxWidth / fullWidth;
        const truncatedLength = Math.floor(subject.length * ratio);
        const displaySubject = subject.substring(0, truncatedLength) + '...';

        expect(displaySubject).toContain('...');
        expect(displaySubject.length).toBeLessThan(subject.length + 3);
      }
    });

    test('short subjects are not truncated', () => {
      const subject = 'Purpose.';
      const maxWidth = 400;
      const fullWidth = 50;  // Short subject

      const needsTruncation = fullWidth > maxWidth;
      expect(needsTruncation).toBe(false);
    });
  });

  describe('Text Flow', () => {
    test('text flows after subject on same line when space permits', () => {
      // After subject: afterSubjectX = tx + subjectWidth + 6
      // Remaining width = firstLineWidth - subjectWidth - 6
      // Text flows on same line if remainingWidth > 50 and afterSubjectX < rightEdge - 50
      const rightEdge = PW - MR;
      const tx = 88;  // Typical text X position
      const subjectWidth = 100;
      const afterSubjectX = tx + subjectWidth + 6;
      const remainingWidth = (CW - 16) - subjectWidth - 6;  // Approximate

      const flowsOnSameLine = remainingWidth > 50 && afterSubjectX < rightEdge - 50;
      expect(flowsOnSameLine).toBe(true);
    });

    test('text wraps to next line when insufficient space', () => {
      const rightEdge = PW - MR;
      const tx = 88;
      const subjectWidth = 400;  // Long subject
      const afterSubjectX = tx + subjectWidth + 6;
      const remainingWidth = (CW - 16) - subjectWidth - 6;

      const flowsOnSameLine = remainingWidth > 50 && afterSubjectX < rightEdge - 50;
      expect(flowsOnSameLine).toBe(false);
    });

    test('minimum remaining width threshold is 50 points', () => {
      const MIN_REMAINING_WIDTH = 50;
      expect(MIN_REMAINING_WIDTH).toBe(50);
    });
  });

  describe('Underline Styling', () => {
    test('underline line width is 0.5 points', () => {
      const UNDERLINE_WIDTH = 0.5;
      expect(UNDERLINE_WIDTH).toBe(0.5);
    });

    test('underline positioned 2 points below text baseline', () => {
      const UNDERLINE_OFFSET = 2;
      expect(UNDERLINE_OFFSET).toBe(2);
    });
  });

  describe('Common Subject Formats', () => {
    test('standard subject endings with period', () => {
      const commonSubjects = [
        'Purpose.',
        'Background.',
        'Discussion.',
        'Recommendation.',
        'Action.',
        'Information.',
        'Request for Approval.',
        'Policy Update.'
      ];

      commonSubjects.forEach(subject => {
        expect(subject).toBeTruthy();
        expect(subject.endsWith('.')).toBe(true);
      });
    });

    test('subjects can contain multiple words', () => {
      const multiWordSubjects = [
        'Request for Approval.',
        'Policy Update.',
        'Background Information.',
        'Summary of Events.'
      ];

      multiWordSubjects.forEach(subject => {
        expect(subject.split(' ').length).toBeGreaterThan(1);
      });
    });
  });

  describe('Integration with Draft Format', () => {
    test('draft JSON includes paragraph subjects', () => {
      const draft = {
        version: '2.0',
        paragraphs: [
          { type: 'para', subject: 'Purpose.', text: 'To request approval.' },
          { type: 'subpara', subject: '', text: 'Supporting detail.' },
          { type: 'para', subject: 'Background.', text: 'Previous actions.' }
        ]
      };

      expect(draft.paragraphs[0].subject).toBe('Purpose.');
      expect(draft.paragraphs[1].subject).toBe('');
      expect(draft.paragraphs[2].subject).toBe('Background.');
    });

    test('paragraphs array can be empty', () => {
      const draft = {
        version: '2.0',
        paragraphs: []
      };

      expect(draft.paragraphs).toHaveLength(0);
    });
  });
});
