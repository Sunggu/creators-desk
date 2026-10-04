import { DEFAULT_LOCALE, type LocaleCode } from '../core/domain/locale/locale.dto';
import { flattenTable } from './flatten';
import {
  interpolate,
  resolvePluralKey,
  type PluralCategory,
  type PlaceholderValues,
} from './interpolate';
import type { Translator, TranslationTable } from './translator.dto';

/**
 * Splits `sidebar.newNote` into namespace and leaf key.
 *
 * Bundles are flat, so the split is purely cosmetic: the leaf name keeps any
 * further dots (`time` + `past.second`), which is why the first dot is the
 * only separator.
 */
function splitKey(key: string): { namespace: string; name: string } | null {
  const separator = key.indexOf('.');
  if (separator <= 0) return null;
  return { namespace: key.slice(0, separator), name: key.slice(separator + 1) };
}

/**
 * Creates a {@link Translator} over a namespace-shaped catalog.
 *
 * Two lookup passes guarantee the UI never renders a raw key:
 *  1. the active locale
 *  2. the baseline locale (Korean)
 *
 * A key absent from both returns the key itself - a visible, greppable defect
 * rather than a blank element or a thrown render.
 */
export function createTranslator(
  locale: LocaleCode,
  catalog: Readonly<Record<LocaleCode, TranslationTable>>,
): Translator {
  const active = catalog[locale];
  const fallback = catalog[DEFAULT_LOCALE];

  const read = (key: string): string | undefined => {
    const path = splitKey(key);
    if (!path) return undefined;
    return active?.[path.namespace]?.[path.name] ?? fallback?.[path.namespace]?.[path.name];
  };

  // Korean has a single plural category, so the base key is always the answer
  // and the lookup can skip Intl entirely.
  const selectCategory =
    locale === DEFAULT_LOCALE
      ? undefined
      : new Intl.PluralRules(locale).select.bind(new Intl.PluralRules(locale));

  const t = (key: string, values?: PlaceholderValues): string =>
    interpolate(resolvePattern(key, values, read, selectCategory) ?? key, values);

  return {
    locale,
    t,
    has: (key: string) => read(key) !== undefined,
  };
}

/**
 * Finds the pattern for `key`, upgrading to the plural variant when a `count`
 * is supplied and the locale needs one.
 */
function resolvePattern(
  key: string,
  values: PlaceholderValues | undefined,
  read: (key: string) => string | undefined,
  selectCategory: ((count: number) => PluralCategory) | undefined,
): string | undefined {
  const count = values?.count;
  if (typeof count !== 'number' || selectCategory === undefined) return read(key);

  const variant = resolvePluralKey(key, selectCategory(count), (candidate) =>
    read(candidate) !== undefined,
  );
  return read(variant) ?? read(key);
}

/**
 * Plural categories each locale needs when a key carries a count.
 * Mirrors what {@link Translator.t} will attempt to resolve.
 */
const REQUIRED_CATEGORIES: Readonly<Record<LocaleCode, PluralCategory[]>> = {
  ko: ['other'],
  en: ['one', 'other'],
};

/** Matches a trailing CLDR plural category suffix. */
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

/**
 * Lists keys a non-baseline locale has not covered.
 *
 * Keys are compared by **plural family** rather than literally, because the
 * baseline (Korean) needs no variants while English does. A family is covered
 * when the locale supplies either the base key or the full set of categories
 * that locale requires - so Korean `{time.past.second}` versus English
 * `{time.past.second_one, time.past.second_other}` reports as complete, not as
 * three gaps.
 *
 * Missing keys are reported rather than thrown: a partially translated locale is
 * a normal shipping state and degrades to Korean per key at runtime. Returns
 * `locale:namespace.key` entries.
 */
export function findMissingKeys(
  catalog: Readonly<Record<LocaleCode, TranslationTable>>,
  baseline: LocaleCode = DEFAULT_LOCALE,
): string[] {
  const reference = catalog[baseline];
  if (!reference) return [];

  const missing: string[] = [];
  const locales = (Object.keys(catalog) as LocaleCode[]).filter((locale) => locale !== baseline);

  for (const [namespace, families] of pluralFamiliesPerNamespace(reference)) {
    for (const locale of locales) {
      const available = new Set(Object.keys(catalog[locale]?.[namespace] ?? {}));
      for (const family of families) {
        if (!coversFamily(available, family, locale)) {
          missing.push(`${locale}:${namespace}.${family}`);
        }
      }
    }
  }

  return missing;
}

/**
 * Distinct plural families per namespace, as `[namespace, baseNames]`.
 *
 * A family is a key with any `_one`/`_other`-style suffix stripped, so
 * `past.second_one` and `past.second_other` collapse into the single family
 * `past.second` and are counted once.
 */
function pluralFamiliesPerNamespace(table: TranslationTable): Array<[string, string[]]> {
  const byNamespace = new Map<string, Set<string>>();

  for (const path of flattenTable(table)) {
    const namespace = path.slice(0, path.indexOf('.'));
    const family = path.slice(path.indexOf('.') + 1).replace(PLURAL_SUFFIX, '');

    const bucket = byNamespace.get(namespace) ?? new Set<string>();
    bucket.add(family);
    byNamespace.set(namespace, bucket);
  }

  return [...byNamespace.entries()].map(([namespace, names]) => [namespace, [...names]]);
}

/** A family counts as covered by a plain key or by all required variants. */
function coversFamily(
  available: ReadonlySet<string>,
  family: string,
  locale: LocaleCode,
): boolean {
  if (available.has(family)) return true;
  return REQUIRED_CATEGORIES[locale].every((category) =>
    available.has(`${family}_${category}`),
  );
}