/**
 * BASELINE BUNDLE - Korean. See `./common.ts` for the baseline contract.
 *
 * Korean separates past from future with a particle and has a single plural
 * category, so each unit needs only a base form. English adds `_one`/`_other`
 * variants (see `./en/time.ts`).
 *
 * Keys are flat, with the tense and unit joined by dots rather than nested, so
 * the shape a locale must satisfy stays a plain non-recursive mapped type. The
 * leading dot also keeps `_` unambiguous: it is reserved for plural categories.
 */
export const timeKo = {
  justNow: '방금',
  'past.second': '{{count}}초 전',
  'past.minute': '{{count}}분 전',
  'past.hour': '{{count}}시간 전',
  'past.day': '{{count}}일 전',
  'past.month': '{{count}}개월 전',
  'past.year': '{{count}}년 전',
  'future.second': '{{count}}초 후',
  'future.minute': '{{count}}분 후',
  'future.hour': '{{count}}시간 후',
  'future.day': '{{count}}일 후',
  'future.month': '{{count}}개월 후',
  'future.year': '{{count}}년 후',
};