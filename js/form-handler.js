/**
 * Naval Letter Generator - Form Handler
 * Manages form state, dynamic lists, paragraphs, drag-drop, and data collection
 */

// Global state
let sealData = null;
let sealFilename = 'DOW-Seal-BW.jpg';
let sealLoaded = false;
let documentType = 'basic';
let draggedItem = null;
let portionMarkingEnabled = false;

// Default seal path (bundled with app)
const DEFAULT_SEAL_PATH = 'assets/DOW-Seal-BW.jpg';

/**
 * Pre-load the default Department of the Navy seal
 * Called during app initialization
 */
async function loadDefaultSeal() {
  try {
    const response = await fetch(DEFAULT_SEAL_PATH);
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
          sealData = e.target.result;
          sealLoaded = true;
          console.log('Default DON seal loaded successfully');
          resolve(true);
        };
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn('Could not load default seal:', err);
  }
  return false;
}

/**
 * Select document type (basic, endorsement, or memorandum)
 * @param {string} type - Document type
 */
function selectDocType(type) {
  documentType = type;
  document.querySelectorAll('.doc-type-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.type === type);
    opt.setAttribute('aria-checked', opt.dataset.type === type);
  });

  // Show/hide endorsement fields
  document.getElementById('endorsementFields').style.display = type === 'endorsement' ? 'block' : 'none';

  // Show/hide memorandum fields
  const memoFields = document.getElementById('memorandumFields');
  if (memoFields) {
    memoFields.style.display = type === 'memorandum' ? 'block' : 'none';
  }

  // Show/hide letterhead section based on document type and formal memo checkbox
  updateLetterheadVisibility();
}

/**
 * Select memo style (plain paper vs letterhead)
 */
function selectMemoStyle(isFormal) {
  const hiddenInput = document.getElementById('formalMemo');
  if (hiddenInput) {
    hiddenInput.value = isFormal ? 'true' : 'false';
  }

  // Update toggle UI
  document.querySelectorAll('.memo-option').forEach(opt => {
    const optFormal = opt.dataset.formal === 'true';
    opt.classList.toggle('selected', optFormal === isFormal);
    opt.setAttribute('aria-checked', optFormal === isFormal);
  });

  // Update letterhead visibility
  updateLetterheadVisibility();
}

/**
 * Toggle portion marking option visibility based on classification
 */
function togglePortionMarking() {
  const classification = document.getElementById('classification').value;
  const portionOption = document.getElementById('portionMarkingOption');
  const portionCheckbox = document.getElementById('enablePortionMarking');

  if (portionOption) {
    // Show portion marking option for CUI/FOUO (inline-flex for options panel)
    portionOption.style.display = classification ? 'inline-flex' : 'none';

    // If classification is cleared, disable portion marking
    if (!classification && portionCheckbox) {
      portionCheckbox.checked = false;
      portionMarkingEnabled = false;
      updatePortionMarkingUI();
    }
  }
}

/**
 * Handle portion marking checkbox change
 */
function handlePortionMarkingChange() {
  const checkbox = document.getElementById('enablePortionMarking');
  portionMarkingEnabled = checkbox ? checkbox.checked : false;
  updatePortionMarkingUI();
}

/**
 * Update portion marking UI on all paragraphs
 */
function updatePortionMarkingUI() {
  const classification = document.getElementById('classification').value;
  const portionSelectors = document.querySelectorAll('.portion-selector');

  portionSelectors.forEach(selector => {
    selector.style.display = portionMarkingEnabled ? 'inline-block' : 'none';
  });

  // Update default values based on classification
  if (portionMarkingEnabled && classification) {
    portionSelectors.forEach(selector => {
      if (!selector.value) {
        // Default to unclassified for new paragraphs
        selector.value = 'U';
      }
    });
  }
}

/**
 * Update letterhead section visibility based on document type and formal memo option
 */
function updateLetterheadVisibility() {
  const letterheadSection = document.getElementById('letterheadFields')?.closest('.form-section');
  if (!letterheadSection) return;

  if (documentType === 'memorandum') {
    // For memos, show letterhead only if formal memo is selected
    const formalMemo = document.getElementById('formalMemo');
    const isFormal = formalMemo && formalMemo.value === 'true';
    letterheadSection.style.display = isFormal ? 'block' : 'none';
  } else {
    // For basic letters and endorsements, always show letterhead
    letterheadSection.style.display = 'block';
  }
}

