import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { statusbarKo } from '../ko/statusbar';

/** BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key. */
export const statusbarEn = {
  backlinks_zero: 'No backlinks',
  backlinks_one: '{{count}} backlink',
  backlinks_other: '{{count}} backlinks',
  saving: 'Saving...',
  saved: 'Saved',
  words_one: '{{count}} word',
  words_other: '{{count}} words',
  characters_one: '{{count}} character',
  characters_other: '{{count}} characters',
  cursorPosition: 'Ln {{line}}, Col {{column}}',
  livePreview: 'Live Preview',
  clock: '{{time}} · {{zone}}',
  zoneFollowsSystem: 'System time zone',
  openSourceNotice: 'Open source notice',
  openSourceNoticeTitle:
    'Copyright and licence information for the open source software included in this product',
} satisfies LocaleBundleShape<typeof statusbarKo>;