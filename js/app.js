/**
 * Naval Letter Generator - Main Application
 * SECNAV M-5216.5 Compliant Correspondence Tool
 *
 * Version: 2.0
 * Author: Jesse Morgan
 */

/**
 * Initialize the application
 */
async function initApp() {
  console.log('Naval Letter Generator v2.0 initializing...');

  // Load external data (SSIC and unit databases)
  await loadData();

  // Initialize form event listeners
  initFormListeners();

  // Initialize search functionality
  initSearchListeners();

  console.log('Naval Letter Generator v2.0 ready!');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
