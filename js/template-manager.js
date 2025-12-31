/**
 * Naval Letter Generator - Template Manager
 * Pre-built templates for common letter types
 */

let TEMPLATE_DATABASE = [];
let templateCategories = [];

/**
 * Load templates from JSON file
 */
async function loadTemplates() {
  try {
    const response = await fetch('data/templates.json');
    const data = await response.json();
    TEMPLATE_DATABASE = data.templates || [];
    templateCategories = data.categories || [];
    console.log(`Loaded ${TEMPLATE_DATABASE.length} templates`);
    return true;
  } catch (error) {
    console.warn('Could not load templates:', error);
    return false;
  }
}

/**
 * Initialize the template manager
 */
function initTemplateManager() {
  const templateBtn = document.getElementById('templateBtn');
  const templateModal = document.getElementById('templateModal');
  const templateClose = document.getElementById('templateClose');
  const templateSearch = document.getElementById('templateSearch');
  const categoryFilter = document.getElementById('categoryFilter');

  if (templateBtn) {
    templateBtn.addEventListener('click', openTemplateModal);
  }

  if (templateClose) {
    templateClose.addEventListener('click', closeTemplateModal);
  }

  if (templateModal) {
    templateModal.addEventListener('click', (e) => {
      if (e.target === templateModal) {
        closeTemplateModal();
      }
    });
  }

  if (templateSearch) {
    templateSearch.addEventListener('input', filterTemplates);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterTemplates);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && templateModal && templateModal.classList.contains('show')) {
      closeTemplateModal();
    }
  });

  // Populate category filter
  populateCategoryFilter();
}

/**
 * Populate the category filter dropdown
 */
function populateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  templateCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

/**
 * Open the template selection modal
 */
function openTemplateModal() {
  const modal = document.getElementById('templateModal');
  if (modal) {
    // Reset selection
    selectedTemplateId = null;

    // Reset preview pane
    const previewPane = document.getElementById('templatePreviewPane');
    if (previewPane) {
      previewPane.innerHTML = '<div class="template-preview-empty"><p>Select a template to preview</p></div>';
    }

    modal.classList.add('show');
    renderTemplateList();
    document.getElementById('templateSearch')?.focus();
  }
}

/**
 * Close the template selection modal
 */
