#!/usr/bin/env node

/**
 * Naval Letter Generator - Build Script
 *
 * Bundles all CSS, JS, and JSON data into a single portable HTML file
 * for NMCI/offline users.
 *
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

console.log('Building Naval Letter Generator...\n');

// Read all source files
const files = {
  html: fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
  css: fs.readFileSync(path.join(ROOT, 'css', 'styles.css'), 'utf8'),
  utils: fs.readFileSync(path.join(ROOT, 'js', 'utils.js'), 'utf8'),
  dataManager: fs.readFileSync(path.join(ROOT, 'js', 'data-manager.js'), 'utf8'),
  formHandler: fs.readFileSync(path.join(ROOT, 'js', 'form-handler.js'), 'utf8'),
  latexGenerator: fs.readFileSync(path.join(ROOT, 'js', 'latex-generator.js'), 'utf8'),
  pdfGenerator: fs.readFileSync(path.join(ROOT, 'js', 'pdf-generator.js'), 'utf8'),
  draftManager: fs.readFileSync(path.join(ROOT, 'js', 'draft-manager.js'), 'utf8'),
  app: fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8'),
  ssicData: fs.readFileSync(path.join(ROOT, 'data', 'ssic.json'), 'utf8'),
  unitsData: fs.readFileSync(path.join(ROOT, 'data', 'units.json'), 'utf8'),
  seal: fs.readFileSync(path.join(ROOT, 'assets', 'DOW-Seal-BW.jpg'))
};

// Convert seal to base64 data URL
const sealBase64 = 'data:image/jpeg;base64,' + files.seal.toString('base64');

console.log('Read source files:');
console.log(`  - index.html: ${files.html.length} bytes`);
console.log(`  - styles.css: ${files.css.length} bytes`);
console.log(`  - utils.js: ${files.utils.length} bytes`);
console.log(`  - data-manager.js: ${files.dataManager.length} bytes`);
console.log(`  - form-handler.js: ${files.formHandler.length} bytes`);
console.log(`  - latex-generator.js: ${files.latexGenerator.length} bytes`);
console.log(`  - pdf-generator.js: ${files.pdfGenerator.length} bytes`);
console.log(`  - draft-manager.js: ${files.draftManager.length} bytes`);
console.log(`  - app.js: ${files.app.length} bytes`);
console.log(`  - ssic.json: ${files.ssicData.length} bytes`);
console.log(`  - units.json: ${files.unitsData.length} bytes`);

// Parse JSON data
const ssicData = JSON.parse(files.ssicData);
const unitsData = JSON.parse(files.unitsData);

// Create inline data script that pre-populates the databases and seal
const inlineDataScript = `
// Pre-loaded SSIC Database (${ssicData.codes.length} codes)
SSIC_DATABASE = ${JSON.stringify(ssicData.codes.map(c => ({ code: c.code, desc: c.title })))};

// Pre-loaded Unit Database (${unitsData.units.length} units)
UNIT_DATABASE = ${JSON.stringify(unitsData.units.map(u => ({ name: u.name, address: u.address, service: u.service })))};

// Pre-loaded DON Seal (bundled as base64)
sealData = '${sealBase64}';
sealLoaded = true;

// Mark data as loaded (skip async fetch)
dataLoaded = true;
console.log('Using bundled data: ' + SSIC_DATABASE.length + ' SSICs, ' + UNIT_DATABASE.length + ' units');
console.log('Using bundled DON seal');
`;

// Combine all JS (excluding module.exports sections)
function stripModuleExports(code) {
  return code.replace(/\/\/ Export for module usage[\s\S]*?module\.exports[\s\S]*?\};?\s*\}?\s*$/m, '');
}

const combinedJS = [
  stripModuleExports(files.utils),
  stripModuleExports(files.dataManager),
  inlineDataScript,  // Inject data after data-manager defines the variables
  stripModuleExports(files.formHandler),
  stripModuleExports(files.latexGenerator),
  stripModuleExports(files.pdfGenerator),
  stripModuleExports(files.draftManager),
  stripModuleExports(files.app)
].join('\n\n');

// Build the bundled HTML
let bundledHTML = files.html;

// Replace external CSS link with inline style
bundledHTML = bundledHTML.replace(
  '<link rel="stylesheet" href="css/styles.css">',
  `<style>\n${files.css}\n  </style>`
);

// Replace external JS scripts with inline script
const jsScriptTags = `
  <script src="js/utils.js"></script>
  <script src="js/data-manager.js"></script>
  <script src="js/form-handler.js"></script>
  <script src="js/latex-generator.js"></script>
  <script src="js/pdf-generator.js"></script>
  <script src="js/app.js"></script>`;

bundledHTML = bundledHTML.replace(
  /<!-- Application Scripts -->[\s\S]*?<script src="js\/app\.js"><\/script>/,
  `<!-- Bundled Application Script -->
  <script>
${combinedJS}
  </script>`
);

// Add build info comment
const buildInfo = `<!--
  Naval Letter Generator v2.0 - Bundled Version
  Built: ${new Date().toISOString()}
  Source: https://github.com/jeranaias/navalletterformat

  This is a self-contained single-file version for offline/NMCI use.
  For development, see the source repository.
-->
`;

bundledHTML = bundledHTML.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n${buildInfo}`);

// Write bundled file
const outputPath = path.join(DIST, 'naval-letter.html');
fs.writeFileSync(outputPath, bundledHTML, 'utf8');

// Calculate sizes
const originalSize = files.html.length + files.css.length +
  files.utils.length + files.dataManager.length + files.formHandler.length +
  files.latexGenerator.length + files.pdfGenerator.length + files.draftManager.length +
  files.app.length + files.ssicData.length + files.unitsData.length;
const bundledSize = bundledHTML.length;

console.log('\nBuild complete!');
console.log(`  Output: ${outputPath}`);
console.log(`  Original total: ${(originalSize / 1024).toFixed(1)} KB`);
console.log(`  Bundled size: ${(bundledSize / 1024).toFixed(1)} KB`);
console.log(`\nThe bundled file is ready for offline/NMCI use.`);
