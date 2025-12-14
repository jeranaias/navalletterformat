/**
 * Naval Letter Generator - Main Application
 * SECNAV M-5216.5 Compliant Correspondence Tool
 *
 * Version: 2.0
 * Author: Jesse Morgan
 */
/**
 * Theme toggle functionality
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☽' : '☀';
  }
}

function initTheme() {
  // Check for saved preference, then system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(theme);
}

/**
 * Initialize the application
 */
async function initApp() {
  console.log('Naval Letter Generator v2.0 initializing...');

  // Initialize theme
  initTheme();

  // Load external data (SSIC and unit databases)
  await loadData();

  // Initialize form event listeners
  initFormListeners();

  // Initialize search functionality
  initSearchListeners();

  // Initialize draft auto-save and restore
  initDraftManager();

  console.log('Naval Letter Generator v2.0 ready!');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);