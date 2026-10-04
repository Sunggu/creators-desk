import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { commonKo } from '../ko/common';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const commonEn = {
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  create: 'Create',
  rename: 'Rename',
  remove: 'Delete',
  confirm: 'Confirm',
  back: 'Back',
  refresh: 'Refresh',
  loading: 'Loading...',
  retry: 'Try again',
  copy: 'Copy',
  unknown: 'Unknown',
  none: 'None',
  yes: 'Yes',
  no: 'No',
  on: 'On',
  off: 'Off',
  enabled: 'Active',
  defaultEnabled: 'Enabled by default',
} satisfies LocaleBundleShape<typeof commonKo>;