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
  // Get paragraph data from the form
  if (typeof collectParagraphData === 'function') {
    return JSON.stringify(collectParagraphData());
  }

  // Fallback: manually collect paragraph data
  const container = document.getElementById('paraContainer');
  if (!container) return null;

  const state = [];
  const paraItems = container.querySelectorAll('.para-item[data-level="0"]');

  paraItems.forEach(item => {
    state.push(collectParagraphItemState(item));
  });

  return JSON.stringify(state);
}

/**
 * Collect state from a paragraph item
 */
function collectParagraphItemState(item) {
  const textarea = item.querySelector('textarea');
  const subjectInput = item.querySelector('.para-subject');

  const result = {
    text: textarea ? textarea.value : '',
    subject: subjectInput ? subjectInput.value : '',
    children: []
  };

  // Collect children
  const childContainer = item.querySelector('.para-children');
  if (childContainer) {
    const children = childContainer.querySelectorAll(':scope > .para-item');
    children.forEach(child => {
      result.children.push(collectParagraphItemState(child));
    });
  }

  return result;
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

    // Rebuild paragraphs from state
    state.forEach((paraData, index) => {
      rebuildParagraph(container, paraData, 0, index + 1);
    });

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
 * Rebuild a paragraph from state data
 */
function rebuildParagraph(container, paraData, level, index) {
  // Use existing addParagraph function if available
  if (typeof addParagraphToContainer === 'function') {
    const paraItem = addParagraphToContainer(container, level, paraData.text, paraData.subject);

    // Rebuild children recursively
    if (paraData.children && paraData.children.length > 0) {
      const childContainer = paraItem.querySelector('.para-children') || createChildContainer(paraItem);
      paraData.children.forEach((childData, childIndex) => {
        rebuildParagraph(childContainer, childData, level + 1, childIndex + 1);
      });
    }

    return paraItem;
  }

  // Fallback: create paragraph element manually
  const paraItem = document.createElement('div');
  paraItem.className = 'para-item';
  paraItem.setAttribute('data-level', level);
  paraItem.draggable = true;

  const labels = ['1.', 'a.', '(1)', '(a)'];
  const label = labels[Math.min(level, 3)];

  paraItem.innerHTML = `
    <div class="para-header">
      <span class="para-label">${label}</span>
      <div class="para-controls">
        <button type="button" class="para-btn" onclick="addSubPara(this)" title="Add sub-paragraph">+Sub</button>
        <button type="button" class="para-btn para-btn-danger" onclick="removePara(this)" title="Remove">&times;</button>
      </div>
    </div>
    ${level === 0 ? `<input type="text" class="para-subject" placeholder="Paragraph subject (optional)" value="${escapeHtml(paraData.subject || '')}">` : ''}
    <textarea placeholder="Enter paragraph text..." rows="3">${escapeHtml(paraData.text || '')}</textarea>
    <div class="para-children"></div>
  `;

  container.appendChild(paraItem);

  // Rebuild children
  if (paraData.children && paraData.children.length > 0) {
    const childContainer = paraItem.querySelector('.para-children');
    paraData.children.forEach((childData, childIndex) => {
      rebuildParagraph(childContainer, childData, level + 1, childIndex + 1);
    });
  }

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
