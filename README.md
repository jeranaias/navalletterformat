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

## ✨ What's New (v1.1 Beta)

- **Direct PDF Download** - No more Overleaf step for basic letters. Click "Download PDF" and you're done.
- **Instant Results** - Generate a formatted naval letter in under a minute
- **Works Offline** - Once loaded, works without internet (except for seal images)
- **Mobile Friendly** - Works on phones and tablets in a pinch

---

## Features

### ⬇️ One-Click PDF Generation (NEW!)
Click "Download PDF" and get your formatted letter instantly. No external tools, no accounts, no waiting for compilation. For 90% of use cases, this is all you need.

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
| Sentence spacing | Two spaces after periods |
| Signature block | 4 lines below text, starts at page center (3.25") |
| Continuation pages | Subject in header, page number centered at bottom |

### 🔢 Smart Paragraph Numbering
Automatic hierarchical numbering with proper indentation:
- **Main paragraphs:** 1., 2., 3.
- **Sub-paragraphs:** a., b., c.
- **Sub-sub-paragraphs:** (1), (2), (3)
- **Sub-sub-sub-paragraphs:** (a), (b), (c)

### 🔄 Automatic Numbering
- **Via addressees** auto-number as (1), (2), (3), (4)
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
- **Two spaces after periods** - Type them yourself; the tool preserves them
- **Subject line** - Will be automatically capitalized
- **Paragraphs** - Click any paragraph to see action buttons for adding siblings or children
- **Drag to reorder** - Grab the ☰ handle to rearrange paragraphs

### Advanced Options

**Need a unit seal in your letter?**
1. Upload your seal image in the Letterhead section
2. Click "Download ZIP" instead of "Download PDF"
3. Upload the ZIP to [Overleaf.com](https://www.overleaf.com/) → New Project → Upload
4. Click "Recompile" → Download PDF

**Need pixel-perfect output?**
Use "Open in Overleaf" for precise LaTeX compilation. This produces the most accurate output but requires the extra Overleaf step.

---

## Known Limitations (Help Us Fix These!)

We're actively working on improvements. Current known issues:

- [ ] Direct PDF may have minor spacing differences from LaTeX output on complex multi-page letters
- [ ] Seal images only work through the Overleaf/ZIP workflow
- [ ] No save/load functionality yet (refresh = start over)
- [ ] Single letter format only (no endorsements or memoranda yet)

**See something else?** [Report it here](https://github.com/jeranaias/navalletterformat/issues)

---

## Roadmap - What's Next?

We're prioritizing based on user feedback. Current plans:

- [ ] Save/load letter drafts (localStorage)
- [ ] Seal support in direct PDF generation
- [ ] Endorsement letter format
- [ ] Memorandum format
- [ ] Spell check integration
- [ ] Print directly from browser
- [ ] Dark mode (for the night shift)

**Want to influence priorities?** [Vote on issues](https://github.com/jeranaias/navalletterformat/issues) or open a new one describing what you need.

---

## Frequently Asked Questions

**Q: Is this an official Marine Corps/Navy tool?**
A: No. This is a personal project created to help service members format correspondence correctly. Always verify your command's specific requirements.

**Q: Does this work on NMCI computers?**
A: Yes. It's a standard webpage that works in any browser. No installation or admin rights required.

**Q: Is my data saved anywhere?**
A: No. Everything runs in your browser. Nothing is transmitted to any server. When you close the page, your data is gone. (Save/load feature coming soon!)

**Q: Can I use this for classified correspondence?**
A: **No.** This is for UNCLASSIFIED use only. Never enter classified information into any web-based tool.

**Q: The PDF looks slightly different from Overleaf output.**
A: The direct PDF generator is optimized for speed and convenience. For the most precise output, use the "Open in Overleaf" option. We're working to close this gap.

**Q: Something looks wrong / doesn't match my command's format.**
A: [Please report it!](https://github.com/jeranaias/navalletterformat/issues) Include a screenshot and description of what you expected. Different commands sometimes have local variations, but if it's a SECNAV M-5216.5 compliance issue, we want to fix it.

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

**Created by:** SSgt Jesse Morgan, USMC
**Location:** Presidio of Monterey, California
**Status:** Active development - feedback welcome!

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
