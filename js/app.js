/**
 * Naval Letter Generator - Main Application
 * SECNAV M-5216.5 Compliant Correspondence Tool
 *
 * Version: 3.1
 * Author: Jesse Morgan
 */

/**
 * Update offline indicator status
 */
function updateOfflineIndicator(status, text) {
  const indicator = document.getElementById('offlineIndicator');
  if (!indicator) return;

  indicator.classList.remove('ready', 'offline');
  indicator.classList.add(status);
  const textEl = indicator.querySelector('.indicator-text');
  if (textEl) textEl.textContent = text;
}

/**
 * Register service worker for offline support
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
          updateOfflineIndicator('ready', 'Ready offline');
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
          updateOfflineIndicator('offline', 'Online only');
        });
    });
  } else {
    updateOfflineIndicator('offline', 'Online only');
  }

  // Listen for online/offline events
  window.addEventListener('online', () => {
    updateOfflineIndicator('ready', 'Back online');
    setTimeout(() => updateOfflineIndicator('ready', 'Ready offline'), 2000);
  });

  window.addEventListener('offline', () => {
    updateOfflineIndicator('offline', 'Offline mode');
  });

  // Set initial status based on navigator.onLine
  if (!navigator.onLine) {
    updateOfflineIndicator('offline', 'Offline mode');
  }
}

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
 * Keyboard shortcuts handler
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Check for Ctrl/Cmd key
    const isMod = e.ctrlKey || e.metaKey;

    if (isMod && !e.shiftKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          // Ctrl+S - Export draft to file
          e.preventDefault();
          if (typeof exportDraft === 'function') {
            exportDraft();
            showStatus('success', 'Draft exported (Ctrl+S)');
          }
          break;
        case 'p':
          // Ctrl+P - Print PDF
          e.preventDefault();
          if (typeof printPDF === 'function') {
            printPDF();
          }
          break;
        case 'd':
          // Ctrl+D - Download PDF
          e.preventDefault();
          if (typeof generatePDF === 'function') {
            generatePDF();
          }
          break;
      }
    }

    // Escape key - close preview/modals
    if (e.key === 'Escape') {
      const preview = document.getElementById('previewSection');
      if (preview && preview.classList.contains('show')) {
        preview.classList.remove('show');
      }
    }
  });
}

/**
 * Initialize the application
 */
async function initApp() {
  console.log('Naval Letter Generator v3.1 initializing...');

  // Initialize theme immediately (visual)
  initTheme();

  // Initialize core form functionality first
  initFormListeners();
  initSearchListeners();
  initKeyboardShortcuts();

  // Load external data (SSIC and unit databases)
  await loadData();

  // Load templates
  await loadTemplates();

  // Initialize draft auto-save and restore
  initDraftManager();

  // Initialize template manager
  initTemplateManager();

  // Initialize undo/redo manager
  initUndoManager();

  // Defer non-critical initializations to avoid blocking
  requestAnimationFrame(() => {
    // Initialize live preview manager
    initPreviewManager();
    restorePreviewState();

    // Initialize import/export manager (Word import, recently used)
    if (typeof initImportExportManager === 'function') initImportExportManager();

    // Initialize batch generator
    if (typeof initBatchGeneratorModule === 'function') initBatchGeneratorModule();
  });

  // Use idle callback for enhanced features (spell check, char count)
  // These can run when browser is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      if (typeof initEnhancedFeatures === 'function') initEnhancedFeatures();
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      if (typeof initEnhancedFeatures === 'function') initEnhancedFeatures();
    }, 500);
  }

  // Register service worker last (non-blocking)
  registerServiceWorker();

  console.log('Naval Letter Generator v3.1 ready!');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
