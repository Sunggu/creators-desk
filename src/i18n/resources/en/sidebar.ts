import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { sidebarKo } from '../ko/sidebar';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const sidebarEn = {
  heading: 'Explorer',
  newNote: 'New note',
  newFolder: 'New folder',
  createNote: '+ New note',
  rename: 'Rename',
  copyName: 'Copy name',
  remove: 'Delete',
  newNoteShortcut: 'New note (+)',
  newFolderTitle: 'New folder',
  refreshTitle: 'Refresh',
  closeMobile: 'Close',
  selectedCount_one: '{{count}} item selected',
  selectedCount_other: '{{count}} items selected',
  deleteSelected: 'Delete selected items',
  clearSelection: 'Clear',
  empty: 'There are no notes yet.',
  renamePrompt: 'New name:',
  deleteConfirm: 'Delete "{{name}}"?',
  bulkDeleteConfirm_one: 'Delete all {{count}} selected items?',
  bulkDeleteConfirm_other: 'Delete all {{count}} selected items?',
  createNotePrompt: 'New note name:',
  createFolderPrompt: 'New folder name:',
} satisfies LocaleBundleShape<typeof sidebarKo>;