/**
 * Naval Letter Generator - Reference Library
 * Searchable database of common MCOs, SECNAVINSTs, and other references
 */

// Reference data (loaded from JSON)
let referenceData = null;

/**
 * Load reference data from JSON file
 */
async function loadReferenceData() {
  try {
    const response = await fetch('data/references.json');
    referenceData = await response.json();
  } catch (e) {
    console.error('Failed to load reference data:', e);
    referenceData = { references: [], categories: [] };
  }
}

/**
 * Search references by keyword or number
 * @param {string} query - Search query
 * @returns {Array} Matching references
 */
function searchReferences(query) {
  if (!referenceData || !query) return [];

  query = query.toLowerCase().trim();

  return referenceData.references.filter(ref => {
    // Search in number
    if (ref.number.toLowerCase().includes(query)) return true;

    // Search in title
    if (ref.title.toLowerCase().includes(query)) return true;

    // Search in short title
    if (ref.shortTitle && ref.shortTitle.toLowerCase().includes(query)) return true;

    // Search in keywords
    if (ref.keywords && ref.keywords.some(kw => kw.toLowerCase().includes(query))) return true;

    // Search in type
    if (ref.type.toLowerCase().includes(query)) return true;

    return false;
  }).slice(0, 10); // Limit results
}

/**
 * Format reference for display in naval letter
 * @param {Object} ref - Reference object
 * @returns {string} Formatted reference string
 */
function formatReference(ref) {
  if (ref.type === 'U.S. Navy Regulations') {
    return `${ref.number}, ${ref.type}`;
  }
  if (ref.type === 'Manual') {
    return ref.number;
  }
  return `${ref.type} ${ref.number}`;
}

/**
 * Open reference library modal
 */
function openReferenceLibrary() {
  const modal = document.getElementById('refLibraryModal');
  if (!modal) return;

  // Clear previous search
  const searchInput = document.getElementById('refLibrarySearch');
  const resultsContainer = document.getElementById('refLibraryResults');

  if (searchInput) searchInput.value = '';
  if (resultsContainer) resultsContainer.innerHTML = renderCategoryBrowse();

  modal.classList.add('show');

  // Focus search input
  setTimeout(() => searchInput?.focus(), 100);
}

/**
 * Close reference library modal
 */
function closeReferenceLibrary() {
  const modal = document.getElementById('refLibraryModal');
  if (modal) modal.classList.remove('show');
}

/**
 * Render category browse view
 */
function renderCategoryBrowse() {
  if (!referenceData) return '<p>Loading references...</p>';

  const categories = referenceData.categories || [];
  let html = '<div class="ref-categories">';

  categories.forEach(cat => {
    const count = referenceData.references.filter(r => r.category === cat).length;
    html += `
      <button type="button" class="ref-category-btn" onclick="filterByCategory('${cat}')">
        <span class="cat-name">${cat}</span>
        <span class="cat-count">${count}</span>
      </button>
    `;
  });

  html += '</div>';
  html += '<p class="ref-hint">Click a category or search above</p>';
  return html;
}

/**
 * Filter references by category
 * @param {string} category - Category to filter by
 */
function filterByCategory(category) {
  if (!referenceData) return;

  const refs = referenceData.references.filter(r => r.category === category);
  renderSearchResults(refs, `${category} References`);
}

/**
 * Handle search input
 */
function handleRefLibrarySearch(e) {
  const query = e.target.value.trim();

  if (query.length < 2) {
    document.getElementById('refLibraryResults').innerHTML = renderCategoryBrowse();
    return;
  }

  const results = searchReferences(query);
  renderSearchResults(results, results.length > 0 ? `Results for "${query}"` : 'No matches found');
}

/**
 * Render search results
 * @param {Array} refs - Reference objects
 * @param {string} title - Results title
 * @param {boolean} showBackButton - Whether to show back button
 */
function renderSearchResults(refs, title, showBackButton = true) {
  const container = document.getElementById('refLibraryResults');
  if (!container) return;

  let html = '';

  // Add back button to return to category browse
  if (showBackButton) {
    html += `<button type="button" class="ref-back-btn" onclick="showCategoryBrowse()">← All Categories</button>`;
  }

  html += `<h4 class="ref-results-title">${title}</h4>`;

  if (refs.length === 0) {
    html += '<p class="ref-no-results">Try a different search term</p>';
  } else {
    html += '<div class="ref-results-list">';
    refs.forEach(ref => {
      html += `
        <div class="ref-result-item" onclick="addReferenceToForm('${ref.id}')">
          <div class="ref-item-main">
            <span class="ref-item-number">${formatReference(ref)}</span>
            <span class="ref-item-title">${ref.shortTitle || ref.title}</span>
          </div>
          <div class="ref-item-full">${ref.title}</div>
          <div class="ref-item-actions">
            <button type="button" class="ref-add-btn" onclick="event.stopPropagation();addReferenceToForm('${ref.id}')">+ Add</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

/**
 * Show category browse view
 */
function showCategoryBrowse() {
  const container = document.getElementById('refLibraryResults');
  const searchInput = document.getElementById('refLibrarySearch');

  if (container) container.innerHTML = renderCategoryBrowse();
  if (searchInput) searchInput.value = '';
}

/**
 * Add reference to form
 * @param {string} refId - Reference ID
 */
function addReferenceToForm(refId) {
  const ref = referenceData?.references.find(r => r.id === refId);
  if (!ref) return;

  const formattedRef = formatReference(ref);

  // Add to reference list
  addRef(); // This creates a new reference input

  // Get the last added reference input and fill it
  const refList = document.getElementById('refList');
  const inputs = refList?.querySelectorAll('input[name="ref[]"]');
  if (inputs && inputs.length > 0) {
    const lastInput = inputs[inputs.length - 1];
    lastInput.value = formattedRef;
    lastInput.focus();
  }

  // Show success feedback
  showStatus('success', `Added: ${formattedRef}`);

  // Close modal
  closeReferenceLibrary();

  // Update preview if active
  if (typeof updatePreview === 'function') {
    updatePreview();
  }
}

/**
 * Get references by category
 * @param {string} category - Category name
 * @returns {Array} References in that category
 */
function getReferencesByCategory(category) {
  if (!referenceData) return [];
  return referenceData.references.filter(r => r.category === category);
}

/**
 * Initialize reference library
 */
function initializeReferenceLibrary() {
  loadReferenceData();

  // Set up modal close on background click
  const modal = document.getElementById('refLibraryModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeReferenceLibrary();
      }
    });
  }

  // Set up search input handler
  const searchInput = document.getElementById('refLibrarySearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleRefLibrarySearch);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReferenceLibrary);
} else {
  initializeReferenceLibrary();
}