/**
 * Toggle collapsible sections
 * @param {HTMLElement} header - Header element
 */
function toggleCollapsible(header) {
  header.classList.toggle('expanded');
  header.nextElementSibling.classList.toggle('show');
}

// ============================================================
// DYNAMIC LISTS (Via, References, Enclosures, Copy To)
// ============================================================

/**
 * Add via addressee
 */
function addVia() {
  const list = document.getElementById('viaList');
  const n = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <span class="item-label">(${n})</span>
    <input type="text" name="via[]" placeholder="Via addressee ${n}" aria-label="Via addressee ${n}">
    <button type="button" class="btn btn-remove" onclick="removeItem(this, 'via')" aria-label="Remove via addressee ${n}">×</button>
  `;
  list.appendChild(div);
}

/**
 * Add reference
 */
function addRef() {
  const list = document.getElementById('refList');
  const n = list.children.length;
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <span class="item-label">(${getLetter(n)})</span>
    <input type="text" name="ref[]" placeholder="Reference ${getLetter(n)}" aria-label="Reference ${getLetter(n)}">
    <button type="button" class="btn btn-remove" onclick="removeItem(this, 'ref')" aria-label="Remove reference ${getLetter(n)}">×</button>
  `;
  list.appendChild(div);
}

/**
 * Add enclosure
 */
function addEncl() {
  const list = document.getElementById('enclList');
  const n = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <span class="item-label">(${n})</span>
    <input type="text" name="encl[]" placeholder="Enclosure ${n}" aria-label="Enclosure ${n}">
    <button type="button" class="btn btn-remove" onclick="removeItem(this, 'encl')" aria-label="Remove enclosure ${n}">×</button>
  `;
  list.appendChild(div);
}

/**
 * Add copy recipient
 */
function addCopy() {
  const list = document.getElementById('copyList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <input type="text" name="copy[]" placeholder="Copy recipient" aria-label="Copy recipient">
    <button type="button" class="btn btn-remove" onclick="this.parentElement.remove()" aria-label="Remove copy recipient">×</button>
  `;
  list.appendChild(div);
}

/**
 * Remove item from dynamic list
 * @param {HTMLElement} btn - Remove button
 * @param {string} type - List type ('via', 'ref', 'encl')
 */
function removeItem(btn, type) {
  const item = btn.parentElement;
  const list = item.parentElement;
  item.remove();

  // Renumber items
  Array.from(list.children).forEach((child, i) => {
    child.querySelector('.item-label').textContent = type === 'ref' ? `(${getLetter(i)})` : `(${i + 1})`;
  });
}

// ============================================================
// PARAGRAPHS
// ============================================================

/**
 * Add first paragraph
 */
function addFirstPara() {
  addParaAfter(null, 'para');
}

/**
 * Add paragraph after specified element
 * @param {HTMLElement|null} afterEl - Element to add after
 * @param {string} type - Paragraph type ('para', 'subpara', 'subsubpara', 'subsubsubpara')
 */
