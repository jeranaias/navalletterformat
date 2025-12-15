/**
 * Naval Letter Generator - User Profile Manager
 * Session-only storage with file import/export for portability
 *
 * SECURITY: Profile data is stored in sessionStorage ONLY.
 * - Data is cleared when browser tab/window closes
 * - No data persists on the computer after session ends
 * - Users can save/load profiles from their own files
 */

// Profile storage key (sessionStorage - clears on browser close)
const PROFILE_STORAGE_KEY = 'navalLetterUserProfile';

/**
 * Default profile structure
 */
const DEFAULT_PROFILE = {
  // Personal info
  name: '',           // Signature name (e.g., "J. M. SMITH")
  rank: '',           // e.g., "Capt", "GySgt"
  billet: '',         // e.g., "Commanding Officer"

  // Unit info
  unitService: 'UNITED STATES MARINE CORPS',
  unitName: '',       // e.g., "MARINE CORPS DETACHMENT"
  unitAddress: '',    // Full address block

  // Default From line (combines billet + unit)
  fromLine: '',       // e.g., "Commanding Officer, Marine Corps Detachment"

  // Contact info
  phone: '',          // DSN or commercial
  email: '',          // mil email

  // Preferences
  byDirection: false,
  officeCode: ''
};

/**
 * Load profile from sessionStorage (session-only)
 * @returns {Object} User profile
 */
function loadUserProfile() {
  try {
    const saved = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load user profile:', e);
  }
  return { ...DEFAULT_PROFILE };
}

/**
 * Save profile to sessionStorage (session-only, clears on browser close)
 * @param {Object} profile - Profile data to save
 */
function saveUserProfile(profile) {
  try {
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    showStatus('success', 'Profile saved for this session. Export to file for permanent storage.');
    return true;
  } catch (e) {
    console.error('Failed to save profile:', e);
    showStatus('error', 'Failed to save profile');
    return false;
  }
}

/**
 * Clear saved profile from session
 */
function clearUserProfile() {
  try {
    sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    showStatus('success', 'Profile cleared from session');
  } catch (e) {
    console.error('Failed to clear profile:', e);
  }
}

/**
 * Export profile to a JSON file (user saves to their own storage)
 */
function exportProfileToFile() {
  const profile = getProfileFromModal();

  // Check if profile has any data
  const hasData = Object.values(profile).some(v => v && v !== 'UNITED STATES MARINE CORPS' && v !== false);
  if (!hasData) {
    showStatus('warning', 'No profile data to export');
    return;
  }

  const dataStr = JSON.stringify(profile, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'naval-letter-profile.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus('success', 'Profile exported. Save this file to your personal storage.');
}

/**
 * Import profile from a JSON file
 */
function importProfileFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const profile = JSON.parse(event.target.result);

        // Validate it looks like a profile
        if (typeof profile !== 'object') {
          throw new Error('Invalid profile format');
        }

        // Merge with defaults and populate modal
        const mergedProfile = { ...DEFAULT_PROFILE, ...profile };
        populateProfileModal(mergedProfile);

        // Also save to session
        saveUserProfile(mergedProfile);

        showStatus('success', 'Profile loaded from file');
      } catch (err) {
        console.error('Failed to import profile:', err);
        showStatus('error', 'Invalid profile file. Please select a valid JSON profile.');
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

/**
 * Get profile data from modal form fields
 * @returns {Object} Profile data
 */
function getProfileFromModal() {
  return {
    name: document.getElementById('profileName')?.value?.trim() || '',
    rank: document.getElementById('profileRank')?.value?.trim() || '',
    billet: document.getElementById('profileBillet')?.value?.trim() || '',
    unitService: document.getElementById('profileUnitService')?.value?.trim() || 'UNITED STATES MARINE CORPS',
    unitName: document.getElementById('profileUnitName')?.value?.trim() || '',
    unitAddress: document.getElementById('profileUnitAddress')?.value?.trim() || '',
    fromLine: document.getElementById('profileFromLine')?.value?.trim() || '',
    phone: document.getElementById('profilePhone')?.value?.trim() || '',
    email: document.getElementById('profileEmail')?.value?.trim() || '',
    officeCode: document.getElementById('profileOfficeCode')?.value?.trim() || '',
    byDirection: document.getElementById('profileByDirection')?.checked || false
  };
}

/**
 * Populate modal form fields from profile data
 * @param {Object} profile - Profile data
 */
function populateProfileModal(profile) {
  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('profileRank').value = profile.rank || '';
  document.getElementById('profileBillet').value = profile.billet || '';
  document.getElementById('profileUnitService').value = profile.unitService || 'UNITED STATES MARINE CORPS';
  document.getElementById('profileUnitName').value = profile.unitName || '';
  document.getElementById('profileUnitAddress').value = profile.unitAddress || '';
  document.getElementById('profileFromLine').value = profile.fromLine || '';
  document.getElementById('profilePhone').value = profile.phone || '';
  document.getElementById('profileEmail').value = profile.email || '';
  document.getElementById('profileOfficeCode').value = profile.officeCode || '';
  document.getElementById('profileByDirection').checked = profile.byDirection || false;
}

/**
 * Open profile modal
 */
function openProfileModal() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;

  // Load current profile into form
  const profile = loadUserProfile();
  populateProfileModal(profile);

  modal.classList.add('show');
}

