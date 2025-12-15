/**
 * Naval Letter Generator - Undo/Redo Manager
 * Full edit history with Ctrl+Z/Ctrl+Y support for paragraphs
 */

const MAX_UNDO_STACK = 50;
let undoStack = [];
let redoStack = [];
let isUndoRedoAction = false;

/**
 * Initialize the undo manager
 */
function initUndoManager() {
  // Listen for paragraph changes to save state
  document.addEventListener('paragraphsChanged', () => {
    if (!isUndoRedoAction) {
      saveUndoState();
    }
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', handleUndoRedoKeyboard);

  // Save initial state
  setTimeout(() => {
    saveUndoState();
  }, 1000);
}

/**
 * Handle Ctrl+Z and Ctrl+Y keyboard shortcuts
 */
function handleUndoRedoKeyboard(e) {
  const isMod = e.ctrlKey || e.metaKey;

  if (isMod && !e.altKey) {
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      redo();
    }
  }
}

/**
 * Get current paragraph state
 */
function getParagraphState() {
  // Get paragraph data from the form (preferred - uses flat structure)
  if (typeof collectParagraphData === 'function') {
    return JSON.stringify(collectParagraphData());
  }

  // Fallback: manually collect paragraph data (flat structure)
  const container = document.getElementById('paraContainer');
  if (!container) return null;

  const state = [];
  const paraItems = container.querySelectorAll('.para-item');

  paraItems.forEach(item => {
    const textarea = item.querySelector('textarea');
    const subjectInput = item.querySelector('.para-subject-input');
    const portionSelector = item.querySelector('.portion-selector');

    state.push({
      type: item.dataset.type || 'para',
      text: textarea ? textarea.value : '',
      subject: subjectInput ? subjectInput.value : '',
      portionMark: portionSelector ? portionSelector.value : 'U'
    });
  });

  return JSON.stringify(state);
}

/**
 * Save current state to undo stack
 */
function saveUndoState() {
  const currentState = getParagraphState();
  if (!currentState) return;

  // Don't save if state hasn't changed
  if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentState) {
    return;
  }

  undoStack.push(currentState);

  // Limit stack size
  if (undoStack.length > MAX_UNDO_STACK) {
    undoStack.shift();
  }

  // Clear redo stack when new action is performed
  redoStack = [];

  updateUndoRedoButtons();
}

/**
 * Restore paragraph state
 */
function restoreParagraphState(stateJson) {
  if (!stateJson) return;

  isUndoRedoAction = true;

  try {
    const state = JSON.parse(stateJson);
    const container = document.getElementById('paraContainer');
    if (!container) return;

    // Clear existing paragraphs
    container.innerHTML = '';

    // Reset global paragraphs array if it exists
    if (typeof paragraphs !== 'undefined') {
      paragraphs.length = 0;
    }

    // Rebuild paragraphs from state (flat structure with type property)
    state.forEach((paraData) => {
      rebuildParagraphFromFlat(container, paraData);
    });

    // Update paragraph labels (numbering)
    if (typeof updateParaLabels === 'function') {
      updateParaLabels();
    }

    // Trigger preview update if enabled
    if (typeof schedulePreviewUpdate === 'function') {
      schedulePreviewUpdate();
    }

  } catch (error) {
    console.error('Error restoring paragraph state:', error);
  } finally {
    isUndoRedoAction = false;
  }
}

/**
 * Rebuild a paragraph from flat state data (type property indicates level)
 */