function addParaAfter(afterEl, type) {
  const container = document.getElementById('paraContainer');
  const div = document.createElement('div');
  div.className = 'para-item';
  div.draggable = true;
  div.dataset.type = type;

  // Only top-level paragraphs can have subjects
  const subjectField = type === 'para' ? `
    <input type="text" name="paraSubj[]" class="para-subject-input" placeholder="Subject (optional, underlined)" aria-label="Paragraph subject" />
  ` : '';

  // Portion marking selector (shown when enabled)
  const portionDisplay = portionMarkingEnabled ? 'inline-block' : 'none';
  const portionSelector = `
    <select class="portion-selector" style="display: ${portionDisplay};" title="Portion marking" aria-label="Portion marking">
      <option value="U">(U)</option>
      <option value="CUI">(CUI)</option>
      <option value="FOUO">(FOUO)</option>
    </select>
  `;

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
      <textarea name="para[]" data-type="${type}" placeholder="Enter paragraph text..." aria-label="Paragraph text" spellcheck="true"></textarea>
    </div>
  `;

  // Add drag-drop listeners
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragend', handleDragEnd);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('dragleave', handleDragLeave);
  div.addEventListener('drop', handleDrop);

  if (afterEl) {
    afterEl.closest('.para-item').after(div);
  } else {
    container.appendChild(div);
  }

  updateParaLabels();
  div.querySelector('textarea').focus();

  // Fire paragraphsChanged event for undo/redo tracking
  dispatchParagraphsChanged();
}

/**
 * Set active paragraph (shows action buttons)
 * @param {HTMLElement} textarea - Textarea element
 */
function setActivePara(textarea) {
  document.querySelectorAll('.para-item').forEach(p => p.classList.remove('active'));
  textarea.closest('.para-item').classList.add('active');
}

/**
 * Add sibling paragraph at same level
 * @param {HTMLElement} btn - Button element
 */
function addSibling(btn) {
  const para = btn.closest('.para-item');
  addParaAfter(para.querySelector('textarea'), para.dataset.type);
}

/**
 * Add child paragraph (indented)
 * @param {HTMLElement} btn - Button element
 */
function addChild(btn) {
  const para = btn.closest('.para-item');
  const types = ['para', 'subpara', 'subsubpara', 'subsubsubpara'];
  const idx = types.indexOf(para.dataset.type);
  if (idx < types.length - 1) {
    addParaAfter(para.querySelector('textarea'), types[idx + 1]);
  }
}

/**
 * Add parent paragraph (outdented)
 * @param {HTMLElement} btn - Button element
 */
function addParent(btn) {
  const para = btn.closest('.para-item');
  const types = ['para', 'subpara', 'subsubpara', 'subsubsubpara'];
  const idx = types.indexOf(para.dataset.type);
  if (idx > 0) {
    addParaAfter(para.querySelector('textarea'), types[idx - 1]);
  }
}

/**
 * Remove paragraph
 * @param {HTMLElement} btn - Button element
 */
function removePara(btn) {
  btn.closest('.para-item').remove();
  updateParaLabels();

  // Fire paragraphsChanged event for undo/redo tracking
  dispatchParagraphsChanged();
}

/**
 * Update paragraph labels (1., a., (1), (a))
 */
function updateParaLabels() {
  let pn = 0, sn = 0, ssn = 0, sssn = 0;
  document.querySelectorAll('.para-item').forEach(item => {
    const type = item.dataset.type;
    let label = '';

    if (type === 'para') {
      pn++;
      sn = 0;
      ssn = 0;
      sssn = 0;
      label = pn + '.';
    } else if (type === 'subpara') {
      sn++;
      ssn = 0;
      sssn = 0;
      label = getLetter(sn - 1) + '.';
    } else if (type === 'subsubpara') {
      ssn++;
      sssn = 0;
      label = '(' + ssn + ')';
    } else if (type === 'subsubsubpara') {
      sssn++;
      label = '(' + getLetter(sssn - 1) + ')';
    }

    item.querySelector('.para-label').textContent = label;
    item.querySelector('textarea').dataset.type = type;
  });
}

// ============================================================
// DRAG & DROP
// ============================================================

function handleDragStart(e) {
  draggedItem = this;
  this.style.opacity = '0.5';
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  document.querySelectorAll('.para-item').forEach(i => i.style.borderTop = '');
}

function handleDragOver(e) {
  e.preventDefault();
  this.style.borderTop = '3px solid var(--navy)';
}

function handleDragLeave(e) {
  this.style.borderTop = '';
}

function handleDrop(e) {
  e.preventDefault();
  if (draggedItem !== this) {
    const container = document.getElementById('paraContainer');
    const items = Array.from(container.children);
    if (items.indexOf(draggedItem) < items.indexOf(this)) {
      this.after(draggedItem);
    } else {
      this.before(draggedItem);
    }
    updateParaLabels();

    // Fire paragraphsChanged event for undo/redo tracking
    dispatchParagraphsChanged();
  }
  this.style.borderTop = '';
}

// Debounce timer for paragraph text changes
let paragraphChangeDebounce = null;

/**
 * Dispatch paragraphsChanged event (debounced for text changes)
 */
function dispatchParagraphsChanged() {
  if (paragraphChangeDebounce) {
    clearTimeout(paragraphChangeDebounce);
  }
  paragraphChangeDebounce = setTimeout(() => {
    document.dispatchEvent(new CustomEvent('paragraphsChanged'));
  }, 300);
}

/**
 * Collect paragraph data for undo/redo
 */
function collectParagraphData() {
  const container = document.getElementById('paraContainer');
  if (!container) return [];

  const data = [];
  container.querySelectorAll('.para-item').forEach(item => {
    const textarea = item.querySelector('textarea');
    const subjInput = item.querySelector('.para-subject-input');
    data.push({
      type: item.dataset.type,
      text: textarea ? textarea.value : '',
      subject: subjInput ? subjInput.value : ''
    });
  });
  return data;
}

// ============================================================
// DATA COLLECTION
// ============================================================

/**
 * Collect all form data
 * @returns {Object} - Form data object
 */
function collectData() {
  // For memos, check if formal letterhead is requested
  const formalMemo = document.getElementById('formalMemo');
  const isFormalMemo = documentType === 'memorandum' && formalMemo && formalMemo.value === 'true';

  return {
    documentType,
    ssic: document.getElementById('ssicSearch').value.trim().split(/\s/)[0] || '',
    officeCode: document.getElementById('officeCode').value.trim(),
    date: document.getElementById('date').value.trim(),
    classification: document.getElementById('classification').value,
    branch: 'USMC', // Marine Corps only
    // Letterhead: always for basic/endorsement, optional for memo (formal only)
    useLetterhead: documentType !== "memorandum" || isFormalMemo,
    isFormalMemo, // Track if this is a formal letterhead memo
    unitName: document.getElementById('unitName').value.trim(),
    unitAddress: document.getElementById('unitAddress').value.trim(),
    hasSeal: sealData !== null,
    sealData,
    sealFilename,
    from: document.getElementById('from').value.trim(),
    to: document.getElementById('to').value.trim(),
    via: Array.from(document.querySelectorAll('input[name="via[]"]')).map(i => i.value.trim()).filter(v => v),
    subj: document.getElementById('subj').value.trim(),
    refs: Array.from(document.querySelectorAll('input[name="ref[]"]')).map(i => i.value.trim()).filter(v => v),
    encls: Array.from(document.querySelectorAll('input[name="encl[]"]')).map(i => i.value.trim()).filter(v => v),
    portionMarkingEnabled,
    paras: Array.from(document.querySelectorAll('textarea[name="para[]"]')).map(t => {
      const paraItem = t.closest('.para-item');
      const subjInput = paraItem?.querySelector('.para-subject-input');
      const portionSelect = paraItem?.querySelector('.portion-selector');
      return {
        type: t.dataset.type,
        subject: subjInput?.value.trim() || '',
        text: t.value.trim(),
        portionMark: portionSelect?.value || 'U'
      };
    }).filter(p => p.text),
    sigName: document.getElementById('sigName').value.trim(),
    byDirection: document.getElementById('byDirection').checked,
    copies: Array.from(document.querySelectorAll('input[name="copy[]"]')).map(i => i.value.trim()).filter(v => v),
    endorseNumber: document.getElementById('endorseNumber').value,
    endorseAction: document.getElementById('endorseAction').value,
    // Font settings
    fontFamily: document.getElementById('fontFamily')?.value || 'times',
    fontSize: parseInt(document.getElementById('fontSize')?.value || '12', 10)
  };
}

/**
 * Initialize form event listeners
 */
async function initFormListeners() {
  // Load the default DON seal
  await loadDefaultSeal();

  // Date auto-format
  document.getElementById('date').addEventListener('blur', function() {
    const formatted = formatDateValue(this.value);
    if (formatted) {
      this.value = formatted;
    }
  });

  // Set today's date
  document.getElementById('date').value = getTodayFormatted();

  // Portion marking checkbox
  const portionCheckbox = document.getElementById('enablePortionMarking');
  if (portionCheckbox) {
    portionCheckbox.addEventListener('change', handlePortionMarkingChange);
  }

  // Listen for paragraph text changes (using event delegation)
  const paraContainer = document.getElementById('paraContainer');
  if (paraContainer) {
    paraContainer.addEventListener('input', (e) => {
      if (e.target.matches('textarea, .para-subject-input')) {
        dispatchParagraphsChanged();
      }
    });
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadDefaultSeal,
    selectDocType,
    updateLetterheadVisibility,
    toggleCollapsible,
    addVia,
    addRef,
    addEncl,
    addCopy,
    removeItem,
    addFirstPara,
    addParaAfter,
    setActivePara,
    addSibling,
    addChild,
    addParent,
    removePara,
    updateParaLabels,
    collectData,
    initFormListeners,
    get sealData() { return sealData; },
    get sealFilename() { return sealFilename; },
    get sealLoaded() { return sealLoaded; },
    get documentType() { return documentType; }
  };
}
