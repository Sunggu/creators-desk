import { SUPPORTED_LOCALES, type LocaleCode } from '../../core/domain/locale/locale.dto';
import { createTranslator, findMissingKeys } from '../create-translator';
import type { Translator, TranslationTable } from '../translator.dto';
import { enResources } from './en';
import { koResources } from './ko';

/**
 * The baseline bundle. Its key set defines {@link ResourceKey}, so a typo in any
 * `t()` call is a compile error rather than a blank element at runtime.
 */
export type BaselineResources = typeof koResources;

/** Every namespace present in the baseline. */
export type ResourceNamespace = keyof BaselineResources;

/**
 * Union of every legal resource id, e.g. `'sidebar.newNote'` or
 * `'time.past.second'`.
 *
 * Distributes over the namespace union, so a key assembled dynamically - as
 * relative time does, from a tense plus a unit - still has to name a key that
 * actually exists.
 *
 * Derived from the *baseline* bundle, which carries only base forms - so
 * `selectedCount` is legal and `selectedCount_one` is not. That is intentional:
 * call sites pass the base key and `t()` selects the plural variant via
 * `Intl.PluralRules`.
 */
export type ResourceKey<N extends ResourceNamespace = ResourceNamespace> =
  N extends ResourceNamespace ? `${N}.${keyof BaselineResources[N] & string}` : never;

/** Keys safe to pass to `confirm()` / `prompt()` in the browser. */
export type TranslatedText = string;

/** The full catalog: one table per supported locale. */
export const resourceCatalog: Readonly<Record<LocaleCode, TranslationTable>> = {
  ko: koResources,
  en: enResources,
};

/**
 * Verifies locale parity at startup.
 *
 * A partially translated locale is a legitimate shipping state, so this reports
 * rather than throws - each gap already degrades to Korean per key at runtime.
 * Call it once from the app entry point.
 */
export function verifyResourceCoverage(): string[] {
  return findMissingKeys(resourceCatalog);
}

/** Builds a translator bound to `locale`. */
export function createResourceTranslator(locale: LocaleCode): Translator {
  return createTranslator(locale, resourceCatalog);
}

/** Bundles for every locale, exposed for tooling and parity tests. */
export const allResourceBundles = SUPPORTED_LOCALES.map(
  (locale) => [locale, resourceCatalog[locale]] as const,
);