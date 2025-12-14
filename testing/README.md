# Testing Resources

This folder contains test data and tools for the Naval Letter Generator.

## Structure

```
testing/
├── drafts/           # Sample draft JSON files for testing draft save/load
│   ├── test-draft-3page.json
│   ├── test-draft-endorsement.json
│   └── test-draft-with-subjects.json
│
└── testing/          # PDF generation tool for verification
    ├── generate_examples.js    # Generates reference PDFs
    ├── sample_letters.json     # Test letter data
    └── data/                   # Source data files
```

## Draft Files

The `drafts/` folder contains sample JSON files that can be loaded via the "Load Draft" button to test various letter formats:

- **test-draft-3page.json** - Multi-page basic letter
- **test-draft-endorsement.json** - Endorsement format example
- **test-draft-with-subjects.json** - Letter with paragraph subjects

## PDF Generation Tool

The `testing/` subfolder is a standalone npm package for generating reference PDFs. See `testing/README.md` for details.

```bash
cd testing/testing
npm install
npm run generate
```
