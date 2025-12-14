# Changelog

All notable changes to the Naval Letter Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - Unreleased (v3 branch)

### Added
- **Live preview pane** (`js/preview-manager.js`)
  - Real-time PDF preview as you type
  - Split-screen layout with form on left, preview on right
  - Toggle button to show/hide preview pane
  - Debounced updates (500ms) for smooth performance
  - Remembers preference in localStorage
- **Template library** (`js/template-manager.js`, `data/templates.json`)
  - 12 pre-built templates for common letter types
  - Leave Request, Request Mast, Award Recommendation (NAM)
  - Letter of Appreciation, Page 11 Entry Request
  - Counseling (Positive and Corrective)
  - Endorsement (Recommend Approval/Disapproval)
  - Request for Orders Modification, Transfer Information
  - Report of Findings
  - Searchable modal with category filter
  - One-click template application
- **Undo/redo for paragraphs** (`js/undo-manager.js`)
  - Full edit history with up to 50 undo states
  - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo)
  - Undo/redo buttons in paragraph section header
  - Tracks paragraph additions, deletions, reordering, and text changes
- **CUI/FOUO portion markings**
  - Per-paragraph classification marking per DoDM 5200.01
  - Portion marking selector: (U), (CUI), (FOUO)
  - Checkbox to enable/disable portion marking
  - Portion marks appear in PDF output before paragraph labels

### Planned Features - High Effort
- **Import from Word/PDF** - Parse existing correspondence documents
- **Multi-letter batch generation** - Generate multiple letters from spreadsheet data
- **Collaboration/sharing** - Share drafts with others (requires backend infrastructure)

---

## [2.0.0] - Unreleased (v2 branch)

### Added
- **Draft save/load functionality** (`js/draft-manager.js`)
  - Auto-saves to localStorage every 2 seconds (debounced)
  - Prompts to restore saved draft on page load
  - "Save Draft" button exports a `.json` file
  - "Load Draft" button imports saved drafts
  - Supports all form fields including paragraphs with subjects
- **Explicit paragraph subject fields**
  - Optional subject input for top-level paragraphs (1., 2., etc.)
  - Subject text is underlined in output (PDF and LaTeX)
  - Replaces previous auto-detection of first sentence
- **Automatic double spacing after periods**
  - Military correspondence standard enforced automatically
  - `ensureDoubleSpaces()` utility function in `js/utils.js`
- **Modular JavaScript architecture**
  - `js/utils.js` - Common helper functions (escapeLatex, formatDateValue, etc.)
  - `js/data-manager.js` - SSIC and unit search with external JSON loading
  - `js/form-handler.js` - Form state, dynamic lists, paragraphs, drag-drop
  - `js/latex-generator.js` - LaTeX document generation
  - `js/pdf-generator.js` - PDF generation with jsPDF
  - `js/draft-manager.js` - Draft auto-save, export, and import
  - `js/app.js` - Application initialization
- External CSS file (`css/styles.css`)
- Comprehensive SSIC database (2,240 codes from SECNAV M-5210.2 August 2018)
- Comprehensive unit database (230 USMC/USN/DOD units with addresses)
- Build script (`build.js`) for creating single-file bundled version
- Auto-loading DON seal from `assets/DOW-Seal-BW.jpg` (no upload needed)
- Jest testing infrastructure with 111 unit tests
- Example PDF generator for testing (`testing/generate_examples.js`)
- Test draft files for QA (`testing/drafts/`)
- **Memorandum document type**
  - New document type option alongside Basic Letter and Endorsement
  - Centered "MEMORANDUM" header
  - Letterhead section hidden for memoranda
- **Dark mode**
  - Theme toggle button in header (sun/moon icon)
  - Respects system preference (`prefers-color-scheme`) on first visit
  - Saves preference to localStorage
  - Full dark theme with inverted color scheme
- **Print button**
  - "Print" button next to "Download PDF"
  - Opens PDF in new browser tab with print dialog
  - Uses same PDF generation logic as download
