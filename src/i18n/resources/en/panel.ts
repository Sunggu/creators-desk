import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { panelKo } from '../ko/panel';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const panelEn = {
  explorerTitle: 'File Explorer',
  editorTitle: 'Editor',
  previewTitle: 'Reading View',
  slotLeft: 'Left',
  slotCenter: 'Center',
  slotRight: 'Right',
  moveLeft: 'Move to left slot',
  moveRight: 'Move to right slot',
  toggleSplit: 'Toggle split viewer (side by side)',
  closeWindow: 'Close panel',
} satisfies LocaleBundleShape<typeof panelKo>;