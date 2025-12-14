# Naval Letter Generator

### Free Online Tool for SECNAV M-5216.5 Compliant Military Correspondence

[![SECNAV M-5216.5](https://img.shields.io/badge/SECNAV-M--5216.5-blue)](https://www.secnav.navy.mil/doni/SECNAV%20Manuals1/5216.5%20DON%20Correspondence%20Manual.pdf)
[![MCO 5216.20](https://img.shields.io/badge/MCO-5216.20-red)](https://www.marines.mil/News/Publications/MCPEL/Electronic-Library-Display/Article/899678/mco-521620/)
[![Status](https://img.shields.io/badge/Status-Beta-yellow)](https://github.com/jeranaias/navalletterformat/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**🔗 Live Tool: [https://bit.ly/navalletter](https://bit.ly/navalletter)**

---

## 🚧 Beta - We Want Your Feedback!

**This tool is under active development.** It works, but it's not perfect yet—and that's where you come in.

If you're an S-1 clerk, adjutant, admin Marine, Yeoman, or anyone who works with naval correspondence regularly, **your eye for detail is exactly what this project needs.**

**Found something off?**
- Spacing look wrong?
- Alignment not matching your command's standard?
- Missing a feature you need?
- Have a suggestion?

**[Open an issue on GitHub](https://github.com/jeranaias/navalletterformat/issues)** or comment with details. Screenshots are incredibly helpful. Every piece of feedback makes this tool better for the next Marine or Sailor who uses it.

---

## What Is This?

The **Naval Letter Generator** is a free, browser-based tool that creates properly formatted naval correspondence for the **United States Marine Corps** and **United States Navy**. It generates publication-ready documents that comply with **SECNAV M-5216.5** (Department of the Navy Correspondence Manual) and **MCO 5216.20** (Marine Corps supplement).

**No software installation. No account. No Overleaf required.**

Just open the link, fill in your information, and download your PDF.

---

## ✨ What's New

### v2.0 In Development (v2 branch)

A major architecture overhaul is in progress! Check the `v2` branch for the latest development version.

**New Features:**
- **Draft Save/Load** - Auto-saves every 2 seconds, export/import JSON files, restore on page reload
- **Explicit Paragraph Subjects** - Optional subject field for top-level paragraphs (underlined in output)
- **Auto Double Spacing** - Automatically enforces double spaces after periods (military standard)
- **Auto Seal** - Department of War seal loads automatically (no more upload needed)
- **2,240 SSIC Codes** - Complete database from SECNAV M-5210.2 (August 2018)
- **230 Units** - Expanded unit database with full addresses

**Architecture Improvements:**
- Modular JavaScript (7 separate files instead of monolithic HTML)
- External CSS and JSON data files
- Build script for single-file distribution
- 67 automated unit tests
- Proper separation of concerns

**Bug Fixes:**
- Unit letterhead shows full name ("UNITED STATES MARINE CORPS" not "USMC")
- Seal description corrected to "Department of War"
- Paragraph label spacing now consistent (single space after 1., a., (1), (a))
- Subject margins properly constrained within page boundaries
- Date parsing fixed for "DD Mon YYYY" format

See [CHANGELOG.md](CHANGELOG.md) for complete details.

---

### v1.3 Beta (13 Dec 24)

**Major formatting corrections based on community feedback** — Special thanks to **u/BorderlineSatisfied** on r/USMC for the detailed review!

- **🔧 Sender's Symbols Alignment** - SSIC, office code, and date now left-align under their first character (not right-aligned). The "1," "S," and "1" now form a straight vertical line.
- **🔧 Via Numbering** - Via addressees are only numbered (1), (2), etc. when there are multiple. Single via addressee has no number.
- **🔧 Paragraph Text Wrap** - Second and subsequent lines of paragraphs now indent to the page margin, not the beginning of the paragraph text.
- **🔧 Paragraph Titles Underlined** - Single-word titles like "Background." and "Recommendation." are now automatically underlined per SECNAV M-5216.5.
- **🔧 Signature Block** - Removed rank and title below signee name. That's an Army format, not DoN/USMC. Now shows name only.
- **🔧 Page Numbers** - Page numbers now only appear on page 2 and beyond (page 1 has no number).
- **🔧 Orphan Prevention** - Last paragraph, signature block, and "Copy to" section are kept together. No more lonely signature blocks on the last page.
- **🔧 Department of War Seal** - Example PDF now uses the correct DoW seal (not DoD).
- **🔧 Continuation Page Subject** - Full subject line now displays on continuation pages, not just the first line. Proper document identification if pages separate.

### v1.2 Beta (12 Dec 24)

- **🔍 SSIC Search** - Type a subject like "leave" or "training" and get matching codes. 100+ SSICs in the database.
- **🏢 Unit Database** - Search 60+ units (all MEFs, divisions, regiments, bases, schools) and auto-fill letterhead.
- **📅 Smart Date Entry** - Type any format (12/25/24, "Dec 25 2024", "today") and it auto-converts to DD Mon YY.
- **🏛️ Seal in PDF** - Upload your PNG/JPG seal and it now appears directly in the PDF. No Overleaf required.
- **📋 Endorsement Format** - Switch between Basic Letter and Endorsement with one click.
- **📁 Collapsible Sections** - Via, References, Enclosures collapse by default for a cleaner UI.
- **🎨 Cleaner Design** - Refined interface with better spacing, subtle shadows, and gold accents.

### v1.1 Beta (11 Dec 24)

- **Direct PDF Download** - No more Overleaf step for basic letters. Click "Download PDF" and you're done.
- **Instant Results** - Generate a formatted naval letter in under a minute
- **Works Offline** - Once loaded, works without internet (except for seal images)
- **Mobile Friendly** - Works on phones and tablets in a pinch

---

## Features

### ⬇️ One-Click PDF Generation
Click "Download PDF" and get your formatted letter instantly. Your uploaded seal appears in the PDF. No external tools, no accounts, no waiting.

### 🔍 SSIC Search (100+ Codes)
Type a subject and get matching SSIC codes instantly:
- **1000s** — Personnel (promotions, leave, assignments, awards, fitness reports, NJP)
- **3000s** — Operations (OPSEC, training, PFT/CFT, marksmanship)
- **4000s** — Logistics (supply, maintenance, transportation)
- **5000s** — Admin (records, FOIA, security clearances, urinalysis, EO)
- **6000s** — Medical (LIMDU, dental readiness, mental health)
- **7000s** — Financial (travel, PCS, TAD, pay)
- **10000+** — Weapons, Communications, Intelligence, Aviation

### 🏢 Unit Database (60+ Units)
Search and auto-fill your letterhead:
- HQMC, MCCDC, TECOM, MCICOM, LOGCOM, MARFORRES
- I/II/III MEF, 1st/2nd/3rd MarDiv, 1st/2nd/3rd MAW, 1st/2nd/3rd MLG
- All infantry regiments (1st, 2nd, 5th, 6th, 7th, 8th Marines)
- Bases (Pendleton, Lejeune, Quantico, 29 Palms, MCBH)
- Air stations (Miramar, Cherry Point, Yuma, Beaufort)
- Schools (TBS, OCS, IOC, SOI, EWS, C&S, War College)
- Special units (MSG Bn, SECFOR, CBIRF, MCD DLI)

### 📋 Endorsement Format
Switch between Basic Letter and Endorsement. First/Second/Third endorsement headers generated automatically.

### 🏛️ Custom Seal Upload
Upload your unit's PNG or JPG seal. It appears in the PDF at regulation position (0.5" from edges, 1" diameter).

### 📄 Full SECNAV M-5216.5 Compliance
Every measurement, margin, and spacing rule from the correspondence manual is built in:

| Element | Specification |
|---------|---------------|
| Margins | 1 inch on all sides |
| First page top margin | 0.625 inches to letterhead |
| Service name | 10pt Bold, centered |
| Unit address | 8pt Regular, centered |
| Seal placement | 0.5" from left and top edges, 1" diameter |
| Date format | DD Mon YY (e.g., 02 Dec 24) |
| Label tab width | 0.625 inches (From:, To:, Via:, Subj:, Ref:, Encl:) |
| Paragraph spacing | One blank line between all levels |
| Paragraph text wrap | Subsequent lines return to page margin |
| Sentence spacing | Two spaces after periods |
| Signature block | 4 lines below text, starts at page center (3.25"), name only (no rank/title per DoN standard) |
| Continuation pages | Full subject line in header (wrapped if needed), page number centered at bottom |

### 🔢 Smart Paragraph Numbering
Automatic hierarchical numbering with proper indentation:
- **Main paragraphs:** 1., 2., 3.
- **Sub-paragraphs:** a., b., c.
- **Sub-sub-paragraphs:** (1), (2), (3)
- **Sub-sub-sub-paragraphs:** (a), (b), (c)
- **Paragraph subjects** (like "Purpose." or "Background.") - optional field for main paragraphs, underlined in output

### 🔄 Automatic Numbering
- **Via addressees** auto-number as (1), (2), (3) only when multiple (single via has no number)
- **References** auto-letter as (a), (b), (c), (d)
- **Enclosures** auto-number as (1), (2), (3)

### 🏛️ Custom Letterhead Support
- Add your unit's service name and address
- Upload your unit seal/emblem (PNG or JPEG)
- Seal automatically positioned per regulations

### ↕️ Drag-and-Drop Reordering
Click and drag paragraphs to reorganize. Numbering updates automatically.

### 📤 Multiple Output Options
- **Download PDF** - Instant, recommended for most users (NEW!)
- **Open in Overleaf** - For pixel-perfect LaTeX output
- **Download ZIP** - For letters with seal images
- **Download .tex** - For local LaTeX compilation
- **Copy to clipboard** - For pasting into other tools

### 💻 Works Everywhere
- Desktop, laptop, tablet, or phone
- Chrome, Firefox, Safari, Edge
- Works on NMCI, personal devices, or any computer with a browser
- No installation, no plugins, no account required

---

## How to Use

### Quick Start (Under 2 Minutes)

1. **Open the tool:** [https://bit.ly/navalletter](https://bit.ly/navalletter)

2. **Fill in your letter information:**
   - SSIC, date, classification
   - From, To, Via (if applicable), Subject
   - References and enclosures
   - Body paragraphs
   - Signature block

3. **Click "Download PDF"**

4. **Done.** Print or email your properly formatted letter.

### Tips
- **Two spaces after periods** - v2.0 adds them automatically; v1.x requires typing them yourself
- **Subject line** - Will be automatically capitalized
- **Paragraphs** - Click any paragraph to see action buttons for adding siblings or children
- **Paragraph subjects** - v2.0 has an optional subject field for main paragraphs (underlined in output)
- **Drag to reorder** - Grab the ☰ handle to rearrange paragraphs

### Advanced Options

**Using a custom seal:**
1. Upload your seal image (PNG or JPG) in the Letterhead section
2. Click "Download PDF" — the seal appears in your PDF automatically!

**Need pixel-perfect output or LaTeX control?**
Use "Open in Overleaf" or "Download ZIP" for precise LaTeX compilation.

---

## 📄 Sample Output

Here's what the tool generates — this is an actual PDF created by the generator:

**[Download Example PDF](https://github.com/jeranaias/navalletterformat/raw/main/naval_letter_example.pdf)**

Preview:
```
                         UNITED STATES MARINE CORPS
                           MARINE CORPS DETACHMENT
               DEFENSE LANGUAGE INSTITUTE FOREIGN LANGUAGE CENTER
                        PRESIDIO OF MONTEREY, CA 93944

                                                                    1500
                                                                    S-3
                                                                    12 Dec 24

From:  Commanding Officer, Marine Corps Detachment
To:    Commandant of the Marine Corps (MMEA-25)
Via:   Commanding General, Training and Education Command

Subj:  REQUEST FOR ADDITIONAL INSTRUCTOR BILLETS

Ref:   (a)  MCO 1500.52A
       (b)  TECOM ltr 1500 S-3 dtd 15 Nov 24

Encl:  (1)  Manning Document
       (2)  Student Throughput Analysis

1.  Per reference (a), this command requests three additional instructor
    billets to support increased student throughput beginning FY25.

2.  Background.  Current manning supports 45 students per class cycle.
    Projected requirements indicate 60 students per cycle beginning
    October 2025.

    a.  Current instructor-to-student ratio is 1:9.

    b.  Proposed ratio maintains quality at 1:10.

3.  Recommendation.  Approve the addition of three 0211 billets to T/O
    01234.

4.  Point of contact is the undersigned at DSN 555-1234.


                              J. M. SMITH

Copy to:
CG, TECOM (C 469)
```

---

## Known Limitations (Help Us Fix These!)

We're actively working on improvements. Current known issues:

- [ ] Direct PDF may have minor spacing differences from LaTeX output on complex multi-page letters
- [x] ~~Seal images only work through the Overleaf/ZIP workflow~~ **Fixed in v1.2!**
- [x] ~~No save/load functionality yet (refresh = start over)~~ **Fixed in v2.0!** (auto-save + export/import)
- [x] ~~Single letter format only (no endorsements or memoranda yet)~~ **Endorsements added in v1.2!**

**See something else?** [Report it here](https://github.com/jeranaias/navalletterformat/issues)

---

## Roadmap - What's Next?

We're prioritizing based on user feedback.

### v1.x - Near Term

- [x] ~~Save/load letter drafts (localStorage)~~ **Done in v2.0!**
- [x] ~~Seal support in direct PDF generation~~ **Done!**
- [x] ~~Endorsement letter format~~ **Done!**
- [ ] Memorandum format
- [x] ~~More units and SSICs (request yours!)~~ **Done in v2.0!** (2,240 SSICs, 230 units)
- [ ] Print directly from browser
- [ ] Dark mode (for the night shift)

### v2.0 - Architecture Overhaul *(In Progress - see v2 branch)*

A complete rewrite focused on maintainability and scalability:

- [x] **Separate HTML/CSS/JS** - Monolithic file broken into 7 JS modules, external CSS, and JSON data files
- [x] **SSIC Database (Full Manual)** - 2,240 codes from SECNAV M-5210.2 (August 2018 edition)
- [x] **Complete Unit Database** - 230 USMC/USN/DOD units with full addresses
- [x] **Modular Component Architecture** - Separate modules for utils, data, forms, PDF, LaTeX, and drafts
- [x] **Unit Tests** - 67 automated tests with Jest (formatting, PDF output, utilities)
- [x] **Build Pipeline** - `node build.js` creates single-file portable distribution with embedded assets
- [x] **Draft Save/Load** - Auto-save to localStorage, export/import JSON files
- [x] **Auto Seal** - Department of War seal loads automatically (base64 embedded in build)

> **Note:** v1.x will remain available as the "it just works" single-file version. The v2.0 build script produces a single-file distribution (`dist/naval-letter.html`) that works exactly like v1.x - save it and run offline forever without dependencies.

**Want to influence priorities?** [Vote on issues](https://github.com/jeranaias/navalletterformat/issues) or open a new one describing what you need.

---

## Frequently Asked Questions

**Q: Is this an official Marine Corps/Navy tool?**
A: No. This is a personal project created to help service members format correspondence correctly. Always verify your command's specific requirements.

**Q: Does this work on NMCI computers?**
A: Yes. It's a standard webpage that works in any browser. No installation or admin rights required.

**Q: Is my data saved anywhere?**
A: Everything runs in your browser - nothing is transmitted to any server. In v2.0, your work auto-saves to your browser's localStorage and you can export/import drafts as JSON files. In v1.x, closing the page loses your work.

**Q: Can I use this for classified correspondence?**
A: **No.** This is for UNCLASSIFIED use only. Never enter classified information into any web-based tool.

**Q: The PDF looks slightly different from Overleaf output.**
A: The direct PDF generator is optimized for speed and convenience. For the most precise output, use the "Open in Overleaf" option. We're working to close this gap.

**Q: Something looks wrong / doesn't match my command's format.**
A: [Please report it!](https://github.com/jeranaias/navalletterformat/issues) Include a screenshot and description of what you expected. Different commands sometimes have local variations, but if it's a SECNAV M-5216.5 compliance issue, we want to fix it.

---

## Acknowledgments

Thanks to the Marines and Sailors who've provided feedback to make this tool better:

- **u/BorderlineSatisfied** (r/USMC) — Detailed v1.3 formatting corrections including sender's symbols alignment, via numbering, paragraph wrapping, title underlining, and signature block format.
- **u/christian_austin85** (r/USMC) — Continuation page subject line correction; v2.0 architecture recommendations (separate files, external SSIC/unit databases, maintainability improvements).

Your feedback makes this tool better for everyone. Keep it coming!

---

## Contributing

This project needs people who know naval correspondence. If that's you, your feedback is invaluable.

### Ways to Help

1. **Use the tool and report issues** - [GitHub Issues](https://github.com/jeranaias/navalletterformat/issues)
2. **Suggest features** - What would make your admin life easier?
3. **Share with your shop** - More users = more feedback = better tool
4. **Submit code improvements** - Pull requests welcome

### Feedback That Helps Most

- Screenshots showing the problem
- "Expected X but got Y" descriptions
- References to specific SECNAV M-5216.5 sections
- Comparison with your command's approved templates

---

## Technical Details

### Compliance Standards
- **SECNAV M-5216.5** – Department of the Navy Correspondence Manual
- **MCO 5216.20B** – Marine Corps Supplement to SECNAV M-5216.5
- **U.S. Government Printing Office (GPO) Style Manual**

### Technology
- Pure HTML/CSS/JavaScript (no framework)
- [jsPDF](https://github.com/parallax/jsPDF) for direct PDF generation
- [JSZip](https://stuk.github.io/jszip/) for ZIP file creation
- LaTeX output uses `article` class with `mathptmx` (Times New Roman equivalent)

### Browser Support
- Chrome (recommended)
- Firefox
- Edge
- Safari
- Mobile browsers

---

## About

**Created by:** Jesse Morgan  
**Status:** Active development - feedback welcome!

*Personal project, not officially endorsed by any military branch.*

This tool was built out of frustration with inconsistent templates and wasted time on administrative formatting. Every service member deserves access to properly formatted correspondence tools—not just those lucky enough to have the right template.

**The goal:** Make naval correspondence formatting a solved problem so Marines and Sailors can focus on their actual jobs.

---

## References

- [SECNAV M-5216.5 – Department of the Navy Correspondence Manual](https://www.secnav.navy.mil/doni/SECNAV%20Manuals1/5216.5%20DON%20Correspondence%20Manual.pdf)
- [MCO 5216.20 – Marine Corps Correspondence Manual](https://www.marines.mil/News/Publications/MCPEL/Electronic-Library-Display/Article/899678/mco-521620/)
- [U.S. Government Publishing Office Style Manual](https://www.govinfo.gov/collection/gpo-style-manual)

---

## License

MIT License - Free to use, modify, and distribute.

---

## Keywords

Naval letter format, SECNAV M-5216.5, Marine Corps correspondence, Navy correspondence, military letter format, naval letter template, USMC letter format, official military correspondence, naval letter generator, military document formatting, Marine Corps letter template, Navy letter template, DON correspondence manual, MCO 5216.20, military admin, S-1, adjutant, correspondence manual, naval message format, military writing, professional military correspondence, Yeoman, admin clerk, military PDF generator

---

<p align="center">
  <b>Found this useful? Star the repo ⭐ and share with your shop.</b>
</p>

<p align="center">
  <i>Semper Fidelis</i>
</p>