- **Accessibility improvements**
  - Skip to main content link
  - ARIA labels on all form elements
  - Role attributes for screen readers (form, radiogroup, banner, main, contentinfo)
  - Keyboard navigation for document type selector (Tab, Enter/Space)
  - Focus-visible outlines for keyboard users
  - Respects `prefers-reduced-motion` for animations
- **PWA support (Progressive Web App)**
  - Web manifest (`manifest.json`) for installability
  - Service worker (`sw.js`) for offline caching
  - App can be installed to home screen on mobile/desktop
  - SVG icons (192px, 512px) with NL branding
- **Keyboard shortcuts**
  - `Ctrl+S` / `Cmd+S` - Export draft to file
  - `Ctrl+P` / `Cmd+P` - Print PDF
  - `Ctrl+D` / `Cmd+D` - Download PDF
  - `Escape` - Close preview/modals
- **Offline indicator**
  - Shows service worker status in header
  - Green dot when ready for offline use
  - Red dot when offline or online-only
- **Formal memo option**
  - Checkbox to use letterhead on memorandums (Letterhead Memorandum per Figure 10-4)
  - Plain-paper memo (default) vs formal letterhead memo
- **Classification marking fix**
  - Classification now appears at very top of page (y=18) per DoD 5200.01
  - Does not push down letterhead

### Changed
- Refactored monolithic `index.html` (2,186 lines) into modular structure
- Seal is now automatically included on letterhead (removed manual upload)
- Build output now embeds seal as base64 for fully offline use
- Removed letterhead toggle (letterhead is always included)
- Paragraph label spacing changed from double to single space after labels (1., a., (1), (a))
- Dynamic label width calculation for consistent spacing across all paragraph levels

### Fixed
- **Unit selection letterhead**: Service/Organization now shows full name (e.g., "UNITED STATES MARINE CORPS") instead of abbreviation ("USMC")
- **Seal description**: Changed "Department of the Navy seal" to "Department of War seal"
  - The auto-included seal is the historical Department of War seal, not the Navy seal
- **escapeLatex()**: Fixed double-escaping of curly braces in `\textbackslash{}`
  - Issue: Backslash was replaced with `\textbackslash{}`, then `{` and `}` were escaped again
  - Solution: Use placeholder approach to escape backslash last
- **formatDateValue()**: Fixed incorrect day parsing for "DD Mon YYYY" format
  - Issue: "25 Dec 2024" was parsed as December 20 instead of December 25
  - Cause: Regex matched "dec 2024" with day="20" and year="24" due to missing separator requirements
  - Solution: Require whitespace/comma separators between date parts
- **Paragraph label spacing**: Fixed inconsistent spacing after labels (was 12-18pt varying)
  - Now uses dynamic label width calculation with consistent 4pt gap
- **Paragraph subject margins**: Subject text and underline now properly constrained within page margins
  - Long subjects are truncated with ellipsis if they would exceed right margin

## [1.3.0] - 2024-12-12

### Added
- Initial public release on GitHub Pages
- Basic naval letter generation (standard letter and endorsement formats)
- LaTeX (.tex) and PDF output
- Overleaf integration (direct open and ZIP upload)
- SSIC search functionality
- Unit search functionality
- Classification markings support
- Multi-level paragraph support (1., a., (1), (a))
- Via addressees with automatic numbering
- References and enclosures lists
- Copy-to distribution list
- "By direction" signature option

### Fixed
- Sender's symbols alignment (SSIC, office code, date left-align under first character)
- Via numbering only when multiple addressees
- Paragraph text wrap to page margin
- Signature block format (name only, removed rank/title)

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 3.0.0   | TBD  | Live preview pane, template library (12 templates), undo/redo, CUI/FOUO portion markings |
| 2.0.0   | TBD  | Modular architecture, draft save/load, memorandum, dark mode, PWA, keyboard shortcuts, 111 tests |
| 1.3.0   | Dec 2024 | Initial GitHub Pages release |