function closeTemplateModal() {
  const modal = document.getElementById('templateModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * Filter templates based on search and category
 */
function filterTemplates() {
  renderTemplateList();
}

// Track currently selected template for preview
let selectedTemplateId = null;

/**
 * Render the template list
 */
function renderTemplateList() {
  const container = document.getElementById('templateList');
  if (!container) return;

  const searchTerm = document.getElementById('templateSearch')?.value.toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || '';

  const filtered = TEMPLATE_DATABASE.filter(t => {
    const matchesSearch = !searchTerm ||
      t.name.toLowerCase().includes(searchTerm) ||
      t.description.toLowerCase().includes(searchTerm);
    const matchesCategory = !category || t.category === category;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="template-empty">No templates found</div>';
    return;
  }

  container.innerHTML = filtered.map(t => `
    <div class="template-card ${selectedTemplateId === t.id ? 'selected' : ''}" onclick="previewTemplate('${t.id}')">
      <div class="template-card-header">
        <h4>${t.name}</h4>
        <span class="template-category">${t.category}</span>
      </div>
      <p class="template-desc">${t.description}</p>
      ${t.ssic ? `<span class="template-ssic">SSIC: ${t.ssic}</span>` : ''}
    </div>
  `).join('');
}

/**
 * Preview a template (show in preview pane)
 */
function previewTemplate(templateId) {
  const template = TEMPLATE_DATABASE.find(t => t.id === templateId);
  if (!template) return;

  selectedTemplateId = templateId;

  // Update list to show selection
  renderTemplateList();

  // Render preview
  const previewPane = document.getElementById('templatePreviewPane');
  if (!previewPane) return;

  let html = `
    <div class="template-preview-content">
      <div class="template-preview-header">
        <h3>${template.name}</h3>
        <span class="template-category">${template.category}</span>
      </div>
      <p class="template-preview-desc">${template.description}</p>
  `;

  // Document type
  if (template.documentType) {
    html += `<div class="template-preview-field">
      <strong>Document Type:</strong> ${template.documentType === 'basic' ? 'Basic Letter' : template.documentType === 'endorsement' ? 'Endorsement' : 'Memorandum'}
    </div>`;
  }

  // SSIC
  if (template.ssic) {
    html += `<div class="template-preview-field">
      <strong>SSIC:</strong> ${template.ssic}
    </div>`;
  }

  // Subject
  if (template.subj) {
    html += `<div class="template-preview-field">
      <strong>Subject:</strong> ${template.subj}
    </div>`;
  }

  // References
  if (template.refs && template.refs.length > 0) {
    html += `<div class="template-preview-field">
      <strong>References:</strong>
      <ul class="template-preview-list">
        ${template.refs.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>`;
  }

  // Enclosures
  if (template.encls && template.encls.length > 0) {
    html += `<div class="template-preview-field">
      <strong>Enclosures:</strong>
      <ul class="template-preview-list">
        ${template.encls.map(e => `<li>${e}</li>`).join('')}
      </ul>
    </div>`;
  }

  // Paragraphs
  if (template.paragraphs && template.paragraphs.length > 0) {
    html += `<div class="template-preview-field">
      <strong>Body:</strong>
      <div class="template-preview-body">
        ${template.paragraphs.map((p, i) => `
          <div class="template-preview-para">
            <span class="para-num">${i + 1}.</span>
            ${p.subject ? `<span class="para-subj">${p.subject}</span> ` : ''}
            <span class="para-text">${p.text}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  html += `
      <div class="template-preview-actions">
        <button type="button" class="btn btn-primary btn-lg" onclick="applyTemplate('${templateId}')">Use This Template</button>
      </div>
    </div>
  `;

  previewPane.innerHTML = html;
}

/**
 * Apply a template to the form
 */
function applyTemplate(templateId) {
  const template = TEMPLATE_DATABASE.find(t => t.id === templateId);
  if (!template) {
    console.error('Template not found:', templateId);
    return;
  }

  // Confirm if form has data
  const currentData = collectData();
  const hasData = currentData.subj || currentData.from || currentData.to ||
    (currentData.paragraphs && currentData.paragraphs.length > 0);

  if (hasData) {
    if (!confirm('This will replace your current form data. Continue?')) {
      return;
    }
  }

  // Apply document type
  if (template.documentType) {
    selectDocType(template.documentType);
  }

  // Apply SSIC
  if (template.ssic) {
    const ssicInput = document.getElementById('ssicSearch');
    if (ssicInput) ssicInput.value = template.ssic;
  }

  // Apply Office Code
  if (template.officeCode) {
    const officeCodeInput = document.getElementById('officeCode');
    if (officeCodeInput) officeCodeInput.value = template.officeCode;
  }

  // Apply Unit Name (letterhead)
  if (template.unitName) {
    const unitNameInput = document.getElementById('unitName');
    if (unitNameInput) unitNameInput.value = template.unitName;
  }

  // Apply Unit Address (letterhead)
  if (template.unitAddress) {
    const unitAddressInput = document.getElementById('unitAddress');
    if (unitAddressInput) unitAddressInput.value = template.unitAddress;
  }

  // Apply From
  if (template.from) {
    const fromInput = document.getElementById('from');
    if (fromInput) fromInput.value = template.from;
  }

  // Apply To
  if (template.to) {
    const toInput = document.getElementById('to');
    if (toInput) toInput.value = template.to;
  }

  // Apply Via
  if (template.via && template.via.length > 0) {
    clearDynamicList('viaList');
    template.via.forEach(v => {
      addVia();
      const inputs = document.querySelectorAll('#viaList input');
      const lastInput = inputs[inputs.length - 1];
      if (lastInput) lastInput.value = v;
    });
  }

  // Apply Signature
  if (template.sigName) {
    const sigInput = document.getElementById('sigName');
    if (sigInput) sigInput.value = template.sigName;
  }

  // Apply Copy To
  if (template.copies && template.copies.length > 0) {
    clearDynamicList('copyList');
    template.copies.forEach(c => {
      addCopy();
      const inputs = document.querySelectorAll('#copyList input');
      const lastInput = inputs[inputs.length - 1];
      if (lastInput) lastInput.value = c;
    });
  }

  // Apply subject
  if (template.subj) {
    const subjInput = document.getElementById('subj');
    if (subjInput) subjInput.value = template.subj;
  }

  // Apply endorsement action
  if (template.endorseAction) {
    const actionSelect = document.getElementById('endorseAction');
    if (actionSelect) {
      for (let i = 0; i < actionSelect.options.length; i++) {
        if (actionSelect.options[i].value === template.endorseAction) {
          actionSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  // Clear and apply references
  clearDynamicList('refList');
  if (template.refs && template.refs.length > 0) {
    template.refs.forEach(ref => {
      addRef();
      const inputs = document.querySelectorAll('#refList input');
      const lastInput = inputs[inputs.length - 1];
      if (lastInput) lastInput.value = ref;
    });
  }

  // Clear and apply enclosures
  clearDynamicList('enclList');
  if (template.encls && template.encls.length > 0) {
    template.encls.forEach(encl => {
      addEncl();
      const inputs = document.querySelectorAll('#enclList input');
      const lastInput = inputs[inputs.length - 1];
      if (lastInput) lastInput.value = encl;
    });
  }

  // Clear and apply paragraphs
  clearParagraphs();
  if (template.paragraphs && template.paragraphs.length > 0) {
    const container = document.getElementById('paraContainer');

    template.paragraphs.forEach((para, i) => {
      // Determine paragraph type (default to 'para' for main paragraphs)
      const paraType = para.type || 'para';

      // Get the last paragraph to add after (if any)
      const paraItems = container.querySelectorAll('.para-item');
      const lastPara = paraItems.length > 0 ? paraItems[paraItems.length - 1] : null;

      // Add paragraph with the specified type
      let newEditor;
      if (lastPara) {
        newEditor = addParaAfter(lastPara.querySelector('.para-editor'), paraType, '');
      } else {
        // First paragraph - use addParaAfter with null
        newEditor = addParaAfter(null, paraType, '');
      }

      // Set content
      const newParaItem = newEditor.closest('.para-item');
      if (newParaItem) {
        if (para.text) {
          newEditor.innerHTML = para.text;
        }
        const subjectInput = newParaItem.querySelector('.para-subject-input');
        if (subjectInput && para.subject) subjectInput.value = para.subject;
      }
    });
  }

  // Close modal
  closeTemplateModal();

  // Show success message
  showStatus('success', `Template "${template.name}" applied`);

  // Trigger preview update if enabled
  if (typeof schedulePreviewUpdate === 'function') {
    schedulePreviewUpdate();
  }
}

/**
 * Clear a dynamic list
 */
function clearDynamicList(listId) {
  const list = document.getElementById(listId);
  if (list) {
    list.innerHTML = '';
  }
}

/**
 * Clear all paragraphs
 */
function clearParagraphs() {
  const container = document.getElementById('paraContainer');
  if (container) {
    container.innerHTML = '';
  }
  // Reset paragraph state if available
  if (typeof paragraphs !== 'undefined') {
    paragraphs.length = 0;
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.loadTemplates = loadTemplates;
  window.initTemplateManager = initTemplateManager;
  window.openTemplateModal = openTemplateModal;
  window.closeTemplateModal = closeTemplateModal;
  window.applyTemplate = applyTemplate;
  window.previewTemplate = previewTemplate;
}
