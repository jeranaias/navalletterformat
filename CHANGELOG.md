# Changelog

All notable changes to the Naval Letter Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.1] - 2024-12-17

### Added
- **Rich Text Formatting in PDF Output**
  - Bold, italic, underline, and strikethrough now render in PDF preview and exports
  - New `parseHtmlToSegments()` function in `utils.js` parses HTML formatting
  - New `renderFormattedText()` function handles word-by-word rendering with formatting
  - Supports mixed formatting within paragraphs (e.g., "This is **bold** and *italic*")

- **Bundled Libraries for Offline Support**
  - jsPDF, mammoth.js, docx.js, and JSZip now bundled locally in `lib/` folder
  - Application works fully offline after initial page load
  - No CDN dependencies required

### Fixed
- **Sub-paragraph alignment** - Adjusted IM indent value (14→15) so sub-paragraph labels align with parent paragraph text
- **Sub-sub-sub paragraph alignment** - Adjusted ISSS value (18→19) for proper alignment

### Changed
- Libraries now load from local `lib/` folder instead of CDN
- PDF generation uses HTML content from editor for formatting preservation

---

## [3.2.0] - 2024-12-16

### Added
- **Rich Text Editor** for paragraph editing
  - Custom contenteditable editor replacing plain textareas
  - Formatting toolbar with Bold, Italic, Underline, Strikethrough buttons
  - Font selection dropdown (Times New Roman, Arial, Courier, Georgia)
  - Font size dropdown (8pt - 18pt)
  - Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)
  - Active state indicators show current formatting
  - Selection-based formatting (highlight text, apply format)

- **Clear Formatting button** - Resets selected text to Times New Roman 12pt with no styling

- **Collapsible Toolbar** - Toggle button (▲/▼) to collapse/expand toolbar and save space

- **Word/Character Counter** - Footer below each paragraph shows real-time word and character counts

- **Find & Replace** (`Ctrl+H`)
  - Search icon button in Body Paragraphs header
  - Find Next, Replace, Replace All buttons
  - Case-sensitive search option
  - Status indicator showing match count (e.g., "3 of 7")
  - Enter key in find field triggers Find Next
  - Searches across all paragraphs

- **"IN REPLY REFER TO:" option**
  - Checkbox in Header Information section
  - Adds "In Reply Refer To:" line above SSIC in PDF output
  - Per SECNAV M-5216.5 - use when not pre-printed on letterhead

### Changed
- Paragraph input changed from textarea to contenteditable div
- Help text updated: shows `Ctrl+B/I/U format` and `Ctrl+H find/replace`

### Removed
- **More Options** panel removed from Header Information
  - Serial number and DTG format options removed (were rarely used)
  - Portion marking checkbox remains (appears when classification is selected)

---

## [3.1.0] - 2024-12-14

### Added
- **User Profile System** (`js/user-profile.js`)
  - Session-only storage (clears when browser closes) - no PII stored on shared computers
  - Import/export profile to JSON file for portability
  - Auto-populates form fields (signature name, from line, unit info, office code)
  - "Capture from Form" button to save current form values
  - Clear security disclaimer explaining data handling
  - Profile button in header (top-left)

- **Reference Library** (`js/reference-library.js`, `data/references.json`)
  - **100+ searchable military references** across 12 categories
  - MCOs: Personnel, Training, Safety, Operations, Supply, Admin, Legal, Medical
  - SECNAVINSTs: Awards, Personnel Security, Equal Opportunity, SAPR
  - DoD Directives: JTR, FMR, Ethics, Information Security
  - U.S. Navy Regulations: Request Mast, Fraternization, CO Authority
  - NAVMC Forms: FITREP, Counseling, Unit Diary
  - Manuals: UCMJ, MCM
  - Keyword search across titles and common terms
  - Category filtering with back button navigation
  - One-click adds formatted reference to form
  - Custom styled scrollbar for cleaner UI

