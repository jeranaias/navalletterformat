# Changelog

All notable changes to the Naval Letter Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Jest testing infrastructure with 67 unit tests
- Example PDF generator for testing (`testing/generate_examples.js`)
- Test draft files for QA (`testing/drafts/`)

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
| 2.0.0   | TBD  | Modular architecture, draft save/load, auto-seal, explicit paragraph subjects, comprehensive data, 67 tests |
| 1.3.0   | Dec 2024 | Initial GitHub Pages release |
