/**
 * Naval Letter Generator - Draft Manager
 * Handles auto-save to localStorage and export/import of drafts
 */

const STORAGE_KEY = 'navalLetterDraft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds after last change

let autoSaveTimeout = null;

/**
 * Collect all form data into a serializable object
 */
function collectFormData() {
  const data = {
    version: '2.0',
    savedAt: new Date().toISOString(),

    // Document type
    docType: document.querySelector('.doc-type-option.selected')?.dataset.type || 'basic',

    // Header
    ssic: document.getElementById('ssicSearch')?.value || '',
    officeCode: document.getElementById('officeCode')?.value || '',
    date: document.getElementById('date')?.value || '',
    classification: document.getElementById('classification')?.value || '',
    branch: document.querySelector('input[name="branch"]:checked')?.value || 'USMC',

    // Letterhead (always true)
    unitName: document.getElementById('unitName')?.value || '',
    unitAddress: document.getElementById('unitAddress')?.value || '',

    // Addressing
    from: document.getElementById('from')?.value || '',
    to: document.getElementById('to')?.value || '',
    subj: document.getElementById('subj')?.value || '',

    // Endorsement
    endorseNumber: document.getElementById('endorseNumber')?.value || 'FIRST',
    endorseAction: document.getElementById('endorseAction')?.value || 'Forwarded',

    // Dynamic lists
    viaList: collectDynamicList('viaList'),
    refList: collectDynamicList('refList'),
    enclList: collectDynamicList('enclList'),
    copyList: collectDynamicList('copyList'),

    // Paragraphs
    paragraphs: collectParagraphs(),

    // Signature
    sigName: document.getElementById('sigName')?.value || '',
    byDirection: document.getElementById('byDirection')?.checked ?? false
  };

  return data;
}

/**
 * Collect values from a dynamic list container
 */
function collectDynamicList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  const items = [];
  container.querySelectorAll('input[type="text"]').forEach(input => {
    if (input.value.trim()) {
      items.push(input.value);
    }
  });
  return items;
}

/**
 * Collect paragraph data as flat array with type info
 */
function collectParagraphs() {
  const container = document.getElementById('paraContainer');
  if (!container) return [];

  const paragraphs = [];
  container.querySelectorAll('.para-item').forEach(item => {
    const textarea = item.querySelector('textarea');
    const subjInput = item.querySelector('input[name="paraSubj[]"]');
    paragraphs.push({
      type: item.dataset.type || 'para',
      subject: subjInput?.value || '',
      text: textarea?.value || ''
    });
  });

  return paragraphs;
}

/**
 * Restore form data from a saved object
 */
function restoreFormData(data) {
  if (!data || data.version !== '2.0') {
    console.warn('Invalid or incompatible draft data');
    return false;
  }

  try {
    // Document type
    if (data.docType) {
      selectDocType(data.docType);
    }

    // Header
    setInputValue('ssicSearch', data.ssic);
    setInputValue('officeCode', data.officeCode);
    setInputValue('date', data.date);
    setInputValue('classification', data.classification);

    // Branch
    if (data.branch) {
      const radio = document.querySelector(`input[name="branch"][value="${data.branch}"]`);
      if (radio) radio.checked = true;
    }

    // Letterhead
    setInputValue('unitName', data.unitName);
    setInputValue('unitAddress', data.unitAddress);

    // Addressing
    setInputValue('from', data.from);
    setInputValue('to', data.to);
    setInputValue('subj', data.subj);

    // Endorsement
    setInputValue('endorseNumber', data.endorseNumber);
    setInputValue('endorseAction', data.endorseAction);

    // Dynamic lists
    restoreDynamicList('viaList', data.viaList, addVia);
    restoreDynamicList('refList', data.refList, addRef);
    restoreDynamicList('enclList', data.enclList, addEncl);
    restoreDynamicList('copyList', data.copyList, addCopy);

    // Paragraphs
    restoreParagraphs(data.paragraphs);

    // Signature
    setInputValue('sigName', data.sigName);
    const byDirection = document.getElementById('byDirection');
    if (byDirection) byDirection.checked = data.byDirection ?? false;

    return true;
  } catch (err) {
    console.error('Error restoring draft:', err);
    return false;
  }
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) {
    el.value = value;
  }
}

function restoreDynamicList(containerId, items, addFn) {
  if (!items || !items.length) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing items
  container.innerHTML = '';

  // Add each item
  items.forEach(value => {
    addFn(); // This adds an empty input
    const inputs = container.querySelectorAll('input[type="text"]');
    const lastInput = inputs[inputs.length - 1];
    if (lastInput) lastInput.value = value;
  });
}

