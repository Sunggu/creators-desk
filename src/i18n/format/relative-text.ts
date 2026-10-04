import { describeRelativeTime } from './relative-time';
import type { RelativeTime } from './relative-time';
import type { TranslateFn } from '../translate-fn.dto';
import type { PlaceholderValues } from '../interpolate';

/**
 * Turns a structural {@link RelativeTime} into localized prose.
 *
 * Kept separate from `describeRelativeTime` so that bucketing stays pure and
 * clock-free, while the only piece that knows about `time.past.*` /
 * `time.future.*` resource names is this adapter.
 */
export function translateRelativeTime(
  relative: RelativeTime,
  t: TranslateFn,
): string {
  if (relative.isNow) return t('time.justNow');

  const tense = relative.isFuture ? 'future' : 'past';
  const values: PlaceholderValues = { count: relative.value };

  return t(`time.${tense}.${relative.unit}`, values);
}

/** Convenience wrapper: classify `target` against `reference`, then translate. */
export function formatRelativeTo(
  target: number,
  reference: number,
  t: TranslateFn,
): string {
  return translateRelativeTime(describeRelativeTime(target, reference), t);
}