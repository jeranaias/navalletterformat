# Naval Letter Generator

### Free Online Tool for SECNAV M-5216.5 Compliant Military Correspondence

[![SECNAV M-5216.5](https://img.shields.io/badge/SECNAV-M--5216.5-blue)](https://www.secnav.navy.mil/doni/SECNAV%20Manuals1/5216.5%20DON%20Correspondence%20Manual.pdf)
[![MCO 5216.20](https://img.shields.io/badge/MCO-5216.20-red)](https://www.marines.mil/News/Publications/MCPEL/Electronic-Library-Display/Article/899678/mco-521620/)
[![Version](https://img.shields.io/badge/Version-2.0.0-green)](https://github.com/jeranaias/navalletterformat/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Live Tool: [https://jeranaias.github.io/navalletterformat/](https://jeranaias.github.io/navalletterformat/)**

---

## V2.0 NOW LIVE!

**The biggest update yet is here.** Complete architecture overhaul with major new features:

| New in v2.0 | Description |
|-------------|-------------|
| **Draft Save/Load** | Auto-saves every 2 seconds, export/import JSON, restore on reload |
| **2,240 SSIC Codes** | Complete SECNAV M-5210.2 database (August 2018) |
| **230 Units** | Expanded database with full addresses |
| **Memorandum Format** | New document type for internal correspondence |
| **Dark Mode** | Theme toggle with system preference detection |
| **Print Button** | Print directly from browser |
| **Auto Seal** | Department of War seal loads automatically |
| **PWA Support** | Install to home screen, works offline |
| **Accessibility** | ARIA labels, keyboard navigation, screen reader support |

**v3.0 in development** on the [v3 branch](https://github.com/jeranaias/navalletterformat/tree/v3) with live preview, templates, and more!

---

## What Is This?

The **Naval Letter Generator** is a free, browser-based tool that creates properly formatted naval correspondence for the **United States Marine Corps**. It generates publication-ready documents that comply with **SECNAV M-5216.5** (Department of the Navy Correspondence Manual) and **MCO 5216.20** (Marine Corps supplement).

**No software installation. No account. No Overleaf required.**

Just open the link, fill in your information, and download your PDF.

---

## What's New in v2.0

### Draft Save/Load
Your work is automatically saved every 2 seconds. Export drafts as JSON files to share or backup. Import saved drafts anytime. If you accidentally close the page, your work will be waiting when you return.

### Complete SSIC Database (2,240 Codes)
The full SECNAV M-5210.2 (August 2018) database is now searchable. Type any subject and find the right code instantly.

### Expanded Unit Database (230 Units)
All major USMC/USN/DOD units with complete addresses. Search and auto-fill your letterhead in seconds.

### Memorandum Format
New document type for internal correspondence. Choose between plain-paper memo or formal letterhead memo.

### Dark Mode
Toggle between light and dark themes. Automatically detects your system preference. Your choice is saved.

### Print Button
Print directly from your browser. Opens PDF in new tab with print dialog ready.

### Auto Seal
The Department of War seal is automatically included on letterhead. No more uploading seal images.

### PWA Support
Install the app to your home screen on mobile or desktop. Works completely offline once installed.

### Accessibility
Full keyboard navigation, ARIA labels for screen readers, skip links, and reduced motion support.

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

## Features

### Live PDF Preview
Toggle real-time preview to see your formatted letter as you type. Debounced updates for smooth performance.

### One-Click PDF Generation
Click "Download PDF" and get your formatted letter instantly. No external tools, no accounts, no waiting.

### 20 Pre-Built Templates
Start from common letter types instead of blank. Search by name or filter by category.

### SSIC Search (2,240 Codes)
Complete database from SECNAV M-5210.2 (August 2018). Type a subject and get matching codes:
- **1000s** — Personnel (promotions, leave, assignments, awards, fitness reports, NJP)
- **3000s** — Operations (OPSEC, training, PFT/CFT, marksmanship)
- **4000s** — Logistics (supply, maintenance, transportation)
- **5000s** — Admin (records, FOIA, security clearances, urinalysis, EO)
- **6000s** — Medical (LIMDU, dental readiness, mental health)
- **7000s** — Financial (travel, PCS, TAD, pay)
- **10000+** — Weapons, Communications, Intelligence, Aviation

### Unit Database (230 Units)
Search and auto-fill your letterhead:
- HQMC, MCCDC, TECOM, MCICOM, LOGCOM, MARFORRES
- I/II/III MEF, 1st/2nd/3rd MarDiv, 1st/2nd/3rd MAW, 1st/2nd/3rd MLG
- All infantry regiments (1st, 2nd, 5th, 6th, 7th, 8th Marines)
- Bases (Pendleton, Lejeune, Quantico, 29 Palms, MCBH)
- Air stations (Miramar, Cherry Point, Yuma, Beaufort)
- Schools (TBS, OCS, IOC, SOI, EWS, C&S, War College)
- Special units (MSG Bn, SECFOR, CBIRF, MCD DLI)

### Three Document Types
- **Basic Letter** — Standard correspondence format
- **Endorsement** — Forward with comments (First through Fifth)
- **Memorandum** — Internal correspondence (plain paper or letterhead)

### Draft Save/Load
Auto-saves every 2 seconds. Export/import JSON files. Restore on page reload.

### Smart Paragraph Numbering
Automatic hierarchical numbering with proper indentation:
- **Main paragraphs:** 1., 2., 3.
- **Sub-paragraphs:** a., b., c.
- **Sub-sub-paragraphs:** (1), (2), (3)
- **Sub-sub-sub-paragraphs:** (a), (b), (c)

Drag-and-drop reordering with automatic renumbering. Undo/redo support.

### Automatic Numbering
- **Via addressees** auto-number as (1), (2), (3) only when multiple
- **References** auto-letter as (a), (b), (c), (d)
- **Enclosures** auto-number as (1), (2), (3)

### Full SECNAV M-5216.5 Compliance

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
| Sentence spacing | Two spaces after periods (auto-enforced) |
| Signature block | 4 lines below text, starts at page center, name only |
| Continuation pages | Full subject line in header, page number centered |

### Dark Mode
Theme toggle with system preference detection. Saved to localStorage.

### Keyboard Shortcuts
- `Ctrl+S` / `Cmd+S` — Export draft to file
- `Ctrl+P` / `Cmd+P` — Print PDF
- `Ctrl+D` / `Cmd+D` — Download PDF
- `Escape` — Close preview/modals

### PWA Support
Install to home screen on mobile/desktop. Works offline via service worker.

### Accessibility
ARIA labels, keyboard navigation, skip links, focus styles, reduced motion support.

---

## How to Use

### Quick Start (Under 2 Minutes)

1. **Open the tool:** [https://jeranaias.github.io/navalletterformat/](https://jeranaias.github.io/navalletterformat/)

2. **Optional: Start from a template** — Click "Templates" and choose a starting point

3. **Fill in your letter:**
   - SSIC, date, classification
   - From, To, Via (if applicable), Subject
   - References and enclosures
   - Body paragraphs
   - Signature block

4. **Click "Download PDF"**

5. **Done.** Print or email your properly formatted letter.

### Tips
- **Two spaces after periods** — Added automatically
- **Subject line** — Automatically capitalized
- **Drag to reorder** — Grab the handle to rearrange paragraphs
- **Save your work** — Auto-saves, but use Save Draft to export a backup

---

## Sample Output

Here's what the tool generates:

**[Download Example PDF](https://github.com/jeranaias/navalletterformat/raw/main/naval_letter_example.pdf)**

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

## Feedback Welcome

**Found something off?**
- Spacing look wrong?
- Alignment not matching your command's standard?
- Missing a feature you need?

**[Open an issue on GitHub](https://github.com/jeranaias/navalletterformat/issues)** — Screenshots are incredibly helpful!

---

## Roadmap

### Planned Features (High Effort)
- **Import from Word/PDF** — Parse existing correspondence documents
- **Multi-letter batch generation** — Generate multiple letters from spreadsheet data
- **Collaboration/sharing** — Share drafts with others (requires backend)

**Want to influence priorities?** [Vote on issues](https://github.com/jeranaias/navalletterformat/issues) or open a new one.

---

## FAQ

**Q: Is this an official Marine Corps tool?**
A: No. This is a personal project to help Marines format correspondence correctly. Always verify your command's specific requirements.

**Q: Does this work on NMCI computers?**
A: Yes. It's a standard webpage that works in any browser. No installation required.

**Q: Is my data saved anywhere?**
A: Everything runs in your browser. Nothing is transmitted to any server. Your work auto-saves to localStorage and you can export drafts as JSON files.

**Q: Can I use this for classified correspondence?**
A: **No.** This is for UNCLASSIFIED use only. Never enter classified information into any web-based tool.

**Q: Something looks wrong / doesn't match my command's format.**
A: [Please report it!](https://github.com/jeranaias/navalletterformat/issues) Include a screenshot and description.

---

## Technical Details

### Compliance Standards
- **SECNAV M-5216.5** — Department of the Navy Correspondence Manual
- **MCO 5216.20B** — Marine Corps Supplement
- **DoDM 5200.01** — Information Security Program (for portion markings)

### Technology
- Pure HTML/CSS/JavaScript (no framework)
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [JSZip](https://stuk.github.io/jszip/) for ZIP file creation
- Service worker for offline support

### Browser Support
- Chrome (recommended)
- Firefox
- Edge
- Safari
- Mobile browsers

---

## Acknowledgments

Thanks to the Marines who've provided feedback:

- **u/BorderlineSatisfied** (r/USMC) — Detailed formatting corrections
- **u/christian_austin85** (r/USMC) — Architecture recommendations

---

## Contributing

1. **Use the tool and report issues** — [GitHub Issues](https://github.com/jeranaias/navalletterformat/issues)
2. **Suggest features** — What would make your admin life easier?
3. **Share with your shop** — More users = more feedback = better tool
4. **Submit code improvements** — Pull requests welcome

---

## About

**Created by:** Jesse Morgan
**Version:** 2.0.0
**Status:** Active development

*Personal project, not officially endorsed by any military branch.*

---

## References

- [SECNAV M-5216.5 — Department of the Navy Correspondence Manual](https://www.secnav.navy.mil/doni/SECNAV%20Manuals1/5216.5%20DON%20Correspondence%20Manual.pdf)
- [MCO 5216.20 — Marine Corps Correspondence Manual](https://www.marines.mil/News/Publications/MCPEL/Electronic-Library-Display/Article/899678/mco-521620/)
- [DoDM 5200.01 — Information Security Program](https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodm/520001m_vol2.pdf)

---

## License

MIT License — Free to use, modify, and distribute.

---

<p align="center">
  <b>Found this useful? Star the repo and share with your shop.</b>
</p>

<p align="center">
  <i>Semper Fidelis</i>
</p>