function restoreParagraphs(paragraphs) {
  if (!paragraphs || !paragraphs.length) return;

  const container = document.getElementById('paraContainer');
  if (!container) return;

  // Clear existing paragraphs
  container.innerHTML = '';

  // Check if paragraphs are in new flat format or old nested format
  if (paragraphs[0] && paragraphs[0].type !== undefined) {
    // New flat format with type
    paragraphs.forEach(para => {
      addParagraphWithType(container, para.type, para.text, para.subject || '');
    });
  } else {
    // Old nested format - flatten it
    flattenAndAddParagraphs(container, paragraphs, 'para');
  }

  // Update labels
  if (typeof updateParaLabels === 'function') {
    updateParaLabels();
  }
}

/**
 * Flatten nested paragraph structure and add to container
 */
function flattenAndAddParagraphs(container, paragraphs, type) {
  const types = ['para', 'subpara', 'subsubpara', 'subsubsubpara'];
  const typeIndex = types.indexOf(type);
  const childType = types[Math.min(typeIndex + 1, types.length - 1)];

  paragraphs.forEach(para => {
    addParagraphWithType(container, type, para.text);
    if (para.children && para.children.length > 0) {
      flattenAndAddParagraphs(container, para.children, childType);
    }
  });
}

/**
 * Add a single paragraph with specified type
 */
function addParagraphWithType(container, type, text, subject) {
  const div = document.createElement('div');
  div.className = 'para-item';
  div.draggable = true;
  div.dataset.type = type;

  // Only top-level paragraphs can have subjects
  const subjectField = type === 'para' ? `
    <div class="para-subject">
      <input type="text" name="paraSubj[]" placeholder="Subject (optional, will be underlined)" value="${subject || ''}" />
    </div>
  ` : '';

  div.innerHTML = `
    <span class="drag-handle">☰</span>
    <span class="para-label"></span>
    ${subjectField}
    <textarea name="para[]" data-type="${type}" placeholder="Enter paragraph text..." onclick="setActivePara(this)">${text || ''}</textarea>
    <div class="para-actions">
      <button type="button" class="btn" onclick="addSibling(this)">+ Same Level</button>
      <button type="button" class="btn" onclick="addChild(this)" ${type === 'subsubsubpara' ? 'disabled' : ''}>+ Indent</button>
      <button type="button" class="btn" onclick="addParent(this)" ${type === 'para' ? 'disabled' : ''}>← Outdent</button>
      <button type="button" class="btn btn-remove" onclick="removePara(this)">Delete</button>
    </div>
  `;

  // Add drag-drop listeners
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragend', handleDragEnd);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('dragleave', handleDragLeave);
  div.addEventListener('drop', handleDrop);

  container.appendChild(div);
}

/**
 * Save draft to localStorage
 */
function saveDraftToStorage() {
  try {
    const data = collectFormData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Draft auto-saved');
    return true;
  } catch (err) {
    console.error('Failed to save draft:', err);
    return false;
  }
}

/**
 * Load draft from localStorage
 */
function loadDraftFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load draft:', err);
    return null;
  }
}

/**
 * Clear saved draft from localStorage
 */
function clearDraftFromStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Schedule auto-save (debounced)
 */
function scheduleAutoSave() {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  autoSaveTimeout = setTimeout(saveDraftToStorage, AUTO_SAVE_DELAY);
}

/**
 * Export draft as downloadable JSON file
 */
function exportDraft() {
  const data = collectFormData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `naval-letter-draft-${formatDateForFilename()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus('Draft exported successfully', 'success');
}

function formatDateForFilename() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

/**
 * Import draft from JSON file
 */
function importDraft() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (restoreFormData(data)) {
          showStatus('Draft loaded successfully', 'success');
          saveDraftToStorage(); // Update auto-save with loaded data
        } else {
          showStatus('Failed to load draft - invalid format', 'error');
        }
      } catch (err) {
        showStatus('Failed to parse draft file', 'error');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

/**
 * Initialize draft manager
 */
function initDraftManager() {
  // Check for saved draft on load
  const savedDraft = loadDraftFromStorage();
  if (savedDraft) {
    const savedDate = new Date(savedDraft.savedAt);
    const timeAgo = getTimeAgo(savedDate);

    // Show restore prompt
    if (confirm(`Found a saved draft from ${timeAgo}. Would you like to restore it?`)) {
      restoreFormData(savedDraft);
      showStatus('Draft restored', 'success');
    }
  }

  // Set up auto-save on form changes
  document.getElementById('letterForm')?.addEventListener('input', scheduleAutoSave);
  document.getElementById('letterForm')?.addEventListener('change', scheduleAutoSave);
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    collectFormData,
    restoreFormData,
    saveDraftToStorage,
    loadDraftFromStorage,
    clearDraftFromStorage,
    exportDraft,
    importDraft,
    initDraftManager
  };
}
