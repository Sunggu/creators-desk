import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { ribbonKo } from '../ko/ribbon';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const ribbonEn = {
  toggleExplorer: 'Toggle file explorer panel',
  toggleSplit: 'Split view (reading view side by side)',
  vaultModal: 'Project (Vault) manager',
  settings: 'Settings & open source licenses',
} satisfies LocaleBundleShape<typeof ribbonKo>;