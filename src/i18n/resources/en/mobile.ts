import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { mobileKo } from '../ko/mobile';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const mobileEn = {
  openExplorer: 'Open explorer',
  closeDrawer: 'Close explorer',
  switchToEditMode: 'Switch to edit mode',
  switchToReadMode: 'Switch to reading mode',
  newNote: 'New note',
  switchVault: 'Switch vault',
} satisfies LocaleBundleShape<typeof mobileKo>;