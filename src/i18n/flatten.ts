import type { TranslationTable } from './translator.dto';

/**
 * Flattens every namespace of a table into `namespace.key` paths.
 *
 * Bundles are flat (grouping lives inside the dotted key name), so this is a
 * plain projection. Kept as a function so locale-parity checks and startup
 * validation share exactly one definition of "all the keys in this table".
 */
export function flattenTable(table: TranslationTable): string[] {
  const paths: string[] = [];

  for (const [namespace, bundle] of Object.entries(table)) {
    for (const key of Object.keys(bundle)) {
      paths.push(`${namespace}.${key}`);
    }
  }

  return paths;
}