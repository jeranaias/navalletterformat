# Naval Letter Test Generator

This package generates example naval letters for verifying PDF output matches HTML preview.

## Quick Start

```bash
npm install
npm run generate
```

This creates PDFs in the `examples/` directory.

## Files

- `generate_examples.js` - Node script that generates sample PDFs
- `sample_letters.json` - Sample data in JSON format (use to populate web form)
- `DATA_SOURCES_GUIDE.md` - Guide for obtaining SSIC and unit data
- `data/` - Starter data files (ssic.json, units.json)

## Usage

### Option 1: Generate Reference PDFs
```bash
npm run generate
```
Then compare these PDFs against what the HTML generator produces.

### Option 2: Load Sample Data into Web Form
1. Open `sample_letters.json`
2. Copy values from any example into the web form
3. Generate PDF and compare

### Verification Checklist
See `sample_letters.json` for the full verification checklist covering:
- Margin measurements
- Font sizes
- Line spacing
- Element positioning
- Continuation page format

## For Claude Code

When implementing v2.0:
1. Use `sample_letters.json` examples as test cases
2. Generate PDFs with each example
3. Verify output matches the measurements in `generate_examples.js`
4. Check all items in verificationChecklist
