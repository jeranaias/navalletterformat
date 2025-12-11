# Naval Letter Generator

### Free Online Tool for SECNAV M-5216.5 Compliant Military Correspondence

[![SECNAV M-5216.5](https://img.shields.io/badge/SECNAV-M--5216.5-blue)](https://www.secnav.navy.mil/doni/SECNAV%20Manuals1/5216.5%20DON%20Correspondence%20Manual.pdf)
[![MCO 5216.20](https://img.shields.io/badge/MCO-5216.20-red)](https://www.marines.mil/News/Publications/MCPEL/Electronic-Library-Display/Article/899678/mco-521620/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**🔗 Live Tool: [https://jeranaias.github.io/navalletterformat/](https://jeranaias.github.io/navalletterformat/)**

---

## What Is This?

The **Naval Letter Generator** is a free, browser-based tool that creates properly formatted naval correspondence for the **United States Marine Corps** and **United States Navy**. It generates publication-ready documents that comply with **SECNAV M-5216.5** (Department of the Navy Correspondence Manual) and **MCO 5216.20** (Marine Corps supplement).

No software installation required. No account needed. Just open the link and start typing.

---

## Why This Exists

Every Marine and Sailor has struggled with naval letter formatting at some point:

- Hunting for a template that's actually correct
- Manually adjusting margins, tabs, and spacing
- Getting paragraph numbering wrong (is it 1.a.(1)(a) or 1.a.1.a?)
- Inconsistent formatting across the command
- Wasting hours on administrative formatting instead of actual work

This tool eliminates all of that. Fill in your information, click a button, and get a perfectly formatted document every time.

---

## Features

### ✅ Full SECNAV M-5216.5 Compliance
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
| Sentence spacing | Two spaces after periods |
| Signature block | 4 lines below text, starts at page center (3.25") |
| Continuation pages | Subject in header, page number centered at bottom |

### ✅ Smart Paragraph Numbering
Automatic hierarchical numbering with proper indentation:
- **Main paragraphs:** 1., 2., 3.
- **Sub-paragraphs:** a., b., c.
- **Sub-sub-paragraphs:** (1), (2), (3)
- **Sub-sub-sub-paragraphs:** (a), (b), (c)

Alignment is calculated using actual character widths—not fixed measurements—ensuring perfect alignment regardless of content.

### ✅ Automatic Via/Reference/Enclosure Numbering
- **Via addressees** auto-number as (1), (2), (3), (4)
- **References** auto-letter as (a), (b), (c), (d)
- **Enclosures** auto-number as (1), (2), (3)

### ✅ Custom Letterhead Support
- Add your unit's service name and address
- Upload your unit seal/emblem (PNG or JPEG)
- Seal automatically positioned per regulations

### ✅ Drag-and-Drop Paragraph Reordering
Click and drag paragraphs to reorganize. Numbering updates automatically.

### ✅ Multiple Output Options
- **Preview** the LaTeX code
- **Download .tex file** for local compilation
- **Download ZIP** with all files (for letters with seal images)
- **Copy to clipboard**
- **Open directly in Overleaf** (one-click cloud compilation)

### ✅ Works Everywhere
- Desktop, laptop, tablet, or phone
- Chrome, Firefox, Safari, Edge
- No installation, no plugins, no account required
- Works on NMCI, personal devices, or any computer with a browser

---

## How to Use

### Quick Start (5 minutes)

1. **Open the tool:** [https://jeranaias.github.io/navalletterformat/](https://jeranaias.github.io/navalletterformat/)

2. **Fill in header information:**
   - SSIC (Standard Subject Identification Code)
   - Date (auto-filled, adjust if needed)
   - Classification level

3. **Add letterhead** (optional):
   - Toggle "Include generated letterhead"
   - Enter service name and unit address
   - Upload unit seal if desired

4. **Complete addressing:**
   - From: (Rank Name EDIPI/MOS Service)
   - To: (Primary addressee)
   - Via: (Click "+ Add Via" for each routing addressee)
   - Subject: (Will auto-capitalize)

5. **Add references and enclosures** (if applicable)

6. **Build body paragraphs:**
   - Click "+ Add First Paragraph"
   - Type your text (remember: two spaces after periods)
   - Click any paragraph to see action buttons
   - Use "+ Same Level" for siblings, "+ Indent" for sub-paragraphs

7. **Complete signature block:**
   - Name (will be capitalized)
   - Rank
   - Title/Billet
   - Check "By direction" if applicable

8. **Generate your document:**
   - **Without seal:** Click "Open in Overleaf" → Recompile → Download PDF
   - **With seal:** Click "Download ZIP" → Upload to Overleaf → Recompile → Download PDF

---

## Detailed Instructions

### Using Overleaf (Recommended)

[Overleaf](https://www.overleaf.com/) is a free online LaTeX editor. You don't need to know LaTeX—just upload and click "Recompile."

**For letters WITHOUT a seal image:**
1. Click "Open in Overleaf"
2. Click the green "Recompile" button
3. Download your PDF

**For letters WITH a seal image:**
1. Click "Download ZIP"
2. Go to [Overleaf.com](https://www.overleaf.com/) → New Project → Upload Project
3. Upload the ZIP file
4. Click "Recompile"
5. Download your PDF

### Paragraph Structure

Naval letters use a specific hierarchy. Here's how to structure complex correspondence:

```
1.  Main paragraph introducing the first topic.

    a.  Sub-paragraph providing supporting detail.

    b.  Another sub-paragraph.

        (1)  Sub-sub-paragraph for further breakdown.

        (2)  Another sub-sub-paragraph.

            (a)  Deepest level (use sparingly).

            (b)  Another deepest level item.

        (3)  Back to sub-sub level.

    c.  Back to sub-paragraph level.

2.  Second main paragraph with new topic.
```

**Rules:**
- Never have just one sub-paragraph (if you indent, you need at least two items)
- Don't go deeper than (a) level unless absolutely necessary
- Each level aligns with the text of the level above

### Special Characters

If your text includes these characters, the generator handles them automatically:
- `&` (ampersand)
- `%` (percent)
- `$` (dollar sign)
- `_` (underscore)
- `#` (hash)

### Classification Markings

Select classification from the dropdown:
- UNCLASSIFIED
- CUI (Controlled Unclassified Information)
- FOR OFFICIAL USE ONLY
- CONFIDENTIAL
- SECRET

**Note:** This tool is for UNCLASSIFIED use only. Do not enter classified information into any web-based tool.

---

## Technical Specifications

### Compliance Standards
- **SECNAV M-5216.5** – Department of the Navy Correspondence Manual
- **MCO 5216.20B** – Marine Corps Supplement to SECNAV M-5216.5
- **U.S. Government Printing Office (GPO) Style Manual**

### Output Format
- LaTeX source code (.tex)
- Compiles to PDF via Overleaf or local LaTeX installation
- Uses `article` document class with `mathptmx` (Times New Roman equivalent)

### Browser Compatibility
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Apple Safari
- Mobile browsers (iOS Safari, Chrome for Android)

### Dependencies
- [JSZip](https://stuk.github.io/jszip/) – For ZIP file generation (loaded via CDN)
- No other external dependencies

---

## Frequently Asked Questions

**Q: Is this an official Marine Corps/Navy tool?**  
A: No. This is a personal project created to help service members format correspondence correctly. Always verify your command's specific requirements.

**Q: Does this work on NMCI computers?**  
A: Yes. It's a standard webpage that works in any browser. No installation or admin rights required.

**Q: Is my data saved anywhere?**  
A: No. Everything runs in your browser. Nothing is transmitted to any server. When you close the page, your data is gone.

**Q: Can I use this for classified correspondence?**  
A: **No.** This is for UNCLASSIFIED use only. Never enter classified information into any web-based tool.

**Q: Why LaTeX instead of Word?**  
A: LaTeX produces consistent, publication-quality formatting every time. The same input always produces the same output, eliminating the "it looks different on my computer" problem.

**Q: Do I need to learn LaTeX?**  
A: No. The generator creates the LaTeX code for you. Just upload to Overleaf and click "Recompile."

**Q: Can I edit the generated document?**  
A: Yes. You can edit the .tex file in Overleaf before compiling, or regenerate from the web tool with changes.

**Q: The PDF looks slightly different from my command's template.**  
A: Minor variations exist between commands. This tool follows SECNAV M-5216.5 exactly. If your command requires specific deviations, you may need to adjust the output.

---

## Contributing

Found a bug? Have a feature request? Want to improve the tool?

- **Report issues:** [GitHub Issues](https://github.com/jeranaias/navalletterformat/issues)
- **Submit improvements:** Pull requests welcome
- **Feedback:** Open an issue with the "feedback" label

### Future Enhancements (Planned)
- [ ] Direct PDF generation (no Overleaf step)
- [ ] Save/load letter drafts
- [ ] Multiple letter templates (endorsements, memoranda)
- [ ] Print directly from browser
- [ ] Spell check integration

---

## About

**Created by:** SSgt Jesse Morgan, USMC  
**Location:** Presidio of Monterey, California  
**Purpose:** Making naval correspondence formatting accessible to every Marine and Sailor

This tool was built out of frustration with inconsistent templates and wasted time on administrative formatting. Every service member deserves access to properly formatted correspondence tools—not just those who happen to have the right template or know the right person.

---

## References

- [SECNAV M-5216.5 – Department of the Navy Correspondence Manual](https://www.secnav.navy.mil/doni/SECNAV%20Manuals1/5216.5%20DON%20Correspondence%20Manual.pdf)
- [MCO 5216.20 – Marine Corps Correspondence Manual](https://www.marines.mil/News/Publications/MCPEL/Electronic-Library-Display/Article/899678/mco-521620/)
- [U.S. Government Publishing Office Style Manual](https://www.govinfo.gov/collection/gpo-style-manual)

---

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.

Free to use, modify, and distribute. No warranty expressed or implied.

---

## Keywords

Naval letter format, SECNAV M-5216.5, Marine Corps correspondence, Navy correspondence, military letter format, naval letter template, USMC letter format, official military correspondence, naval letter generator, military document formatting, Marine Corps letter template, Navy letter template, DON correspondence manual, MCO 5216.20, military admin, S-1, adjutant, correspondence manual, naval message format, military writing, professional military correspondence

---

<p align="center">
  <i>Semper Fidelis</i>
</p>
