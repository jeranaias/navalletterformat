/**
 * Naval Letter Generator - Data Manager
 * Handles SSIC and Unit database loading and searching
 */

// Data stores
let SSIC_DATABASE = [];
let UNIT_DATABASE = [];
let dataLoaded = false;

/**
 * Load data from external JSON files
 * Falls back to inline data if fetch fails
 */
async function loadData() {
  try {
    // Try to load from external files
    const [ssicResponse, unitsResponse] = await Promise.all([
      fetch('data/ssic.json'),
      fetch('data/units.json')
    ]);

    if (ssicResponse.ok) {
      const ssicData = await ssicResponse.json();
      SSIC_DATABASE = ssicData.codes.map(c => ({
        code: c.code,
        desc: c.title
      }));
      console.log(`Loaded ${SSIC_DATABASE.length} SSICs from external file`);
    }

    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json();
      UNIT_DATABASE = unitsData.units.map(u => ({
        name: u.name,
        address: u.address,
        service: u.service
      }));
      console.log(`Loaded ${UNIT_DATABASE.length} units from external file`);
    }

    dataLoaded = true;
  } catch (err) {
    console.warn('Could not load external data files, using inline data:', err);
    // Data will remain as initialized (empty or inline fallback)
  }
}

/**
 * Search SSIC database
 * @param {string} query - Search term
 * @returns {Array} - Matching SSIC codes
 */
function searchSSIC(query) {
  if (!query || query.length < 1) return [];

  const q = query.toLowerCase().trim();
  return SSIC_DATABASE.filter(s =>
    s.code.includes(q) || s.desc.toLowerCase().includes(q)
  ).slice(0, 12);
}

/**
 * Search unit database
 * @param {string} query - Search term
 * @returns {Array} - Matching units
 */
function searchUnits(query) {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase().trim();
  return UNIT_DATABASE.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.address.toLowerCase().includes(q)
  ).slice(0, 10);
}

/**
 * Handle SSIC search input
 */
function handleSSICSearch() {
  const input = document.getElementById('ssicSearch');
  const results = document.getElementById('ssicResults');
  const query = input.value.toLowerCase().trim();

  if (query.length < 1) {
    results.classList.remove('show');
    return;
  }

  const matches = searchSSIC(query);

  if (matches.length > 0) {
    results.innerHTML = matches.map(s => `
      <div class="search-result-item" onmousedown="selectSSIC('${s.code}', '${s.desc.replace(/'/g, "\\'")}')">
        <div class="code">${s.code}</div>
        <div class="desc">${s.desc}</div>
      </div>
    `).join('');
    results.classList.add('show');
  } else {
    results.innerHTML = '<div class="search-result-item"><div class="desc">No matches found</div></div>';
    results.classList.add('show');
  }
}

/**
 * Select SSIC from search results
 * @param {string} code - SSIC code
 * @param {string} desc - SSIC description (unused but available)
 */
function selectSSIC(code, desc) {
  document.getElementById('ssicSearch').value = code;
  document.getElementById('ssicResults').classList.remove('show');
}

/**
 * Handle unit search input
 */
function handleUnitSearch() {
  const input = document.getElementById('unitSearch');
  const results = document.getElementById('unitResults');
  const query = input.value.toLowerCase().trim();

  if (query.length < 2) {
    results.classList.remove('show');
    return;
  }

  const matches = searchUnits(query);

  if (matches.length > 0) {
    results.innerHTML = matches.map((u, i) => `
      <div class="search-result-item" onmousedown="selectUnit(${i}, '${query.replace(/'/g, "\\'")}')">
        <div class="code">${u.name}</div>
        <div class="desc">${u.address.replace(/\n/g, ' · ')}</div>
      </div>
    `).join('');
    results.classList.add('show');
  } else {
    results.classList.remove('show');
  }
}

/**
 * Map service abbreviation to full name for letterhead
 */
const SERVICE_FULL_NAMES = {
  'USMC': 'UNITED STATES MARINE CORPS',
  'USN': 'UNITED STATES NAVY',
  'DOD': 'DEPARTMENT OF DEFENSE',
  'DON': 'DEPARTMENT OF THE NAVY'
};

/**
 * Select unit from search results
 * @param {number} index - Index in filtered results
 * @param {string} query - Original search query
 */
function selectUnit(index, query) {
  const matches = searchUnits(query);
  const unit = matches[index];

  if (unit) {
    const fullServiceName = SERVICE_FULL_NAMES[unit.service] || unit.service;
    document.getElementById('unitName').value = fullServiceName;
    document.getElementById('unitAddress').value = unit.name + '\n' + unit.address;
    document.getElementById('unitSearch').value = '';
  }

  document.getElementById('unitResults').classList.remove('show');
}

/**
 * Initialize search event listeners
 */
function initSearchListeners() {
  // SSIC Search
  const ssicInput = document.getElementById('ssicSearch');
  ssicInput.addEventListener('input', handleSSICSearch);
  ssicInput.addEventListener('focus', handleSSICSearch);

  // Unit Search
  const unitInput = document.getElementById('unitSearch');
  unitInput.addEventListener('input', handleUnitSearch);
  unitInput.addEventListener('focus', handleUnitSearch);

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#ssicSearch') && !e.target.closest('#ssicResults')) {
      document.getElementById('ssicResults').classList.remove('show');
    }
    if (!e.target.closest('#unitSearch') && !e.target.closest('#unitResults')) {
      document.getElementById('unitResults').classList.remove('show');
    }
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadData,
    searchSSIC,
    searchUnits,
    handleSSICSearch,
    handleUnitSearch,
    selectSSIC,
    selectUnit,
    initSearchListeners,
    get SSIC_DATABASE() { return SSIC_DATABASE; },
    get UNIT_DATABASE() { return UNIT_DATABASE; }
  };
}
