import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { errorKo } from '../ko/error';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const errorEn = {
  'vault.nameRequired': 'Please enter a vault name.',
  'vault.notFound': 'Vault not found.',
  'file.nameRequired': 'Please enter a name.',
  'file.notFound': 'File not found.',
  'file.moveIntoSelf': 'A node cannot be moved into itself.',
  'file.moveIntoDescendant': 'A folder cannot be moved into its own descendant.',
} satisfies LocaleBundleShape<typeof errorKo>;