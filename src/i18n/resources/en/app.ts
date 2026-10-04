import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { appKo } from '../ko/app';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const appEn = {
  name: 'Creators Desk',
  loading: 'Loading Creators Desk...',
  tagline: 'A web workspace for distraction-free markdown writing and knowledge work',
  defaultVaultName: 'Main Vault',
} satisfies LocaleBundleShape<typeof appKo>;