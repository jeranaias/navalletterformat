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
    branch: 'USMC', // Marine Corps only

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
    const editor = item.querySelector('.para-editor');
    const subjInput = item.querySelector('.para-subject-input');
    paragraphs.push({
      type: item.dataset.type || 'para',
      subject: subjInput?.value || '',
      text: editor?.innerText.trim() || '',
      html: editor?.innerHTML || ''
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
    // New flat format with type - use html if available, otherwise text
    paragraphs.forEach(para => {
      addParagraphWithType(container, para.type, para.html || para.text, para.subject || '');
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
function addParagraphWithType(container, type, content, subject) {
  const div = document.createElement('div');
  div.className = 'para-item';
  div.draggable = true;
  div.dataset.type = type;

  // Only top-level paragraphs can have subjects
  const subjectField = type === 'para' ? `
    <input type="text" name="paraSubj[]" class="para-subject-input" placeholder="Subject (optional, underlined)" aria-label="Paragraph subject" value="${subject || ''}" />
  ` : '';

  // Portion marking selector (check global setting)
  const portionDisplay = (typeof portionMarkingEnabled !== 'undefined' && portionMarkingEnabled) ? 'inline-block' : 'none';
  const portionSelector = `
    <select class="portion-selector" style="display: ${portionDisplay};" title="Portion marking" aria-label="Portion marking">
      <option value="U">(U)</option>
      <option value="CUI">(CUI)</option>
      <option value="FOUO">(FOUO)</option>
    </select>
  `;

  // Use HTML content if it looks like HTML, otherwise use plain text
  const editorContent = content && content.includes('<') ? content : (content || '');

  div.innerHTML = `
    <div class="para-left-controls">
      <span class="drag-handle" title="Drag to reorder" aria-hidden="true">☰</span>
      <div class="para-inline-actions">
        <button type="button" class="para-action-btn" onclick="addSibling(this)" title="Add paragraph below" aria-label="Add paragraph below">+</button>
        <button type="button" class="para-action-btn" onclick="addChild(this)" title="Add sub-paragraph" aria-label="Add sub-paragraph" ${type === 'subsubsubpara' ? 'disabled' : ''}>↳</button>
        <button type="button" class="para-action-btn para-action-delete" onclick="removePara(this)" title="Delete paragraph" aria-label="Delete paragraph">×</button>
      </div>
    </div>
    <div class="para-main">
      ${portionSelector}
      <span class="para-label" aria-hidden="true"></span>
      ${subjectField}
      <div class="para-editor-wrapper">
        <div class="para-toolbar">
          <button type="button" class="toolbar-btn" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
          <button type="button" class="toolbar-btn" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
          <button type="button" class="toolbar-btn" data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
          <button type="button" class="toolbar-btn" data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>
          <span class="toolbar-divider"></span>
          <select class="toolbar-select toolbar-font" data-cmd="fontName" title="Font">
            <option value="Times New Roman">Times</option>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier</option>
            <option value="Georgia">Georgia</option>
          </select>
          <select class="toolbar-select toolbar-size" data-cmd="fontSize" title="Size">
            <option value="1">8</option>
            <option value="2">10</option>
            <option value="3" selected>12</option>
            <option value="4">14</option>
            <option value="5">18</option>
          </select>
          <span class="toolbar-divider"></span>
          <button type="button" class="toolbar-btn toolbar-clear" data-action="clearFormat" title="Clear Formatting">✕</button>
          <button type="button" class="toolbar-btn toolbar-collapse" data-action="collapse" title="Collapse Toolbar">▲</button>
        </div>
        <div class="para-editor" contenteditable="true" data-type="${type}" data-placeholder="Enter paragraph text..." spellcheck="true">${editorContent}</div>
        <div class="para-editor-footer">
          <span class="word-count">0 words</span>
          <span class="char-count">0 chars</span>
        </div>
      </div>
    </div>
  `;

  // Add drag-drop listeners
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragend', handleDragEnd);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('dragleave', handleDragLeave);
  div.addEventListener('drop', handleDrop);

  container.appendChild(div);

  // Initialize the editor
  const editor = div.querySelector('.para-editor');
  if (typeof initParaEditor === 'function') {
    initParaEditor(editor);
  }
}

/**
 * Save draft to localStorage
 */
function saveDraftToStorage() {
  try {
    const data = collectFormData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

          // Check layout after importing
          setTimeout(() => {
            if (typeof checkLayoutWarnings === 'function') {
              checkLayoutWarnings();
            }
          }, 500);
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

      // Check layout after restoring draft
      setTimeout(() => {
        if (typeof checkLayoutWarnings === 'function') {
          checkLayoutWarnings();
        }
      }, 500);
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
