import type { LocaleCode } from '../core/domain/locale/locale.dto';

/**
 * One namespace -> leaf patterns, per locale.
 *
 * Bundles are deliberately **flat**: grouping is expressed with dots inside the
 * key name (`'past.second'`) rather than by nesting objects. Flatness is what
 * keeps the compile-time locale-parity shape a simple mapped type instead of a
 * recursive one, and it means lookup never has to walk a path.
 */
export type TranslationBundle = Readonly<Record<string, string>>;

/** One namespace map, per locale. */
export type TranslationTable = Readonly<Record<string, TranslationBundle>>;

/** The full set of resource bundles keyed by locale. */
export type ResourceCatalog = Readonly<Record<LocaleCode, TranslationTable>>;

/**
 * Minimal surface a UI layer needs to render text.
 *
 * Deliberately tiny and framework-free: no React, no DOM, no `Intl` locale
 * sniffing beyond what is passed in. That keeps it trivially unit-testable and
 * lets the presentation layer stay a pure consumer of this contract.
 */
export interface Translator {
  /** Active locale. */
  readonly locale: LocaleCode;
  /**
   * Looks up `key` and substitutes `values`.
   * Returns the key itself when missing, so a gap is obvious but never crashes.
   */
  t(key: string, values?: Readonly<Record<string, string | number>>): string;
  /** True when `key` exists in the active bundle or the baseline fallback. */
  has(key: string): boolean;
}