function rebuildParagraphFromFlat(container, paraData) {
  const type = paraData.type || 'para';
  const types = ['para', 'subpara', 'subsubpara', 'subsubsubpara'];
  const level = types.indexOf(type);

  const paraItem = document.createElement('div');
  paraItem.className = 'para-item';
  paraItem.dataset.type = type;
  paraItem.draggable = true;

  // Subject field only for top-level paragraphs
  const subjectField = type === 'para' ? `
    <input type="text" name="paraSubj[]" class="para-subject-input" placeholder="Subject (optional, underlined)" aria-label="Paragraph subject" value="${escapeHtml(paraData.subject || '')}" />
  ` : '';

  // Portion marking selector (hidden by default, shown when enabled)
  const portionDisplay = (typeof portionMarkingEnabled !== 'undefined' && portionMarkingEnabled) ? 'inline-block' : 'none';
  const portionValue = paraData.portionMark || 'U';
  const portionSelector = `
    <select class="portion-selector" style="display: ${portionDisplay};" title="Portion marking" aria-label="Portion marking">
      <option value="U" ${portionValue === 'U' ? 'selected' : ''}>(U)</option>
      <option value="CUI" ${portionValue === 'CUI' ? 'selected' : ''}>(CUI)</option>
      <option value="FOUO" ${portionValue === 'FOUO' ? 'selected' : ''}>(FOUO)</option>
    </select>
  `;

  paraItem.innerHTML = `
    <div class="para-left-controls">
      <span class="drag-handle" title="Drag to reorder" aria-hidden="true">☰</span>
      <div class="para-inline-actions">
        <button type="button" class="para-action-btn" onclick="addSibling(this)" title="Add paragraph below" aria-label="Add paragraph below">+</button>
        <button type="button" class="para-action-btn" onclick="addChild(this)" title="Add sub-paragraph" aria-label="Add sub-paragraph" ${level >= 3 ? 'disabled' : ''}>↳</button>
        <button type="button" class="para-action-btn para-action-delete" onclick="removePara(this)" title="Delete paragraph" aria-label="Delete paragraph">×</button>
      </div>
    </div>
    <div class="para-main">
      ${portionSelector}
      <span class="para-label" aria-hidden="true"></span>
      ${subjectField}
      <textarea name="para[]" data-type="${type}" placeholder="Enter paragraph text..." aria-label="Paragraph text">${escapeHtml(paraData.text || '')}</textarea>
    </div>
  `;

  // Add drag-drop event listeners
  paraItem.addEventListener('dragstart', handleDragStart);
  paraItem.addEventListener('dragover', handleDragOver);
  paraItem.addEventListener('drop', handleDrop);
  paraItem.addEventListener('dragend', handleDragEnd);

  container.appendChild(paraItem);

  return paraItem;
}

/**
 * Escape HTML for safe insertion
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Undo last action
 */
function undo() {
  if (undoStack.length <= 1) {
    showStatus('warning', 'Nothing to undo');
    return;
  }

  // Save current state to redo stack
  const currentState = undoStack.pop();
  redoStack.push(currentState);

  // Restore previous state
  const previousState = undoStack[undoStack.length - 1];
  restoreParagraphState(previousState);

  updateUndoRedoButtons();
  showStatus('success', 'Undo successful');
}

/**
 * Redo last undone action
 */
function redo() {
  if (redoStack.length === 0) {
    showStatus('warning', 'Nothing to redo');
    return;
  }

  // Get state from redo stack
  const nextState = redoStack.pop();
  undoStack.push(nextState);

  // Restore the state
  restoreParagraphState(nextState);

  updateUndoRedoButtons();
  showStatus('success', 'Redo successful');
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  if (undoBtn) {
    undoBtn.disabled = undoStack.length <= 1;
    undoBtn.title = undoStack.length <= 1 ? 'Nothing to undo' : `Undo (${undoStack.length - 1} actions)`;
  }

  if (redoBtn) {
    redoBtn.disabled = redoStack.length === 0;
    redoBtn.title = redoStack.length === 0 ? 'Nothing to redo' : `Redo (${redoStack.length} actions)`;
  }
}

/**
 * Clear undo/redo history
 */
function clearUndoHistory() {
  undoStack = [];
  redoStack = [];
  updateUndoRedoButtons();
}

/**
 * Force save current state (for external use)
 */
function forceSaveUndoState() {
  saveUndoState();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.initUndoManager = initUndoManager;
  window.undo = undo;
  window.redo = redo;
  window.saveUndoState = saveUndoState;
  window.forceSaveUndoState = forceSaveUndoState;
  window.clearUndoHistory = clearUndoHistory;
}
