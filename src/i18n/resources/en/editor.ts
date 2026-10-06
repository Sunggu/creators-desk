import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { editorKo } from '../ko/editor';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const editorEn = {
  noNoteTitle: 'No note is open',
  noNoteBody: 'Click a note in the explorer to open it, or drag and drop to move files.',
  createNote: '+ New note',
  loadingNote: 'Loading note...',
  noNoteSelected: 'No note selected',
  noNoteSelectedBody: 'Select or create a note from the file explorer on the left.',
  dragDropHint: 'Drag & drop',
  dragDropLabel: 'Move files and folders',
  shiftClickHint: 'Shift + click',
  shiftClickLabel: 'Select a range',
  ctrlClickHint: 'Ctrl/Cmd + click',
  ctrlClickLabel: 'Add to selection',
  rightClickHint: 'Right click',
  rightClickLabel: 'Context menu',
  titlePlaceholder: 'Untitled note',
  titleAriaLabel: 'Note title',
  invalidCharsTitle: 'The characters \\ / : * ? " < > | are not allowed in file names',
  doubleClickToEdit: 'Double-click to switch to edit mode',
  splitRightHint: 'Split to the right',
  splitBottomHint: 'Split to the bottom',
} satisfies LocaleBundleShape<typeof editorKo>;