- **17 New Templates** (added to `data/templates.json`)
  - 6105 Counseling Entry Request
  - Meritorious Promotion Recommendation
  - Humanitarian/Hardship Transfer Request
  - Letter of Instruction (LOI)
  - Legal Hold Notification
  - Career Designation Package Cover
  - Appointment as Investigating Officer
  - Appointment to Collateral Duty
  - Appointment to Board/Committee
  - Meritorious Mast Recommendation
  - Temporary Additional Duty (TAD) Request
  - Duty Status Change Notification
  - Appointment as Safety Officer
  - Personal Award Recommendation
  - Statement Under Oath (sworn statement)
  - Extension of Enlistment Endorsement
  - New "Legal" category added

- **Smart Validation** (`js/validation.js`)
  - Subject line length warning (>100 characters)
  - Required field validation (From, To, Subject, paragraphs)
  - Reference format hints for MCO/SECNAVINST patterns
  - Visual indicators with hover tooltips
  - Blocks PDF generation on critical errors
  - Real-time validation as you type

- **Enhancements** (`js/enhancements.js`)
  - **DTG Format**: Toggle button to use Date-Time Group format (141200ZDEC25) for operational correspondence
  - **Serial Number Generator**: Auto-format office code + sequential number (S-1/0045)
  - **Subject Character Count**: Live counter shows characters used vs 100 recommended max
  - **PII/PHI Warning System**: Detects SSN, EDIPI, DOB, phone numbers, medical info, financial accounts before PDF generation
    - Critical/Warning/Info severity levels
    - Masks detected PII in warning display
    - Dismissable per session
    - References MCO 5211.2B
  - **CUI Classification Reminder**: Prompts verification before generating CUI/FOUO documents
  - **Duplicate Letter**: Button to clone current letter with date/subject cleared for new correspondence
  - **Recent Drafts**: Shows last 5 drafts from session for quick access (session-only, auto-saves on changes)

- **Batch Generator Table Editor** (`js/batch-generator.js`)
  - **Inline editable table** - Enter data directly without needing Excel or CSV files
  - Add/remove rows with one click
  - Pre-filled placeholder hints for each column (name, rank, to, subject, date, ssic, reason, period)
  - CSV import still available as alternative (populates the table)
  - Download template CSV button
  - Clear all rows button
  - Real-time count of valid letters ready to generate
  - Wide modal layout for better editing

- **First-Time User Welcome** (`js/welcome.js`)
  - Welcome modal for new users highlighting key features
  - Feature cards: Templates, Reference Library, Batch Generation, Security
  - Quick tips section (keyboard shortcuts, live preview, user profile, dark mode)
  - "Don't show again" option (respects user preference)
  - "Show Tips" link in footer to view again anytime
  - Auto-detects first visit via localStorage

- **Template Preview** (`js/template-manager.js`)
  - **Preview before applying** - See template content before loading
  - Split-pane layout: template list on left, preview on right
  - Preview shows: document type, SSIC, subject, references, enclosures, body paragraphs
  - Selected template highlighted in list
  - "Use This Template" button to apply after reviewing
  - Responsive layout for smaller screens

### Changed
- Profile button moved to top-left header (was overlapping title)
- Profile button styled to match navy header theme
- Reference library expanded from 26 to 100+ entries
- Added 4 new reference categories: Safety, Medical, Intelligence, Communications
- Download PDF button now runs PII check and CUI reminder before generation
- Batch generator modal widened and redesigned with editable table
- Batch generator signature options: "Keep my signature" (for awards/counseling) vs "Name = Signature" (for leave requests)
- Batch generator help button (?) with detailed usage examples
- Template modal redesigned with split-pane preview layout
- Template selection now previews before applying (click to preview, button to apply)
- Spell check now always enabled on paragraph textareas (removed toggle)
- Character/word count now always displayed on paragraphs (removed toggle)
- Header Information section redesigned: clean 4-column grid with expandable "More options" for Serial #, DTG format, and Portion marking
- Help text converted to tooltips throughout Header Information section

### Fixed
- jsPDF null checks added to prevent crashes
- Portion marks now appear in live preview
- Batch generator synced with main generator (orphan/widow protection, portion marks)
- Mobile preview button hidden on small screens
- Classification marks spacing fixed (symmetrical top/bottom)
- Empty filename edge case handled
- Copy-to numbering now included in output
- Accessibility labels added to all dynamic form elements
- Reference library back button added for category navigation

