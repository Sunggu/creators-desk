import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { tabKo } from '../ko/tab';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const tabEn = {
  closeTab: 'Close tab',
  addTab: 'New tab (+)',
  switchToEditMode: 'Switch to edit mode',
  switchToReadMode: 'Switch to reading mode',
  contextMenuHint: '{{title}} (right-click to split)',
  splitRight: 'Split pane to the right (side by side)',
  splitDown: 'Split pane to the bottom (stacked)',
  outlineOpen: 'Outline (open right panel)',
  outlineClose: 'Close outline panel',
  closeSplitGroup: 'Close split pane',
  menuSplitRight: 'Split to the right',
  menuSplitDown: 'Split below',
  menuCloseTab: 'Close tab',
  menuCloseOtherTabs: 'Close all other tabs',
} satisfies LocaleBundleShape<typeof tabKo>;