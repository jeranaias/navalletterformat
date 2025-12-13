# Changelog

All notable changes to the Naval Letter Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Modular JavaScript architecture (v2.0 refactor)
  - `js/utils.js` - Common helper functions
  - `js/data-manager.js` - SSIC and unit search with external JSON loading
  - `js/form-handler.js` - Form state, dynamic lists, paragraphs, drag-drop
  - `js/latex-generator.js` - LaTeX document generation
  - `js/pdf-generator.js` - PDF generation with jsPDF
  - `js/app.js` - Application initialization
- External CSS file (`css/styles.css`)
- Comprehensive SSIC database (2,240 codes from SECNAV M-5210.2 August 2018)
- Comprehensive unit database (230 USMC/USN/DOD units with addresses)
- Build script (`build.js`) for creating single-file bundled version
- Auto-loading DON seal from `assets/DOW-Seal-BW.jpg` (no upload needed)
- Jest testing infrastructure with 30 unit tests
- Example PDF generator for testing (`testing/testing/generate_examples.js`)

### Changed
- Refactored monolithic `index.html` (2,186 lines) into modular structure
- Seal is now automatically included on letterhead (removed manual upload)
- Build output now embeds seal as base64 for fully offline use

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

## [1.3.0] - 2024-12-XX

### Added
- Initial public release on GitHub Pages
- Basic naval letter generation
- LaTeX and PDF output
- Overleaf integration
- SSIC search functionality
- Unit search functionality

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 2.0.0   | TBD  | Modular architecture, auto-seal, comprehensive data, testing |
| 1.3.0   | 2024 | Initial GitHub Pages release |
