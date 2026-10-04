/**
 * Interpolation placeholder syntax: `{{name}}`.
 *
 * Deliberately brace-delimited so a resource string can still contain literal
 * braces (JSON snippets, code samples) without escaping.
 */
export const PLACEHOLDER_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

/**
 * Values a placeholder may be substituted with. Callers should pass already
 * localized strings for dates/numbers - see `src/i18n/format/*` - so this stays
 * a dumb, lossless substitution.
 */
export type PlaceholderValues = Readonly<Record<string, string | number>>;

/**
 * Substitutes `{{name}}` placeholders.
 *
 * Unknown placeholders are left verbatim rather than blanked, so a missing
 * parameter is visible during development instead of silently producing
 * malformed copy.
 */
export function interpolate(template: string, values?: PlaceholderValues): string {
  if (!values) return template;

  return template.replace(PLACEHOLDER_PATTERN, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * Detects `{name}`-style **plural category suffixes** on a resource key
 * (`sidebar.selected_other`). Categories follow the CLDR vocabulary:
 * `zero`, `one`, `two`, `few`, `many`, `other`.
 */
export const PLURAL_CATEGORY_PATTERN = /^(.+)_(zero|one|two|few|many|other)$/;

export type PluralCategory =
  | 'zero'
  | 'one'
  | 'two'
  | 'few'
  | 'many'
  | 'other';

/**
 * Picks the plural variant of a key for `count` in `locale`.
 *
 * Resolution order:
 *  1. `<key>_<category>` if present in the bundle
 *  2. `<key>_other` if present
 *  3. `<key>` itself
 *
 * Korean only needs the base form, English needs `_one`/`_other`, and languages
 * with more complex rules (`ru`, `pl`, `ar`) work without any code change - only
 * by adding variants to the bundle.
 */
export function resolvePluralKey(
  key: string,
  category: PluralCategory,
  exists: (candidate: string) => boolean,
): string {
  if (exists(`${key}_${category}`)) return `${key}_${category}`;
  if (exists(`${key}_other`)) return `${key}_other`;
  return key;
}