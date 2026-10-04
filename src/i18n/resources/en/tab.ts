import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { tabKo } from '../ko/tab';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const tabEn = {
  closeTab: 'Close tab',
  addTab: 'New tab (+)',
  switchToEditMode: 'Switch to edit mode',
  switchToReadMode: 'Switch to reading mode',
} satisfies LocaleBundleShape<typeof tabKo>;