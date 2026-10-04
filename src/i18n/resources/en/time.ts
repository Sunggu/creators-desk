import type { LocaleBundleShape } from '../../locale-bundle-shape.dto';
import type { timeKo } from '../ko/time';

/**
 * BASELINE BUNDLE - English. Must satisfy the Korean baseline key-for-key.
 *
 * English needs `_one`/`_other` for every count; `Intl.PluralRules` selects the
 * variant, so no branch in application code is aware of the language in use.
 */
export const timeEn = {
  justNow: 'just now',
  'past.second_one': '{{count}} second ago',
  'past.second_other': '{{count}} seconds ago',
  'past.minute_one': '{{count}} minute ago',
  'past.minute_other': '{{count}} minutes ago',
  'past.hour_one': '{{count}} hour ago',
  'past.hour_other': '{{count}} hours ago',
  'past.day_one': '{{count}} day ago',
  'past.day_other': '{{count}} days ago',
  'past.month_one': '{{count}} month ago',
  'past.month_other': '{{count}} months ago',
  'past.year_one': '{{count}} year ago',
  'past.year_other': '{{count}} years ago',
  'future.second_one': 'in {{count}} second',
  'future.second_other': 'in {{count}} seconds',
  'future.minute_one': 'in {{count}} minute',
  'future.minute_other': 'in {{count}} minutes',
  'future.hour_one': 'in {{count}} hour',
  'future.hour_other': 'in {{count}} hours',
  'future.day_one': 'in {{count}} day',
  'future.day_other': 'in {{count}} days',
  'future.month_one': 'in {{count}} month',
  'future.month_other': 'in {{count}} months',
  'future.year_one': 'in {{count}} year',
  'future.year_other': 'in {{count}} years',
} satisfies LocaleBundleShape<typeof timeKo>;