---

## [3.0.0] - 2024-12-14

### Added
- **Live preview pane** (`js/preview-manager.js`)
  - Real-time PDF preview as you type
  - Split-screen layout with form on left, preview on right
  - Toggle button moved to quick toolbar at top for easy access
  - Debounced updates (500ms) for smooth performance
  - Remembers preference in localStorage
- **Template library** (`js/template-manager.js`, `data/templates.json`)
  - **20 pre-built Marine-centric templates** for common letter types
  - Personnel: Leave Request, Special Liberty, Request Mast, Page 11 Entry, PFT/CFT Waiver, Orders Modification, Checkout Letter, SGLI Update, Fitness Report Cover
  - Awards: NAM Recommendation, Letter of Appreciation
  - Leadership: Positive Counseling, Corrective Counseling, Command Interest
  - Endorsements: Recommend Approval, Recommend Disapproval, For Information
  - Training: Training Request
  - Administrative: Government Travel Card Request
  - Investigations: Report of Findings
  - Searchable modal with category filter
  - Templates button moved to quick toolbar at top for discoverability
- **Undo/redo for paragraphs** (`js/undo-manager.js`)
  - Full edit history with up to 50 undo states
  - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo)
  - Undo/redo buttons in paragraph section header
  - Tracks paragraph additions, deletions, reordering, and text changes
  - Fixed: Restored paragraphs now have correct HTML structure and styling
- **CUI/FOUO portion markings**
  - Per-paragraph classification marking per DoDM 5200.01
  - Portion marking selector: (U), (CUI), (FOUO)
  - Checkbox to enable/disable portion marking (appears when CUI/FOUO classification selected)
  - Portion marks appear in PDF output before paragraph labels
- **Quick toolbar** - Templates and Live Preview buttons at top of form for easy access
- **Improved paragraph editing**
  - Inline action buttons (+, ↳, ×) on left side below drag handle
  - Cleaner, more intuitive paragraph management
  - Removed confusing "Outdent" button terminology
- **Improved memorandum style toggle**
  - Visual toggle cards (Plain Paper / Letterhead) instead of checkbox
  - Cleaner, more intuitive selection matching document type selector style

### Changed
- **Marine Corps focused** - Removed Navy branch selector, now exclusively USMC
- **Streamlined UI**
  - Service/Organization pre-filled with "UNITED STATES MARINE CORPS"
  - Bottom action panel reduced from 10 to 6 buttons
  - Removed "Preview LaTeX" button (niche feature)
  - Removed "Open in Overleaf" button (redundant with live preview)
  - Removed info box mentioning Overleaf
  - Cleaner two-row layout: Primary actions (Download PDF, Print) and Secondary actions (Download .tex, Download ZIP, Save/Load Draft)
- Intro text updated: "Free tool for Marines"
- Removed LaTeX preview section from HTML

### Fixed
- **Undo/redo paragraph restoration** - Restored paragraphs now have correct HTML structure matching new inline button design
- **Live preview paragraphs** - Fixed `d.paragraphs` → `d.paras` property name
- **Live preview Copy To** - Fixed `d.copyTo` → `d.copies` property name
- **Live preview SSIC/date position** - Now correctly positioned on right side of page

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
| 3.1.1   | Dec 2024 | Rich text formatting in PDF output, bundled libraries for offline, alignment fixes |
| 3.2.0   | Dec 2024 | Rich text editor, Find & Replace, "IN REPLY REFER TO:" option, collapsible toolbar |
| 3.1.0   | Dec 2024 | User profiles, 100+ reference library, 37 templates total, smart validation, batch generator enhancements, UI polish |
| 3.0.0   | Dec 2024 | Live preview, 20 Marine-centric templates, undo/redo, portion markings, streamlined UI |
| 2.0.0   | TBD  | Modular architecture, draft save/load, memorandum, dark mode, PWA, keyboard shortcuts, 111 tests |
| 1.3.0   | Dec 2024 | Initial GitHub Pages release |
