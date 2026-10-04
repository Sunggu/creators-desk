import type { PluralCategory } from './interpolate';

/**
 * Open map of `_zero|_one|_two|_few|_many|_other` suffixed patterns.
 *
 * English needs these; Korean does not, because it has a single plural form.
 */
export type PluralVariantMap = Record<`_${PluralCategory}` & string, string>;

type StripPluralSuffix<K extends string> =
  K extends `${infer Base}_${PluralCategory}` ? Base : K;

type BaseKey<T> = StripPluralSuffix<keyof T & string>;

/**
 * Shape a single non-baseline namespace bundle must satisfy.
 *
 * For each baseline key, the non-baseline locale may supply either the base key
 * or category-suffixed variants (e.g. `_one`, `_other`).
 */
export type LocaleBundleShape<T> = {
  [K in BaseKey<T>]?: string;
} & {
  [K in `${BaseKey<T>}_${PluralCategory}`]?: string;
};
