/**
 * Locales with a complete resource bundle. The first entry is the baseline:
 * its bundle is the single source of truth for the {@link ResourceKey} union.
 */
export const SUPPORTED_LOCALES = ['ko', 'en'] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

/** Korean - the reference locale for all copy authored in this repository. */
export const DEFAULT_LOCALE: LocaleCode = 'ko';

/** Value injected into `<html lang>` for the baseline locale. */
export const DEFAULT_HTML_LANG = 'ko-KR';