/**
 * Close profile modal
 */
function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * Save profile from modal form
 */
function saveProfileFromModal() {
  const profile = getProfileFromModal();

  if (saveUserProfile(profile)) {
    closeProfileModal();
  }
}

/**
 * Apply saved profile to form (called on page load or manually)
 */
function applyProfileToForm() {
  const profile = loadUserProfile();

  // Only apply if profile has data
  if (!profile.name && !profile.fromLine && !profile.unitName) {
    return; // No profile saved yet
  }

  // Check if form fields are empty before populating
  const sigNameField = document.getElementById('sigName');
  const fromField = document.getElementById('from');
  const unitNameField = document.getElementById('unitName');
  const unitAddressField = document.getElementById('unitAddress');
  const officeCodeField = document.getElementById('officeCode');
  const byDirectionField = document.getElementById('byDirection');

  // Only fill empty fields (don't override user's current work)
  if (sigNameField && !sigNameField.value && profile.name) {
    sigNameField.value = profile.name;
  }

  if (fromField && !fromField.value && profile.fromLine) {
    fromField.value = profile.fromLine;
  }

  if (unitNameField && !unitNameField.value.includes('DETACHMENT') && profile.unitService) {
    unitNameField.value = profile.unitService;
  }

  if (unitAddressField && !unitAddressField.value && profile.unitName) {
    // Combine unit name and address
    let fullAddress = profile.unitName;
    if (profile.unitAddress) {
      fullAddress += '\n' + profile.unitAddress;
    }
    unitAddressField.value = fullAddress;
  }

  if (officeCodeField && !officeCodeField.value && profile.officeCode) {
    officeCodeField.value = profile.officeCode;
  }

  if (byDirectionField && profile.byDirection) {
    byDirectionField.checked = true;
  }
}

/**
 * Auto-generate From line from billet and unit
 */
function autoGenerateFromLine() {
  const billet = document.getElementById('profileBillet').value.trim();
  const unitName = document.getElementById('profileUnitName').value.trim();
  const fromField = document.getElementById('profileFromLine');

  if (billet && unitName && fromField) {
    // Only auto-generate if from line is empty
    if (!fromField.value) {
      fromField.value = `${billet}, ${unitName}`;
    }
  }
}

/**
 * Fill current form data into profile modal (capture from form)
 */
function captureFormToProfile() {
  const sigName = document.getElementById('sigName').value.trim();
  const from = document.getElementById('from').value.trim();
  const unitName = document.getElementById('unitName').value.trim();
  const unitAddress = document.getElementById('unitAddress').value.trim();
  const officeCode = document.getElementById('officeCode').value.trim();
  const byDirection = document.getElementById('byDirection').checked;

  // Parse unit address into name and address parts
  const addressLines = unitAddress.split('\n');
  const parsedUnitName = addressLines[0] || '';
  const parsedAddress = addressLines.slice(1).join('\n');

  // Fill profile modal with captured data
  if (sigName) document.getElementById('profileName').value = sigName;
  if (from) document.getElementById('profileFromLine').value = from;
  if (unitName) document.getElementById('profileUnitService').value = unitName;
  if (parsedUnitName) document.getElementById('profileUnitName').value = parsedUnitName;
  if (parsedAddress) document.getElementById('profileUnitAddress').value = parsedAddress;
  if (officeCode) document.getElementById('profileOfficeCode').value = officeCode;
  document.getElementById('profileByDirection').checked = byDirection;
}

/**
 * Initialize profile manager
 */
function initializeProfileManager() {
  // Apply saved profile on load (after a short delay to let form initialize)
  setTimeout(() => {
    applyProfileToForm();
  }, 100);

  // Set up modal close on background click
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProfileModal();
      }
    });
  }

  // Set up auto-generate from line
  const billetField = document.getElementById('profileBillet');
  const unitNameField = document.getElementById('profileUnitName');
  if (billetField) billetField.addEventListener('blur', autoGenerateFromLine);
  if (unitNameField) unitNameField.addEventListener('blur', autoGenerateFromLine);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfileManager);
} else {
  initializeProfileManager();
}
