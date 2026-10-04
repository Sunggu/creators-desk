import type { PlaceholderValues } from './interpolate';
import type { ResourceKey } from './resources';

/**
 * Translation function with a compile-time-checked key.
 *
 * Narrower than {@link Translator.t}: the key must exist in the baseline
 * bundle, so `t('sidebr.newNote')` fails to compile instead of rendering a
 * literal key. Values are already-localized strings or plain numbers.
 */
export type TranslateFn = (key: ResourceKey, values?: PlaceholderValues) => string;

/** Existence check for a resource key, used for progressive disclosure. */
export type HasResourceFn = (key: ResourceKey) => boolean;