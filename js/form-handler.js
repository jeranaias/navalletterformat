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
 * Select document type (basic or endorsement)
 * @param {string} type - Document type
 */
function selectDocType(type) {
  documentType = type;
  document.querySelectorAll('.doc-type-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.type === type);
  });
  document.getElementById('endorsementFields').style.display = type === 'endorsement' ? 'block' : 'none';
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
    <input type="text" name="via[]" placeholder="Via addressee ${n}">
    <button type="button" class="btn btn-remove" onclick="removeItem(this, 'via')">×</button>
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
    <span class="item-label">(${LETTERS[n]})</span>
    <input type="text" name="ref[]" placeholder="Reference ${LETTERS[n]}">
    <button type="button" class="btn btn-remove" onclick="removeItem(this, 'ref')">×</button>
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
    <input type="text" name="encl[]" placeholder="Enclosure ${n}">
    <button type="button" class="btn btn-remove" onclick="removeItem(this, 'encl')">×</button>
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
    <input type="text" name="copy[]" placeholder="Copy recipient">
    <button type="button" class="btn btn-remove" onclick="this.parentElement.remove()">×</button>
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
    child.querySelector('.item-label').textContent = type === 'ref' ? `(${LETTERS[i]})` : `(${i + 1})`;
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
  div.innerHTML = `
    <span class="drag-handle">☰</span>
    <span class="para-label"></span>
    <textarea name="para[]" data-type="${type}" placeholder="Enter text..." onclick="setActivePara(this)"></textarea>
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

  if (afterEl) {
    afterEl.closest('.para-item').after(div);
  } else {
    container.appendChild(div);
  }

  updateParaLabels();
  div.querySelector('textarea').focus();
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
      label = LETTERS[sn - 1] + '.';
    } else if (type === 'subsubpara') {
      ssn++;
      sssn = 0;
      label = '(' + ssn + ')';
    } else if (type === 'subsubsubpara') {
      sssn++;
      label = '(' + LETTERS[sssn - 1] + ')';
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
  }
  this.style.borderTop = '';
}

// ============================================================
// DATA COLLECTION
// ============================================================

/**
 * Collect all form data
 * @returns {Object} - Form data object
 */
function collectData() {
  return {
    documentType,
    ssic: document.getElementById('ssicSearch').value.trim().split(/\s/)[0] || '',
    officeCode: document.getElementById('officeCode').value.trim(),
    date: document.getElementById('date').value.trim(),
    classification: document.getElementById('classification').value,
    branch: document.querySelector('input[name="branch"]:checked').value,
    useLetterhead: document.getElementById('useLetterhead').checked,
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
    paras: Array.from(document.querySelectorAll('textarea[name="para[]"]')).map(t => ({
      type: t.dataset.type,
      text: t.value.trim()
    })).filter(p => p.text),
    sigName: document.getElementById('sigName').value.trim(),
    byDirection: document.getElementById('byDirection').checked,
    copies: Array.from(document.querySelectorAll('input[name="copy[]"]')).map(i => i.value.trim()).filter(v => v),
    endorseNumber: document.getElementById('endorseNumber').value,
    endorseAction: document.getElementById('endorseAction').value
  };
}

/**
 * Initialize form event listeners
 */
async function initFormListeners() {
  // Load the default DON seal
  await loadDefaultSeal();

  // Letterhead toggle
  document.getElementById('useLetterhead').addEventListener('change', function() {
    document.getElementById('letterheadFields').style.display = this.checked ? 'block' : 'none';
  });

  // Date auto-format
  document.getElementById('date').addEventListener('blur', function() {
    const formatted = formatDateValue(this.value);
    if (formatted) {
      this.value = formatted;
    }
  });

  // Set today's date
  document.getElementById('date').value = getTodayFormatted();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadDefaultSeal,
    selectDocType,
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
